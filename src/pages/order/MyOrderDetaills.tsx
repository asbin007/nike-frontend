import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useEffect, useState } from "react";
import { cancelOrderAPI, fetchMyOrderDetails, updateOrderStatusinSlice, updatePaymentStatusinSlice } from "../../store/orderSlice";
import { IOrderDetail, OrderStatus, PaymentStatus } from "./types";
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin, Phone, User, Calendar } from "lucide-react";
import { getSocket } from "../../App";
const CLOUDINARY_VERSION = "v1750340657"; 

function MyOrderDetail() {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { orderDetails } = useAppSelector((store) => store.orders);
  const [isLoading, setIsLoading] = useState(true);

  // Debug logging
  console.log("🔍 MyOrderDetails Debug:", {
    id,
    orderDetails,
    isLoading,
    orderDetailsLength: orderDetails?.length
  });

  useEffect(() => {
    console.log("🔍 MyOrderDetails useEffect triggered:", { id });
    if (id) {
      console.log("🔍 Fetching order details for ID:", id);
      dispatch(fetchMyOrderDetails(id));
      setIsLoading(false);
    } else {
      console.error("❌ No order ID found in URL parameters");
    }
  }, [id, dispatch]);





  // Simple WebSocket event listeners for real-time updates
  useEffect(() => {
    const handleStatusUpdate = (data: { status: OrderStatus; userId: string; orderId: string }) => {
      console.log("Status update received in details:", data);
      if (data.orderId === id) {
        dispatch(updateOrderStatusinSlice({
          status: data.status,
          userId: data.userId,
          orderId: data.orderId
        }));
      }
    };

    const handlePaymentStatusUpdate = (data: { status: PaymentStatus | string; orderId: string; paymentId: string }) => {
      console.log("Payment status update received in details:", data);
      if (data.orderId === id) {
        dispatch(updatePaymentStatusinSlice({
          status: data.status as PaymentStatus,
          orderId: data.orderId,
          paymentId: data.paymentId
        }));
      }
    };

    // Add event listeners
    const socketInstance = getSocket();
    if (socketInstance) {
      socketInstance.on("statusUpdated", handleStatusUpdate);
      socketInstance.on("paymentStatusUpdated", handlePaymentStatusUpdate);
    }

    // Cleanup function
    return () => {
      const socketInstance = getSocket();
      if (socketInstance) {
        socketInstance.off("statusUpdated", handleStatusUpdate);
        socketInstance.off("paymentStatusUpdated", handlePaymentStatusUpdate);
      }
    };
  }, [dispatch, id]);

  const cancelOrder = () => {
    if (id) {
      dispatch(cancelOrderAPI(id));
    }
  };

  // Get status icon and color with realistic ecommerce flow
  const getStatusInfo = (status: string) => {
    switch (status) {
      case OrderStatus.Pending:
        return { 
          icon: Clock, 
          color: "text-yellow-600", 
          bgColor: "bg-yellow-100",
          description: "Order received, waiting for payment confirmation"
        };
      case OrderStatus.Preparation:
        return { 
          icon: Package, 
          color: "text-blue-600", 
          bgColor: "bg-blue-100",
          description: "Order is being prepared for shipment"
        };
      case OrderStatus.Ontheway:
        return { 
          icon: Truck, 
          color: "text-purple-600", 
          bgColor: "bg-purple-100",
          description: "Order is on the way to your location"
        };
      case OrderStatus.Delivered:
        return { 
          icon: CheckCircle, 
          color: "text-green-600", 
          bgColor: "bg-green-100",
          description: "Order has been delivered successfully"
        };
      case OrderStatus.Cancelled:
        return { 
          icon: XCircle, 
          color: "text-red-600", 
          bgColor: "bg-red-100",
          description: "Order has been cancelled"
        };
      default:
        return { 
          icon: Clock, 
          color: "text-gray-600", 
          bgColor: "bg-gray-100",
          description: "Order status unknown"
        };
    }
  };

  // Get payment status info with realistic descriptions
  const getPaymentStatusInfo = (status: string | undefined) => {
    switch (status) {
      case "paid":
        return { 
          icon: CheckCircle, 
          color: "text-green-600", 
          bgColor: "bg-green-100", 
          text: "Paid",
          description: "Payment completed successfully"
        };
      case "unpaid":
        return { 
          icon: XCircle, 
          color: "text-red-600", 
          bgColor: "bg-red-100", 
          text: "Unpaid",
          description: "Payment pending or failed"
        };
      default:
        return { 
          icon: Clock, 
          color: "text-gray-600", 
          bgColor: "bg-gray-100", 
          text: "Pending",
          description: "Payment status unknown"
        };
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 md:px-6 2xl:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no order found
  if (!orderDetails || orderDetails.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 md:px-6 2xl:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <p className="text-sm text-gray-500">
              Order ID: {id || "N/A"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const order = orderDetails[0] as IOrderDetail;
  const customer = (order as IOrderDetail)?.Order as IOrderDetail['Order'];
  const statusInfo = getStatusInfo(customer?.orderStatus || "");
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 2xl:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                  Order #{order?.orderId || "N/A"}
                </h1>
                <div className="flex items-center space-x-2 mt-1 sm:mt-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  <p className="text-sm sm:text-base text-gray-600">
                    {(() => {
                      // Safely parse and display date
                      const dateStr =
                        (order?.Order && typeof order.Order === 'object' && 'createdAt' in order.Order
                          ? (order.Order as { createdAt?: string }).createdAt
                          : undefined) ||
                        order?.createdAt;
                      if (!dateStr) return "N/A";
                      try {
                        const date = new Date(dateStr);
                        if (isNaN(date.getTime())) return "Invalid Date";
                        return date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      } catch {
                        return "N/A";
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
              {/* Order Status Badge */}
              <div className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full ${statusInfo.bgColor}`}>
                <StatusIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${statusInfo.color}`} />
                <div className="flex flex-col">
                  <span className={`font-semibold text-xs sm:text-sm ${statusInfo.color}`}>
                    {customer?.orderStatus || "N/A"}
                  </span>
                  <span className={`text-xs ${statusInfo.color} opacity-75`}>
                    {statusInfo.description}
                  </span>
                </div>
              </div>
              
              {/* Payment Status Badge */}
              {order?.Order?.Payment && (() => {
                const paymentStatusInfo = getPaymentStatusInfo(order.Order.Payment.paymentStatus);
                const PaymentStatusIcon = paymentStatusInfo.icon;
                return (
                  <div className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full ${paymentStatusInfo.bgColor}`}>
                    <PaymentStatusIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${paymentStatusInfo.color}`} />
                    <div className="flex flex-col">
                      <span className={`font-semibold text-xs sm:text-sm ${paymentStatusInfo.color}`}>
                        {paymentStatusInfo.text}
                      </span>
                      <span className={`text-xs ${paymentStatusInfo.color} opacity-75`}>
                        {paymentStatusInfo.description}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  Customer's Cart
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                {orderDetails.map((od, index) => (
                  <div
                    key={od.id}
                    className={`flex flex-col md:flex-row items-start space-y-3 sm:space-y-4 md:space-y-0 md:space-x-4 sm:md:space-x-6 p-3 sm:p-4 rounded-xl border ${
                      index !== orderDetails.length - 1 ? 'border-b border-gray-200 mb-3 sm:mb-4' : ''
                    } hover:bg-gray-50 transition-colors`}
                  >
                                        <div className="flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-36 xl:w-40">
                      {(() => {
                        // MyCart logic: use first image, strip /uploads, append .jpg
                        const imgs = od?.Shoe?.images as unknown;
                        const first = Array.isArray(imgs) ? imgs[0] as string : (typeof imgs === 'string' ? imgs : '');
                        if (!first) {
                          return (
                            <div className="w-full h-32 bg-gray-200 rounded-xl flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          );
                        }
                        let imageUrl = '';
                        const trimmed = first.trim();
                        if (trimmed.startsWith('//')) {
                          imageUrl = `https:${trimmed}`;
                        } else if (trimmed.startsWith('http')) {
                          imageUrl = trimmed;
                        } else {
                          // Remove 'uploads' with or without leading slash
                          let clean = trimmed.replace(/\/?uploads/i, '');
                          // Ensure leading slash
                          if (!clean.startsWith('/')) clean = '/' + clean;
                          // If path already has an extension, don't append another
                          const hasExt = /\.(jpg|jpeg|png|webp)$/i.test(clean);
                          imageUrl = `https://res.cloudinary.com/dxpe7jikz/image/upload/${CLOUDINARY_VERSION}${clean}${hasExt ? '' : '.jpg'}`;
                        }

                        return (
                          <div className="relative group">
                            <img
                              className="w-full h-24 sm:h-28 md:h-32 lg:h-36 xl:h-40 object-cover rounded-xl shadow-md transition-shadow"
                              src={imageUrl}
                              alt={od?.Shoe?.name || 'Product Image'}
                              onError={(e) => {
                                const src = e.currentTarget.src;
                                if (/\.jpg$/i.test(src)) {
                                  e.currentTarget.src = src.replace(/\.jpg$/i, '.png');
                                } else {
                                  e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                }
                              }}
                              loading="lazy"
                            />
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div className="flex-1 space-y-2 sm:space-y-3">
                      <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
                          {od?.Shoe?.name || "N/A"}
                        </h3>
                        <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center">
                            <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {od?.Shoe?.Category?.categoryName || "N/A"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 sm:px-6 py-3 sm:py-4">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Order Summary
                  </h3>
                </div>
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm sm:text-base text-gray-600">Subtotal</span>
                    <span className="font-semibold text-sm sm:text-base">Rs. {orderDetails.reduce((sum, od) => sum + (od?.quantity * od?.Shoe?.price || 0), 0)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm sm:text-base text-gray-600">Shipping</span>
                    <span className="font-semibold text-sm sm:text-base">Rs. 100.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-base sm:text-lg font-bold text-gray-800">Total</span>
                    <span className="text-base sm:text-lg font-bold text-blue-600">Rs. {order?.Order?.totalPrice || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 sm:px-6 py-3 sm:py-4">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Shipping Info
                  </h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <img
                        className="w-6 h-6 sm:w-8 sm:h-8"
                        alt="DPD Delivery"
                        src="https://i.ibb.co/L8KSdNQ/image-3.png"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-gray-800">DPD Delivery</p>
                      <p className="text-xs sm:text-sm text-gray-600">Delivery within 24 Hours</p>
                    </div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg">
                    <p className="text-base sm:text-lg font-bold text-purple-600">Rs 100.00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-4 sm:top-8">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 sm:px-6 py-3 sm:py-4">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Customer Details
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Customer Info */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-gray-800">
                        {customer?.firstName || "N/A"} {customer?.lastName || "N/A"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">Full Name</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-gray-800">{customer?.phoneNumber || "N/A"}</p>
                      <p className="text-xs sm:text-sm text-gray-600">Phone Number</p>
                    </div>
                  </div>

                  {/* Email not present in type; hide unless backend adds it */}
                  
                  <div className="flex items-start space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mt-1" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-gray-800">Shipping Address</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {customer?.addressLine || "N/A"}, {customer?.street || "N/A"}, {customer?.city || "N/A"}, {customer?.state || "N/A"} {customer?.zipcode ? `(ZIP: ${customer?.zipcode})` : ""}
                      </p>
                    </div>
                  </div>
                  
                  {/* Payment Information */}
                  {order?.Order?.Payment && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-5 h-5 text-gray-600">
                          {order?.Order?.Payment?.paymentMethod === 'khalti' && (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          )}
                          {order?.Order?.Payment?.paymentMethod === 'cod' && (
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {order?.Order?.Payment?.paymentMethod === 'khalti' ? 'Khalti Payment' : 
                             order?.Order?.Payment?.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                             order?.Order?.Payment?.paymentMethod}
                          </p>
                          <p className="text-sm text-gray-600">Payment Method</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-5 h-5 text-gray-600">
                          {order?.Order?.Payment?.paymentStatus === 'paid' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {order?.Order?.Payment?.paymentStatus === 'paid' ? 'Payment Completed' : 'Payment Pending'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order?.Order?.Payment?.paymentStatus === 'paid' 
                              ? 'Your payment has been processed successfully' 
                              : order?.Order?.Payment?.paymentMethod === 'cod' 
                                ? 'Payment will be collected on delivery'
                                : 'Please complete your payment to proceed'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cancel Order Button with realistic validation */}
                {order?.Order?.orderStatus !== OrderStatus.Cancelled && 
                 order?.Order?.orderStatus !== OrderStatus.Delivered && (
                  <button
                    onClick={() => {
                      // Check if order can be cancelled
                      const currentStatus = order?.Order?.orderStatus;
                      if (currentStatus === OrderStatus.Preparation || currentStatus === OrderStatus.Ontheway) {
                        alert('Cannot cancel order that is already in preparation or on the way. Please contact customer support.');
                        return;
                      }
                      cancelOrder();
                    }}
                    disabled={order?.Order?.orderStatus === OrderStatus.Preparation || 
                             order?.Order?.orderStatus === OrderStatus.Ontheway}
                    className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base ${
                      order?.Order?.orderStatus === OrderStatus.Preparation || 
                      order?.Order?.orderStatus === OrderStatus.Ontheway
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>
                      {order?.Order?.orderStatus === OrderStatus.Preparation || 
                       order?.Order?.orderStatus === OrderStatus.Ontheway
                        ? 'Cannot Cancel (In Progress)'
                        : 'Cancel Order'
                      }
                    </span>
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