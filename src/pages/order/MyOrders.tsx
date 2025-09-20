import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {  Link } from "react-router-dom";
import { getSocket } from "../../App";
import {
  fetchMyOrders,
  updateOrderStatusinSlice,
  updatePaymentStatusinSlice,
  checkKhaltiPaymentStatus,
  refreshOrders,
} from "../../store/orderSlice";
import { Package, Search, Clock, CheckCircle, XCircle, Truck, CreditCard, Eye, RefreshCw, Wifi, WifiOff, Calendar } from "lucide-react";
import { OrderStatus, PaymentStatus } from "./types";
import { OrderSkeleton } from "../../components/SkeletonLoader";
import toast from "react-hot-toast";

function MyOrder() {
  try {
    const dispatch = useAppDispatch();
    const { items, status } = useAppSelector((store) => store.orders);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleManualRefresh = () => {
    dispatch(refreshOrders());
    setLastUpdate(new Date());
    toast.success("Orders refreshed manually");
  };

    // Only process data if items is available and is an array
    const newItems = (items && Array.isArray(items)) ? items.filter(
      (item) =>
        item.id?.toLowerCase().includes(searchTerm) ||
        item.orderStatus?.toLowerCase().includes(searchTerm) ||
        item.Payment?.paymentMethod?.toLowerCase().includes(searchTerm) ||
        item.totalPrice == parseInt(searchTerm)
    ) : [];

    const filteredItems = selectedStatus === "all" 
      ? newItems 
      : newItems.filter(item => item.orderStatus === selectedStatus);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        console.log('🔄 MyOrders: Fetching orders...');
        await dispatch(fetchMyOrders());
        setIsInitialLoad(false);
        
        // Check for Khalti payment verification on page load
        const pidx = localStorage.getItem('khalti_pidx');
        if (pidx) {
          console.log('Found pidx in localStorage:', pidx);
          dispatch(checkKhaltiPaymentStatus(pidx));
          localStorage.removeItem('khalti_pidx');
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        setIsInitialLoad(false);
      }
    };
    
    loadOrders();
    
    // Auto-refresh orders every 60 seconds for real-time updates
    const autoRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing orders (60s interval)');
      dispatch(refreshOrders());
      setLastUpdate(new Date());
    }, 60000);
    
    // Cleanup interval on unmount
    return () => clearInterval(autoRefreshInterval);
  }, [dispatch]);
  
  // Socket event listeners for real-time updates
  useEffect(() => {
    const handleStatusUpdate = (data: { status: string; userId: string; orderId: string }) => {
      console.log("🔄 MyOrders: Order status update received:", data);
      try {
        dispatch(updateOrderStatusinSlice({
          status: data.status as OrderStatus,
          userId: data.userId,
          orderId: data.orderId
        }));
        
        setLastUpdate(new Date());
        toast.success(`Order status updated to: ${data.status}`);
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("Failed to update order status");
        // Fallback to manual refresh
        dispatch(refreshOrders());
      }
    };

    const handlePaymentStatusUpdate = (data: { status: string; orderId: string; paymentId: string }) => {
      console.log("🔄 MyOrders: Payment status update received:", data);
      try {
        dispatch(updatePaymentStatusinSlice({
          status: data.status as PaymentStatus,
          orderId: data.orderId,
          paymentId: data.paymentId
        }));
        
        setLastUpdate(new Date());
        toast.success(`Payment status updated to: ${data.status}`);
      } catch (error) {
        console.error("Error updating payment status:", error);
        toast.error("Failed to update payment status");
        // Fallback to manual refresh
        dispatch(refreshOrders());
      }
    };

    // Add event listeners function
    const addEventListeners = () => {
      const socketInstance = getSocket();
      if (socketInstance?.connected) {
        // Order status events
        socketInstance.on("statusUpdated", handleStatusUpdate);
        socketInstance.on("orderStatusUpdated", handleStatusUpdate);
        socketInstance.on("orderUpdated", handleStatusUpdate);
        socketInstance.on("orderStatusChange", handleStatusUpdate);
        
        // Payment status events
        socketInstance.on("paymentStatusUpdated", handlePaymentStatusUpdate);
        socketInstance.on("paymentUpdated", handlePaymentStatusUpdate);
        socketInstance.on("paymentStatusChange", handlePaymentStatusUpdate);
        
        // General order events
        socketInstance.on("orderChange", () => {
          console.log("🔄 Order change detected, refreshing orders...");
          dispatch(refreshOrders());
          setLastUpdate(new Date());
        });
        
        console.log("✅ MyOrders: WebSocket event listeners added");
        setIsSocketConnected(true);
      } else {
        console.warn("⚠️ MyOrders: Socket not connected, cannot add event listeners");
        setIsSocketConnected(false);
      }
    };

    // Add listeners when socket connects
    const socketInstance = getSocket();
    if (socketInstance) {
      socketInstance.on("connect", () => {
        console.log("🔌 MyOrders: Socket connected, adding event listeners...");
        addEventListeners();
        setIsSocketConnected(true);
      });
      
      // Add listeners immediately if already connected
      if (socketInstance.connected) {
        console.log("🔌 MyOrders: Socket already connected, adding event listeners immediately...");
        addEventListeners();
        setIsSocketConnected(true);
      }
      
      socketInstance.on("disconnect", () => {
        setIsSocketConnected(false);
      });
    }

    // Cleanup function
    return () => {
      const socketInstance = getSocket();
      if (socketInstance) {
        socketInstance.off("connect", addEventListeners);
        socketInstance.off("disconnect");
        socketInstance.off("statusUpdated", handleStatusUpdate);
        socketInstance.off("orderStatusUpdated", handleStatusUpdate);
        socketInstance.off("orderUpdated", handleStatusUpdate);
        socketInstance.off("orderStatusChange", handleStatusUpdate);
        socketInstance.off("paymentStatusUpdated", handlePaymentStatusUpdate);
        socketInstance.off("paymentUpdated", handlePaymentStatusUpdate);
        socketInstance.off("paymentStatusChange", handlePaymentStatusUpdate);
        socketInstance.off("orderChange");
        console.log("🔄 MyOrders: Socket event listeners removed");
      }
    };
  }, [dispatch]);

  // Show skeleton during initial load or when data is not available
  if (isInitialLoad || items === null || items === undefined || status === 'loading') {
    return <OrderSkeleton />;
  }

  // Safety check - if items is not an array, show error
  if (!Array.isArray(items)) {
    console.error("❌ MyOrders: items is not an array:", items);
    console.error("❌ MyOrders: status:", status);
    console.error("❌ MyOrders: error:", "Unknown error");
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Package className="w-16 h-16 text-red-400" />
              <h2 className="text-2xl font-bold text-gray-800">Error Loading Orders</h2>
              <p className="text-gray-600">There was an issue loading your orders. Please try again.</p>
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                  <p className="text-sm text-red-600">Error: Failed to load orders</p>
                </div>
              )}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    console.log("🔄 Manual retry triggered");
                    setIsInitialLoad(true);
                    dispatch(fetchMyOrders());
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Retry</span>
                </button>
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Refresh Page</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if items is empty but we're still loading
  if (items.length === 0 && !isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Package className="w-16 h-16 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-800">No Orders Found</h2>
              <p className="text-gray-600">You haven't placed any orders yet.</p>
              <button
                onClick={handleManualRefresh}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Refresh Orders</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case OrderStatus.Pending.toLowerCase():
        return { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100", borderColor: "border-yellow-200" };
      case OrderStatus.Preparation.toLowerCase():
        return { icon: Package, color: "text-blue-600", bgColor: "bg-blue-100", borderColor: "border-blue-200" };
      case OrderStatus.Ontheway.toLowerCase():
        return { icon: Truck, color: "text-purple-600", bgColor: "bg-purple-100", borderColor: "border-purple-200" };
      case OrderStatus.Delivered.toLowerCase():
        return { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100", borderColor: "border-green-200" };
      case OrderStatus.Cancelled.toLowerCase():
        return { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100", borderColor: "border-red-200" };
      default:
        return { icon: Clock, color: "text-gray-600", bgColor: "bg-gray-100", borderColor: "border-gray-200" };
    }
  };

  const getPaymentStatusInfo = (status: string | undefined) => {
    switch (status) {
      case "paid":
        return { color: "text-green-600", bgColor: "bg-green-100" };
      case "unpaid":
        return { color: "text-red-600", bgColor: "bg-red-100" };
      default:
        return { color: "text-gray-600", bgColor: "bg-gray-100" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Orders</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Track and manage your orders</p>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-2">
                  <div className={`flex items-center space-x-1 ${isSocketConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isSocketConnected ? <Wifi className="w-3 h-3 sm:w-4 sm:h-4" /> : <WifiOff className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="text-xs sm:text-sm font-medium">
                      {isSocketConnected ? 'Real-time connected' : 'Manual mode'}
                    </span>
                  </div>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full lg:w-80">
              <div className="relative">
                <input
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  placeholder="Search orders..."
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                />
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium">Refresh</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
            {["all", ...Object.values(OrderStatus)].map((status) => {
              const statusInfo = status === "all" 
                ? { icon: Package, color: "text-gray-600", bgColor: "bg-gray-100" }
                : getStatusInfo(status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-300 text-xs sm:text-sm ${
                    selectedStatus === status
                      ? `${statusInfo.bgColor} ${statusInfo.color} border-current`
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium capitalize">{status}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              Order History
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Order Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => {
                    const statusInfo = getStatusInfo(item.orderStatus);
                    const paymentStatusInfo = getPaymentStatusInfo(item.Payment?.paymentStatus);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <tr 
                        key={item.id} 
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <Link to={`/my-orders/${item.id}`} onClick={() => console.log("🔍 Navigating to order details:", item.id)}>
                            <p className="font-semibold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer">
                              #{item.id}
                            </p>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-800">
                                {item.createdAt 
                                  ? new Date(item.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  : (item as any).orderDate
                                    ? new Date((item as any).orderDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })
                                    : "Loading..."
                                }
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.createdAt 
                                  ? new Date(item.createdAt).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : (item as any).orderDate
                                    ? new Date((item as any).orderDate).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : ""
                                }
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                            <span className={`text-sm font-medium capitalize ${statusInfo.color}`}>
                              {item.orderStatus || (item as any).status || "Processing"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            Rs. {item.totalPrice?.toLocaleString() || (item as any).price?.toLocaleString() || "0"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 capitalize">
                              {item.Payment?.paymentMethod || (item as any).paymentMethod || "Not specified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${paymentStatusInfo.bgColor} ${paymentStatusInfo.color}`}>
                            {item.Payment?.paymentStatus || (item as any).paymentStatus || "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/my-orders/${item.id}`} onClick={() => console.log("🔍 View button clicked for order:", item.id)}>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm font-medium">View</span>
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <Package className="w-16 h-16 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            {searchTerm || selectedStatus !== "all" ? "No orders found" : "No orders yet"}
                          </h3>
                          <p className="text-gray-500">
                            {searchTerm || selectedStatus !== "all" 
                              ? "Try adjusting your search or filter criteria" 
                              : "Start shopping to see your orders here"
                            }
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Cards */}
        {filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-800">{filteredItems.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-800">
                    Rs. {filteredItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {filteredItems.filter(item => item.orderStatus?.toLowerCase() === OrderStatus.Delivered.toLowerCase()).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {filteredItems.filter(item => item.orderStatus?.toLowerCase() === OrderStatus.Pending.toLowerCase()).length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  } catch (error) {
    console.error("❌ Error in MyOrder component:", error);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">Something went wrong loading the orders page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

export default MyOrder;
