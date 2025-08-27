import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { deleteCart, updateCart } from "../../store/cartSlice";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { CartSkeleton } from "../../components/SkeletonLoader";
import CouponInput from "../../components/CouponInput";

function MyCart() {
  const { data } = useAppSelector((store) => store.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleUpdate = (productId: string, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateCart(productId, quantity));
    }
  };

  const handleDelete = (productId: string) => {
    dispatch(deleteCart(productId));
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
  const total = subTotal + shippingPrice;

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
  <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-4">Shopping Cart</h1>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Cart Items */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-4 mb-4 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr>
                    <th className="text-left font-semibold pb-2">Product</th>
                    <th className="text-left font-semibold pb-2">Price</th>
                    <th className="text-left font-semibold pb-2">Quantity</th>
                    <th className="text-left font-semibold pb-2">Total</th>
                    <th className="text-left font-semibold pb-2">Action</th>
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
                      <tr key={item.Shoe.id} className="border-t">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <img
                              className="h-16 w-16 object-cover rounded"
                              src={imageUrl}
                              alt={item.Shoe.name}
                            />
                            <span className="font-medium text-sm">
                              {item.Shoe.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-sm">रु{item.Shoe.price}</td>
                        <td className="py-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <button
                              className="border rounded-md py-1 px-3"
                              onClick={() =>
                                handleUpdate(item.Shoe.id, item.quantity - 1)
                              }
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              className="border rounded-md py-1 px-3"
                              onClick={() =>
                                handleUpdate(item.Shoe.id, item.quantity + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-sm">
                                Rs{item.Shoe.price * item.quantity}
                        </td>
                        <td className="py-4">
                          <button
                            className="bg-red-600 hover:bg-red-800 text-white py-1 px-3 rounded-md text-sm"
                            onClick={() => handleDelete(item.Shoe.id)}
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
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Summary</h2>
              <div className="flex justify-between mb-2 text-sm">
                <span>Subtotal</span>
                <span>Rs {subTotal}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Total Qty</span>
                <span>{totalQtyInCarts}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span>Shipping</span>
                <span>रु{shippingPrice}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between mb-2 text-base font-semibold">
                <span>Total</span>
                <span>रु{total}</span>
              </div>
              <Link to="/checkout">
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg mt-4 w-full">
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
