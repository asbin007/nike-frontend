import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { orderItem, checkKhaltiPaymentStatus, PaymentMethod } from "../../store/orderSlice";
import { IData } from "../../store/orderSlice";
import { clearCart } from "../../store/cartSlice";
import toast from "react-hot-toast";
import BackButton from "../../components/BackButton";
// import { useNavigate } from "react-router-dom"; // Not needed since redirects are handled in orderSlice

const CLOUDINARY_VERSION = "v1750340657";

function Checkout() {
  const { data } = useAppSelector((store) => store.cart);
  const { appliedCoupon } = useAppSelector((store) => store.coupon);
  const dispatch = useAppDispatch();
  
  // Debug cart state
  console.log('🛒 Checkout: Cart state:', { 
    cartData: data, 
    cartLength: data?.length || 0,
    hasItems: data && data.length > 0 
  });
  // const navigate = useNavigate(); // Not needed since redirects are handled in orderSlice
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.COD
  );
  

  const subTotal = data.reduce(
    (total, item) => item.Shoe.price * item.quantity + total,
    0
  );
  
  // Calculate discount amount (same logic as cart)
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    let discount = 0;
    
    switch (appliedCoupon.discountType) {
      case 'percentage':
        discount = (subTotal * appliedCoupon.discountValue) / 100;
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
        
        const eligibleItems = data.filter(item => {
          const itemBrand = item.Shoe.brand || (item.Shoe.name ? item.Shoe.name.split(' ')[0] : 'Unknown');
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
            item.Shoe.price < min.Shoe.price ? item : min
          );
          discount = cheapestItem.Shoe.price;
        }
        break;
    }
    
    return discount;
  };
  
  const discountAmount = calculateDiscount();
  const shippingPrice = 100;
  const total = subTotal + shippingPrice - discountAmount;

  const [item, setItem] = useState<IData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    addressLine: "",
    city: "",
    street: "",
    zipcode: "",
    email: "",
    totalPrice: 0,
    paymentMethod: PaymentMethod.COD,
    Shoe: [],
  });

  // Check for Khalti payment status on component mount
  useEffect(() => {
    const pidx = localStorage.getItem('khalti_pidx');
    if (pidx) {
      // Check payment status after 2 seconds to allow Khalti to process
      const timer = setTimeout(() => {
        dispatch(checkKhaltiPaymentStatus(pidx));
        localStorage.removeItem('khalti_pidx');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [dispatch]);

  const handlePaymentMethod = (paymentData: PaymentMethod) => {
    setPaymentMethod(paymentData);
    setItem((prev) => ({ ...prev, paymentMethod: paymentData }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('🚀 Checkout: Form submitted');
    console.log('🚀 Checkout: Cart data:', data);
    console.log('🚀 Checkout: Form data:', item);

    // Check if cart is empty
    if (!data || data.length === 0) {
      console.log('❌ Checkout: Cart is empty, cannot proceed');
      toast.error("Your cart is empty! Please add items to your cart before checkout", {
        duration: 5000,
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

    // Validate required fields
    if (!item.firstName.trim()) {
      toast.error("Please enter your first name", {
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

    if (!item.lastName.trim()) {
      toast.error("Please enter your last name", {
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

    if (!item.email.trim()) {
      toast.error("Please enter your email address", {
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(item.email)) {
      toast.error("Please enter a valid email address", {
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

    if (!item.phoneNumber.trim()) {
      toast.error("Please enter your phone number", {
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

    // Phone number validation (Nepal format)
    const phoneRegex = /^[9][6-8]\d{8}$/;
    if (!phoneRegex.test(item.phoneNumber.replace(/\s/g, ''))) {
      toast.error("Please enter a valid Nepal phone number (e.g., 9841234567)", {
        duration: 5000,
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

    if (!item.addressLine.trim()) {
      toast.error("Please enter your address", {
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

    if (!item.city.trim()) {
      toast.error("Please enter your city", {
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

    if (!item.street.trim()) {
      toast.error("Please enter your street address", {
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

    if (!item.zipcode.trim()) {
      toast.error("Please enter your zip code", {
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

    // Check minimum order amount
    if (total < 100) {
      toast.error("Minimum order amount is ₹100. Please add more items to your cart", {
        duration: 5000,
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

    // Check if any item is out of stock
    const outOfStockItems = data.filter(item => (item.Shoe as any).totalStock && (item.Shoe as any).totalStock <= 0);
    if (outOfStockItems.length > 0) {
      toast.error(`Some items in your cart are out of stock. Please remove them before checkout`, {
        duration: 6000,
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

    const productData =
      data.length > 0
        ? data.map((item) => ({
            productId: item.Shoe.id,
            productQty: item.quantity,
          }))
        : [];

    const finalData: IData = {
      ...item,
      Shoe: productData,
      totalPrice: total,
    };

    console.log('🚀 Checkout: Sending data to backend:', finalData);
    console.log('🚀 Checkout: Payment method:', finalData.paymentMethod);

    try {
      console.log('🚀 Checkout: Dispatching orderItem...');
      const result = await dispatch(orderItem(finalData));
      console.log('🚀 Checkout: OrderItem result:', result);
      console.log('🚀 Checkout: Result type:', result?.type);
      console.log('🚀 Checkout: Result payload:', result?.payload);
      
      // Check if order was successful - Redux thunk returns different structure
      const isSuccess = result && (
        (result.type && result.type.includes('fulfilled')) ||
        (result.payload && !result.error) ||
        (result.meta && result.meta.requestStatus === 'fulfilled') ||
        (result.type === 'orderItem/fulfilled')
      );
      
      console.log('🔍 Checkout: Success check result:', {
        hasResult: !!result,
        hasType: !!result?.type,
        typeIncludesFulfilled: result?.type?.includes('fulfilled'),
        hasPayload: !!result?.payload,
        hasError: !!result?.error,
        metaRequestStatus: result?.meta?.requestStatus,
        isSuccess: isSuccess,
        fullResult: result
      });
      
      if (isSuccess) {
        console.log('✅ Checkout: Order placed successfully, redirect should happen automatically');
        
        
        // Check if it's COD payment and redirect immediately
        if (finalData.paymentMethod === PaymentMethod.COD) {
          console.log('💰 Checkout: COD payment detected, redirecting to success page immediately');
          setTimeout(() => {
            console.log('🔄 Checkout: Redirecting to /cod-success');
            window.location.href = '/cod-success';
          }, 1000);
        } else {
          // For other payment methods, let orderSlice handle redirect
          console.log('💳 Checkout: Non-COD payment, letting orderSlice handle redirect');
        }
        
        // Clear cart after successful order
        dispatch(clearCart());
      } else {
        console.log('❌ Checkout: Order placement failed or was rejected');
        console.log('❌ Checkout: Full result object:', JSON.stringify(result, null, 2));
        
        const errorMessage = result?.error || result?.payload?.message || "Failed to place order. Please try again.";
        toast.error(errorMessage, {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#dc2626",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: "8px",
          },
        });
      }
    } catch (error) {
      console.error('❌ Checkout: Error in order placement:', error);
      console.error('❌ Checkout: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
      
      const errorMessage = error instanceof Error ? error.message : "Failed to place order. Please try again.";
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
    }
    
    // Note: COD redirect is handled in orderSlice.ts
    // Khalti redirect is also handled in orderSlice.ts
  };

  // Show empty cart message if no items
  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checkout</p>
          <a 
            href="/collections" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="font-[sans-serif] bg-white">
      <div className="px-3 sm:px-4 pt-4 sm:pt-6">
        <BackButton />
      </div>
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-12 h-full">
        <div className="bg-gray-100 lg:h-screen lg:sticky lg:top-0 lg:min-w-[370px] sm:min-w-[300px]">
          <div className="relative h-full">
            <div className="px-3 sm:px-4 py-6 sm:py-8 lg:overflow-auto lg:h-[calc(100vh-60px)]">
              <div className="space-y-3 sm:space-y-4">
                {data.length > 0 ? (
                  data.map((item) => (
                    <div className="flex items-start gap-3 sm:gap-4" key={item.id}>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-28 flex p-2 sm:p-3 shrink-0 bg-gray-200 rounded-md">
                        <img
                              src={`https://res.cloudinary.com/dxpe7jikz/image/upload/${CLOUDINARY_VERSION}${item.Shoe?.images?.[0]?.replace(
                            "/uploads",
                            ""
                          ) || '/placeholder-image.svg'}.jpg`}
                          className="w-full object-contain"
                        />
                      </div>
                      <div className="w-full">
                        <h3 className="text-xs sm:text-sm lg:text-base text-gray-800">
                          {item.Shoe.name}
                        </h3>
                        <ul className="text-xs text-gray-800 space-y-1 mt-2 sm:mt-3">
                          <li className="flex flex-wrap gap-2 sm:gap-4">
                            Quantity{" "}
                            <span className="ml-auto">{item?.quantity}</span>
                          </li>
                          <li className="flex flex-wrap gap-2 sm:gap-4">
                            Total Price{" "}
                            <span className="ml-auto">
                              Rs.{item?.Shoe?.price}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No Items</p>
                )}
              </div>
            </div>
            <div className="lg:absolute lg:left-0 lg:bottom-0 bg-gray-200 w-full p-3 sm:p-4">
              <h4 className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm lg:text-base text-gray-800">
                Total <span className="ml-auto">Rs.{total}</span>
              </h4>
            </div>
          </div>
        </div>
        <div className="max-w-4xl w-full h-max rounded-md px-3 sm:px-4 py-6 sm:py-8 lg:sticky lg:top-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Complete your order
          </h2>
          <form className="mt-6 sm:mt-8" onSubmit={handleSubmit}>
            <div>
              <h3 className="text-xs sm:text-sm lg:text-base text-gray-800 mb-3 sm:mb-4">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="text"
                  name="firstName"
                  onChange={handleChange}
                  placeholder="First Name"
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-xs sm:text-sm rounded-md"
                />
                <input
                  type="text"
                  name="lastName"
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-xs sm:text-sm rounded-md"
                />
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="Email"
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-xs sm:text-sm rounded-md"
                />
                <input
                  type="number"
                  name="phoneNumber"
                  onChange={handleChange}
                  placeholder="Phone No."
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-xs sm:text-sm rounded-md"
                />
              </div>
            </div>
            <div className="mt-6 sm:mt-8">
              <h3 className="text-xs sm:text-sm lg:text-base text-gray-800 mb-3 sm:mb-4">
                Shipping Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="text"
                  name="addressLine"
                  onChange={handleChange}
                  placeholder="Address Line"
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-xs sm:text-sm rounded-md"
                />
                <input
                  type="text"
                  name="city"
                  onChange={handleChange}
                  placeholder="City"
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-xs sm:text-sm rounded-md"
                />
                <input
                  type="text"
                  name="street"
                  onChange={handleChange}
                  placeholder="Street"
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-xs sm:text-sm rounded-md"
                />
                <input
                  type="text"
                  name="state"
                  onChange={handleChange}
                  placeholder="State"
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-xs sm:text-sm rounded-md"
                />
                <input
                  type="text"
                  name="zipcode"
                  onChange={handleChange}
                  placeholder="Zip Code"
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 text-xs sm:text-sm rounded-md"
                />
                <div>
                  <label htmlFor="paymentMethod" className="text-xs sm:text-sm">Payment Method: </label>
                  <select
                    id="paymentMethod"
                    onChange={(e) =>
                      handlePaymentMethod(e.target.value as PaymentMethod)
                    }
                    className="mt-1 px-3 sm:px-4 py-2 rounded-md bg-gray-100 text-xs sm:text-sm w-full"
                  >
                    <option value={PaymentMethod.COD}>COD</option>
                    <option value={PaymentMethod.Khalti}>Khalti</option>
                    {/* <option value={PaymentMethod.Esewa}>Esewa</option> Temporarily disabled */}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-4 flex-col sm:flex-row mt-6 sm:mt-8">
                {paymentMethod === PaymentMethod.COD && (
                  <button
                    type="submit"
                    className="rounded-md px-3 sm:px-4 py-2 sm:py-2.5 w-full text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Pay on COD
                  </button>
                )}
                {paymentMethod === PaymentMethod.Khalti && (
                  <button
                    type="submit"
                    className="rounded-md px-3 sm:px-4 py-2 sm:py-2.5 w-full text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Pay with Khalti
                  </button>
                )}
                {/* {paymentMethod === PaymentMethod.Esewa && (
                  <button
                    type="submit"
                    className="rounded-md px-3 sm:px-4 py-2 sm:py-2.5 w-full text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white"
                  >
                    Pay with Esewa
                  </button>
                )} */} {/* Temporarily disabled */}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
