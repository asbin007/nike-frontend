import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'b2g1';
  discountValue: number;
  minSpend: number;
  maxDiscount: number;
  validUntil: string;
  category?: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}

interface CouponState {
  availableCoupons: Coupon[];
  appliedCoupon: Coupon | null;
  couponHistory: Coupon[];
  error: string | null;
}

// Helper function to get date 1 month from now
const getValidUntilDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

const initialState: CouponState = {
  availableCoupons: [
    {
      id: 'coupon-1',
      code: 'DASHAIN50',
      title: 'Dashain Dhamaka Sale',
      description: 'Up to 50% off on all Nike products',
      discountType: 'percentage',
      discountValue: 50,
      minSpend: 5000,
      maxDiscount: 10000,
      validUntil: getValidUntilDate(),
      category: 'Nike',
      isActive: true,
      usageLimit: 1000,
      usedCount: 0
    },
    {
      id: 'coupon-2',
      code: 'TIHARB2G1',
      title: 'Tihar Twinkle Deals',
      description: 'Buy 2 Get 1 Free on Adidas',
      discountType: 'b2g1',
      discountValue: 100,
      minSpend: 8000,
      maxDiscount: 15000,
      validUntil: getValidUntilDate(),
      category: 'Adidas',
      isActive: true,
      usageLimit: 500,
      usedCount: 0
    },
    {
      id: 'coupon-3',
      code: 'FESTIVAL15',
      title: 'Festival Flash Sale',
      description: 'Extra 15% off on Puma products',
      discountType: 'percentage',
      discountValue: 15,
      minSpend: 3000,
      maxDiscount: 5000,
      validUntil: getValidUntilDate(),
      category: 'Puma',
      isActive: true,
      usageLimit: 2000,
      usedCount: 0
    }
  ],
  appliedCoupon: null,
  couponHistory: [],
  error: null
};

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    applyCoupon: (state, action: PayloadAction<{ code: string; cartTotal: number; items: any[] }>) => {
      const { code, cartTotal, items } = action.payload;
      
      // Find the coupon
      const coupon = state.availableCoupons.find(c => 
        c.code.toUpperCase() === code.toUpperCase() && c.isActive
      );
      
      if (!coupon) {
        state.error = 'Invalid coupon code. Please check the code and try again';
        return;
      }
      
      // Check if coupon is expired
      if (new Date() > new Date(coupon.validUntil)) {
        state.error = 'This coupon has expired. Please use a valid coupon code';
        return;
      }
      
      // Check minimum spend
      if (cartTotal < coupon.minSpend) {
        state.error = `Minimum spend of रु${coupon.minSpend.toLocaleString()} required. Add रु${(coupon.minSpend - cartTotal).toLocaleString()} more to use this coupon`;
        return;
      }
      
      // Check category restrictions
      if (coupon.category) {
        console.log('🔍 Coupon validation debug:', {
          couponCategory: coupon.category,
          items: items.map(item => ({
            id: item.id,
            name: item.name || (item.Shoe && item.Shoe.name),
            brand: item.brand || (item.Shoe && item.Shoe.brand),
            hasBrand: !!(item.brand || (item.Shoe && item.Shoe.brand))
          }))
        });
        
        const hasValidBrand = items.some(item => {
          const itemBrand = item.brand || (item.Shoe && item.Shoe.brand);
          
          // Normalize brand names for comparison
          const normalizeBrand = (brand: string) => {
            if (!brand) return '';
            return brand.toLowerCase()
              .replace(/\s+/g, '') // Remove spaces
              .replace(/[^a-z0-9]/g, ''); // Remove special characters
          };
          
          // Brand mapping for different naming conventions
          const getBrandVariants = (brand: string) => {
            const normalized = normalizeBrand(brand);
            const variants = [normalized];
            
            // Add common brand variants
            if (normalized.includes('nike') || normalized.includes('airmax') || normalized.includes('jordan')) {
              variants.push('nike', 'airmax', 'jordan');
            }
            if (normalized.includes('adidas') || normalized.includes('yeezy') || normalized.includes('boost')) {
              variants.push('adidas', 'yeezy', 'boost');
            }
            if (normalized.includes('puma') || normalized.includes('suede') || normalized.includes('rs')) {
              variants.push('puma', 'suede', 'rs');
            }
            
            return [...new Set(variants)]; // Remove duplicates
          };
          
          const itemBrandVariants = getBrandVariants(itemBrand);
          const couponBrandVariants = getBrandVariants(coupon.category || '');
          
          // Check if any variants match
          const brandMatch = itemBrandVariants.some(itemVariant => 
            couponBrandVariants.some(couponVariant => 
              itemVariant.includes(couponVariant) || 
              couponVariant.includes(itemVariant) ||
              itemVariant === couponVariant
            )
          );
          
          console.log('🔍 Checking item brand:', {
            itemName: item.name || (item.Shoe && item.Shoe.name),
            itemBrand,
            couponCategory: coupon.category,
            itemBrandVariants,
            couponBrandVariants,
            matches: brandMatch
          });
          
          return brandMatch;
        });
        
        if (!hasValidBrand) {
          state.error = `This coupon is only valid for ${coupon.category} products`;
          return;
        }
      }
      
      // Check usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        state.error = 'Coupon usage limit reached';
        return;
      }
      
      // Apply coupon
      state.appliedCoupon = coupon;
      state.error = null;
      
      // Add to history
      if (!state.couponHistory.find(c => c.id === coupon.id)) {
        state.couponHistory.push(coupon);
      }
    },
    
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.error = null;
    },
    
    clearCouponError: (state) => {
      state.error = null;
    },
    
    calculateDiscount: (state, action: PayloadAction<{ cartTotal: number; items: any[] }>) => {
      if (!state.appliedCoupon) return;
      
      const { cartTotal, items } = action.payload;
      const coupon = state.appliedCoupon;
      
      let discount = 0;
      
      switch (coupon.discountType) {
        case 'percentage':
          discount = (cartTotal * coupon.discountValue) / 100;
          discount = Math.min(discount, coupon.maxDiscount);
          break;
          
        case 'fixed':
          discount = coupon.discountValue;
          break;
          
        case 'b2g1':
          // Buy 2 Get 1 Free logic
          const normalizeBrand = (brand: string) => {
            if (!brand) return '';
            return brand.toLowerCase()
              .replace(/\s+/g, '') // Remove spaces
              .replace(/[^a-z0-9]/g, ''); // Remove special characters
          };
          
          const getBrandVariants = (brand: string) => {
            const normalized = normalizeBrand(brand);
            const variants = [normalized];
            
            // Add common brand variants
            if (normalized.includes('nike') || normalized.includes('airmax') || normalized.includes('jordan')) {
              variants.push('nike', 'airmax', 'jordan');
            }
            if (normalized.includes('adidas') || normalized.includes('yeezy') || normalized.includes('boost')) {
              variants.push('adidas', 'yeezy', 'boost');
            }
            if (normalized.includes('puma') || normalized.includes('suede') || normalized.includes('rs')) {
              variants.push('puma', 'suede', 'rs');
            }
            
            return [...new Set(variants)]; // Remove duplicates
          };
          
          const eligibleItems = items.filter(item => {
            const itemBrand = item.brand || (item.Shoe && item.Shoe.brand);
            const itemBrandVariants = getBrandVariants(itemBrand);
            const couponBrandVariants = getBrandVariants(coupon.category || '');
            
            return itemBrandVariants.some(itemVariant => 
              couponBrandVariants.some(couponVariant => 
                itemVariant.includes(couponVariant) || 
                couponVariant.includes(itemVariant) ||
                itemVariant === couponVariant
              )
            );
          });
          if (eligibleItems.length >= 2) {
            const cheapestItem = eligibleItems.reduce((min, item) => 
              item.price < min.price ? item : min
            );
            discount = cheapestItem.price;
          }
          break;
      }
      
      // Store calculated discount in state if needed
      // This reducer doesn't need to return a value, just update state
    }
  }
});

export const { 
  applyCoupon, 
  removeCoupon, 
  clearCouponError, 
  calculateDiscount 
} = couponSlice.actions;

export default couponSlice.reducer;
