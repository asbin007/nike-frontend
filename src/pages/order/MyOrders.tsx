import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {  Link } from "react-router-dom";
import { socket } from "../../App";
import {
  fetchMyOrders,
  updateOrderStatusinSlice,
  updatePaymentStatusinSlice,
  checkKhaltiPaymentStatus,
} from "../../store/orderSlice";
import { Package, Search, Clock, CheckCircle, XCircle, Truck, CreditCard, Eye } from "lucide-react";
import { OrderStatus } from "./types";
import { OrderSkeleton } from "../../components/SkeletonLoader";

function MyOrder() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((store) => store.orders);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

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

  // Show skeleton while loading
  if (!items || items.length === 0) {
    return <OrderSkeleton />;
  }

  useEffect(() => {
    dispatch(fetchMyOrders());
    
    // Check for Khalti payment verification on page load
    const pidx = localStorage.getItem('khalti_pidx');
    if (pidx) {
      console.log('Found pidx in localStorage:', pidx);
      dispatch(checkKhaltiPaymentStatus(pidx));
      localStorage.removeItem('khalti_pidx');
    }
  }, [dispatch]);
  
  useEffect(() => {
    // Socket event listeners for real-time updates
    const handleStatusUpdate = (data: any) => {
      console.log("Status update received:", data);
      dispatch(updateOrderStatusinSlice({
        status: data.status,
        userId: data.userId,
        orderId: data.orderId
      }));
    };

    const handlePaymentStatusUpdate = (data: any) => {
      console.log("Payment status update received:", data);
      dispatch(updatePaymentStatusinSlice({
        status: data.status,
        orderId: data.orderId,
        paymentId: data.paymentId
      }));
    };

    // Add event listeners
    socket.on("statusUpdated", handleStatusUpdate);
    socket.on("paymentStatusUpdated", handlePaymentStatusUpdate);

    // Cleanup function
    return () => {
      socket.off("statusUpdated", handleStatusUpdate);
      socket.off("paymentStatusUpdated", handlePaymentStatusUpdate);
    };
  }, [dispatch]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case OrderStatus.Pending:
        return { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100", borderColor: "border-yellow-200" };
      case OrderStatus.Preparation:
        return { icon: Package, color: "text-blue-600", bgColor: "bg-blue-100", borderColor: "border-blue-200" };
      case OrderStatus.Ontheway:
        return { icon: Truck, color: "text-purple-600", bgColor: "bg-purple-100", borderColor: "border-purple-200" };
      case OrderStatus.Delivered:
        return { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100", borderColor: "border-green-200" };
      case OrderStatus.Cancelled:
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
                    {filteredItems.filter(item => item.orderStatus === OrderStatus.Delivered).length}
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
                    {filteredItems.filter(item => item.orderStatus === OrderStatus.Pending).length}
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
