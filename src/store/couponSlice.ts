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
      validUntil: '2025-10-20',
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
      validUntil: '2025-11-05',
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
      validUntil: '2025-10-30',
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
        state.error = 'Invalid coupon code';
        return;
      }
      
      // Check if coupon is expired
      if (new Date() > new Date(coupon.validUntil)) {
        state.error = 'Coupon has expired';
        return;
      }
      
      // Check minimum spend
      if (cartTotal < coupon.minSpend) {
        state.error = `Minimum spend of रु${coupon.minSpend.toLocaleString()} required`;
        return;
      }
      
      // Check category restrictions
      if (coupon.category && !items.some(item => item.brand === coupon.category)) {
        state.error = `This coupon is only valid for ${coupon.category} products`;
        return;
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
          const eligibleItems = items.filter(item => item.brand === coupon.category);
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
