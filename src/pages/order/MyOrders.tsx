import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {  Link } from "react-router-dom";
import { socket } from "../../App";
import {
  fetchMyOrders,
  updateOrderStatusinSlice,
  updatePaymentStatusinSlice,
  checkKhaltiPaymentStatus,
  refreshOrders,
} from "../../store/orderSlice";
import { Package, Search, Clock, CheckCircle, XCircle, Truck, CreditCard, Eye, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { OrderStatus, PaymentStatus } from "./types";
import { OrderSkeleton } from "../../components/SkeletonLoader";
import toast from "react-hot-toast";

function MyOrder() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((store) => store.orders);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const newItems = items.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm) ||
      item.orderStatus?.toLowerCase().includes(searchTerm) ||
      item.Payment?.paymentMethod.toLowerCase().includes(searchTerm) ||
      item.totalPrice == parseInt(searchTerm)
  );

  const filteredItems = selectedStatus === "all" 
    ? newItems 
    : newItems.filter(item => item.orderStatus === selectedStatus);

  useEffect(() => {
    dispatch(fetchMyOrders());
    
    // Check for Khalti payment verification on page load
    const pidx = localStorage.getItem('khalti_pidx');
    if (pidx) {
      console.log('Found pidx in localStorage:', pidx);
      dispatch(checkKhaltiPaymentStatus(pidx));
      localStorage.removeItem('khalti_pidx');
    }
    
    // Auto-refresh orders every 60 seconds for real-time updates
    const autoRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing orders (60s interval)');
      dispatch(refreshOrders());
      setLastUpdate(new Date());
    }, 60000);
    
    // Cleanup interval on unmount
    return () => clearInterval(autoRefreshInterval);
  }, [dispatch]);
  
  useEffect(() => {
    // Update socket connection status
    const updateConnectionStatus = () => {
      setIsSocketConnected(socket.connected);
    };
    
    updateConnectionStatus();
    
    // Socket event listeners for real-time updates
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
      if (socket.connected) {
        // Order status events
        socket.on("statusUpdated", handleStatusUpdate);
        socket.on("orderStatusUpdated", handleStatusUpdate);
        socket.on("orderUpdated", handleStatusUpdate);
        socket.on("orderStatusChange", handleStatusUpdate);
        
        // Payment status events
        socket.on("paymentStatusUpdated", handlePaymentStatusUpdate);
        socket.on("paymentUpdated", handlePaymentStatusUpdate);
        socket.on("paymentStatusChange", handlePaymentStatusUpdate);
        
        // General order events
        socket.on("orderChange", () => {
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

    // Add listeners immediately if connected
    addEventListeners();
    
    // Add listeners when socket connects
    socket.on("connect", () => {
      addEventListeners();
      setIsSocketConnected(true);
    });
    
    socket.on("disconnect", () => {
      setIsSocketConnected(false);
    });

    // Cleanup function
    return () => {
      socket.off("connect", addEventListeners);
      socket.off("disconnect");
      socket.off("statusUpdated", handleStatusUpdate);
      socket.off("orderStatusUpdated", handleStatusUpdate);
      socket.off("orderUpdated", handleStatusUpdate);
      socket.off("orderStatusChange", handleStatusUpdate);
      socket.off("paymentStatusUpdated", handlePaymentStatusUpdate);
      socket.off("paymentUpdated", handlePaymentStatusUpdate);
      socket.off("paymentStatusChange", handlePaymentStatusUpdate);
      socket.off("orderChange");
      console.log("🔄 MyOrders: Socket event listeners removed");
    };
  }, [dispatch]);

  // Show skeleton while loading
  if (!items || items.length === 0) {
    return <OrderSkeleton />;
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

  const handleManualRefresh = () => {
    dispatch(refreshOrders());
    setLastUpdate(new Date());
    toast.success("Orders refreshed manually");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
                <p className="text-gray-600 mt-1">Track and manage your orders</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className={`flex items-center space-x-1 ${isSocketConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isSocketConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {isSocketConnected ? 'Real-time connected' : 'Manual mode'}
                    </span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-full lg:w-80">
              <div className="relative">
                <input
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Search orders..."
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              className="flex items-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="font-medium">Refresh</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="mt-6 flex flex-wrap gap-2">
            {["all", ...Object.values(OrderStatus)].map((status) => {
              const statusInfo = status === "all" 
                ? { icon: Package, color: "text-gray-600", bgColor: "bg-gray-100" }
                : getStatusInfo(status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                    selectedStatus === status
                      ? `${statusInfo.bgColor} ${statusInfo.color} border-current`
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <StatusIcon className="w-4 h-4" />
                  <span className="font-medium capitalize">{status}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Package className="w-6 h-6 mr-2" />
              Order History
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Order ID
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
                          <Link to={`/my-orders/${item.id}`}>
                            <p className="font-semibold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer">
                              #{item.id}
                            </p>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                            <span className={`text-sm font-medium capitalize ${statusInfo.color}`}>
                              {item.orderStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            Rs. {item.totalPrice?.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 capitalize">
                              {item.Payment?.paymentMethod}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${paymentStatusInfo.bgColor} ${paymentStatusInfo.color}`}>
                            {item.Payment?.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/my-orders/${item.id}`}>
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
                    <td colSpan={6} className="px-6 py-12 text-center">
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
}

export default MyOrder;
