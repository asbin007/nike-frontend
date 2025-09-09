import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { applyCoupon, removeCoupon, clearCouponError } from '../store/couponSlice';
import { Tag, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CouponInputProps {
  cartTotal: number;
  cartItems: any[];
  className?: string;
}

const CouponInput = ({ cartTotal, cartItems, className = '' }: CouponInputProps) => {
  const dispatch = useAppDispatch();
  const { appliedCoupon, error } = useAppSelector((store) => store.coupon);
  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code', {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    if (couponCode.trim().length < 3) {
      toast.error('Coupon code must be at least 3 characters long', {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    if (cartTotal < 100) {
      toast.error('Minimum order amount of ₹100 required to apply coupon', {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    dispatch(applyCoupon({
      code: couponCode.trim(),
      cartTotal,
      items: cartItems
    }));

    // Clear input after applying
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.success('Coupon removed successfully', {
      duration: 3000,
      position: "top-center",
      style: {
        background: "#10b981",
        color: "#ffffff",
        padding: "12px 16px",
        borderRadius: "8px",
      },
    });
  };

  const handleClearError = () => {
    dispatch(clearCouponError());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  // Calculate discount amount
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    let discount = 0;
    
    switch (appliedCoupon.discountType) {
      case 'percentage':
        discount = (cartTotal * appliedCoupon.discountValue) / 100;
        discount = Math.min(discount, appliedCoupon.maxDiscount);
        break;
        
      case 'fixed':
        discount = appliedCoupon.discountValue;
        break;
        
      case 'b2g1':
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
        
        const eligibleItems = cartItems.filter(item => {
          const itemBrand = item.brand || (item.Shoe && item.Shoe.brand);
          const itemBrandVariants = getBrandVariants(itemBrand);
          const couponBrandVariants = getBrandVariants(appliedCoupon.category || '');
          
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
    
    return discount;
  };

  const discountAmount = calculateDiscount();
  const finalTotal = cartTotal - discountAmount;

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Tag className="h-5 w-5 text-indigo-600" />
        Apply Coupon
      </h3>

      {!appliedCoupon ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={handleApplyCoupon}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              Apply
            </button>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
              <button
                onClick={handleClearError}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Available Coupons */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Available Coupons:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div>
                  <span className="font-mono font-bold text-green-700">DASHAIN50</span>
                  <span className="text-xs text-green-600 ml-2">- 50% off Nike</span>
                </div>
                <span className="text-xs text-green-600">Min: रु5,000</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                <span className="font-mono font-bold text-purple-700">TIHARB2G1</span>
                <span className="text-xs text-purple-600">Buy 2 Get 1 Free Adidas</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="font-mono font-bold text-blue-700">FESTIVAL15</span>
                <span className="text-xs text-blue-600">- 15% off Puma</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Applied Coupon Display */}
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{appliedCoupon.title}</p>
                <p className="text-sm text-green-600">{appliedCoupon.description}</p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="p-1 text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Discount Summary */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">रु{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Discount ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : 'Fixed'}):</span>
              <span className="font-medium">-रु{discountAmount.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className="text-green-600">रु{finalTotal.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You saved रु{discountAmount.toLocaleString()}!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponInput;
