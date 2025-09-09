import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { deleteCart, updateCart } from "../../store/cartSlice";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { CartSkeleton } from "../../components/SkeletonLoader";
import CouponInput from "../../components/CouponInput";

function MyCart() {
  const { data } = useAppSelector((store) => store.cart);
  const { appliedCoupon } = useAppSelector((store) => store.coupon);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleUpdate = (id: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateCart(id, quantity));
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteCart(id));
  };

  const subTotal = data.reduce(
    (total, item) => item.Shoe.price * item.quantity + total,
    0
  );

  const totalQtyInCarts = data.reduce(
    (total, item) => item.quantity + total,
    0
  );

  const shippingPrice = 100;

  // Calculate discount amount
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
          const itemBrand = item.Shoe.brand || item.Shoe.name.split(' ')[0];
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
  const total = subTotal + shippingPrice - discountAmount;

  useEffect(() => {
    if (data.length === 0) {
      toast.error("Your cart is empty. Please add items to proceed.");
      setTimeout(() => navigate("/"), 2000); // redirect after 2s
    }
  }, [data, navigate]);

  // Show skeleton while loading the page
  if (!data || data.length === 0) {
    return <CartSkeleton />;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <h1 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Cart Items */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 overflow-x-auto">
              <table className="w-full min-w-[500px] sm:min-w-[600px]">
                <thead>
                  <tr>
                    <th className="text-left font-semibold pb-2 text-sm sm:text-base">Product</th>
                    <th className="text-left font-semibold pb-2 text-sm sm:text-base">Price</th>
                    <th className="text-left font-semibold pb-2 text-sm sm:text-base">Quantity</th>
                    <th className="text-left font-semibold pb-2 text-sm sm:text-base">Total</th>
                    <th className="text-left font-semibold pb-2 text-sm sm:text-base">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => {
                    const CLOUDINARY_VERSION = "v1750340657";
                    const imageUrl = `https://res.cloudinary.com/dxpe7jikz/image/upload/${CLOUDINARY_VERSION}${item.Shoe.images[0].replace(
                      "/uploads",
                      ""
                    )}.jpg`;

                    return (
                      <tr key={item.id} className="border-t">
                        <td className="py-3 sm:py-4">
                          <div className="flex items-center gap-2">
                            <img
                              className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded"
                              src={imageUrl}
                              alt={item.Shoe.name}
                            />
                            <span className="font-medium text-xs sm:text-sm">
                              {item.Shoe.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 text-xs sm:text-sm">रु{item.Shoe.price}</td>
                        <td className="py-3 sm:py-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                            <button
                              className="border rounded-md py-1 px-2 sm:px-3 text-xs sm:text-sm hover:bg-gray-100"
                              onClick={() => handleUpdate(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="w-6 sm:w-8 text-center text-xs sm:text-sm">
                              {item.quantity}
                            </span>
                            <button
                              className="border rounded-md py-1 px-2 sm:px-3 text-xs sm:text-sm hover:bg-gray-100"
                              onClick={() => handleUpdate(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 text-xs sm:text-sm">
                          Rs{item.Shoe.price * item.quantity}
                        </td>
                        <td className="py-3 sm:py-4">
                          <button
                            className="bg-red-600 hover:bg-red-800 text-white py-1 px-2 sm:px-3 rounded-md text-xs sm:text-sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-500">
                        Your cart is empty.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Summary</h2>
              <div className="flex justify-between mb-2 text-xs sm:text-sm">
                <span>Subtotal</span>
                <span>Rs {subTotal}</span>
              </div>
              <div className="flex justify-between mb-2 text-xs sm:text-sm">
                <span>Total Qty</span>
                <span>{totalQtyInCarts}</span>
              </div>
              <div className="flex justify-between mb-2 text-xs sm:text-sm">
                <span>Shipping</span>
                <span>रु{shippingPrice}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between mb-2 text-xs sm:text-sm text-green-600">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-रु{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <hr className="my-2" />
              <div className="flex justify-between mb-2 text-sm sm:text-base font-semibold">
                <span>Total</span>
                <span>रु{total.toFixed(2)}</span>
              </div>
              <Link to="/checkout">
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg mt-3 sm:mt-4 w-full text-sm sm:text-base">
                  Checkout
                </button>
              </Link>
            </div>
            
            {/* Coupon Input */}
            <div className="mt-4">
              <CouponInput 
                cartTotal={subTotal}
                cartItems={data.map(item => ({
                  id: item.Shoe.id,
                  brand: item.Shoe.name.split(' ')[0], // Extract brand from name
                  price: item.Shoe.price,
                  quantity: item.quantity
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyCart;