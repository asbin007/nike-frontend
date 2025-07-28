import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useEffect, useState } from "react";
import { cancelOrderAPI, fetchMyOrderDetails } from "../../store/orderSlice";
import { OrderStatus } from "./types";
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, User, Calendar } from "lucide-react";
const CLOUDINARY_VERSION = "v1750340657"; 

function MyOrderDetail() {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { orderDetails } = useAppSelector((store) => store.orders);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      dispatch(fetchMyOrderDetails(id));
      setIsLoading(false);
    }
  }, [id, dispatch]);

  const cancelOrder = () => {
    if (id) {
      dispatch(cancelOrderAPI(id));
    }
  };

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case OrderStatus.Pending:
        return { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" };
      case OrderStatus.Processing:
        return { icon: Package, color: "text-blue-600", bgColor: "bg-blue-100" };
      case OrderStatus.Shipped:
        return { icon: Truck, color: "text-purple-600", bgColor: "bg-purple-100" };
      case OrderStatus.Delivered:
        return { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" };
      case OrderStatus.Cancelled:
        return { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" };
      default:
        return { icon: Clock, color: "text-gray-600", bgColor: "bg-gray-100" };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!orderDetails || orderDetails.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">No order details found.</h2>
        </div>
      </div>
    );
  }

  const order = orderDetails[0];
  const statusInfo = getStatusInfo(order?.Order?.orderStatus || "");
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 md:px-6 2xl:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
                  Order #{order?.orderId || "N/A"}
                </h1>
                <div className="flex items-center space-x-2 mt-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-600">
                    {order?.createdAt
                      ? new Date(order?.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${statusInfo.bgColor}`}>
              <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
              <span className={`font-semibold ${statusInfo.color}`}>
                {order?.Order?.orderStatus || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Package className="w-6 h-6 mr-2" />
                  Customer's Cart
                </h2>
              </div>
              <div className="p-6">
                {orderDetails.map((od, index) => (
                  <div
                    key={od.id}
                    className={`flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 p-4 rounded-xl border ${
                      index !== orderDetails.length - 1 ? 'border-b border-gray-200 mb-4' : ''
                    } hover:bg-gray-50 transition-colors`}
                  >
                    <div className="w-full md:w-32 flex-shrink-0">
                      {od?.Shoe?.images ? (
                        <div className="relative group">
                          <img
                            className="w-full h-32 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
                            src={`https://res.cloudinary.com/dxpe7jikz/image/upload/${CLOUDINARY_VERSION}${od?.Shoe?.images[0].replace(
                              "/uploads",
                              ""
                            )}.jpg`}
                            alt={od?.Shoe?.name}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-xl"></div>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-200 rounded-xl flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {od?.Shoe?.name || "N/A"}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            {od?.Shoe?.Category?.categoryName || "N/A"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-gray-600">Price</p>
                          <p className="font-bold text-gray-800">Rs. {od?.Shoe?.price || 0}</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-gray-600">Quantity</p>
                          <p className="font-bold text-gray-800">{od?.quantity || 0}</p>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <p className="text-blue-600">Total</p>
                          <p className="font-bold text-blue-800">Rs. {(od?.quantity * od?.Shoe?.price) || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Order Summary
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">Rs. {orderDetails.reduce((sum, od) => sum + (od?.quantity * od?.Shoe?.price || 0), 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">Rs. 100.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-lg font-bold text-blue-600">Rs. {order?.Order?.totalPrice || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Shipping Info
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <img
                        className="w-8 h-8"
                        alt="DPD Delivery"
                        src="https://i.ibb.co/L8KSdNQ/image-3.png"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">DPD Delivery</p>
                      <p className="text-sm text-gray-600">Delivery within 24 Hours</p>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-lg font-bold text-purple-600">Rs 100.00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Details
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {order?.Order?.firstName || "N/A"} {order?.Order?.lastName || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">Full Name</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">{order?.Order?.phoneNumber || "N/A"}</p>
                      <p className="text-sm text-gray-600">Phone Number</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">Shipping Address</p>
                      <p className="text-sm text-gray-600">
                        {order?.Order?.addressLine || "N/A"}, {order?.Order?.city || "N/A"}, {order?.Order?.state || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cancel Order Button */}
                {order?.Order?.orderStatus !== OrderStatus.Cancelled && (
                  <button
                    onClick={cancelOrder}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Cancel Order</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyOrderDetail;