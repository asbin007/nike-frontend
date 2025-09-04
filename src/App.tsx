import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import Register from "./pages/user/Register";
import Login from "./pages/user/Login";
import ForgotPassword from "./pages/user/ForgotPassword";
import ResetPassword from "./pages/user/ResetPassword";
import Navbar from "./globals/components/Navbar";
import Home from "./pages/Home/Home";
import ProductFilters from "./pages/product/components/ProductFilters";
import ProductDetail from "./pages/singleProduct/ProductDetail";
import Collections from "./pages/product/Collection/Collections";
import MyCart from "./pages/cart/MyCart";
import Checkout from "./pages/checkout/Checkout";
import io from "socket.io-client";
import MyOrder from "./pages/order/MyOrders";
import MyOrderDetails from "./pages/order/MyOrderDetaills";
import { useEffect } from "react";
import { useAppDispatch } from "./store/hooks";
import { loadUserFromStorage } from "./store/authSlice";
import { checkKhaltiPaymentStatus, updateOrderStatusinSlice, updatePaymentStatusinSlice, refreshOrders, listenForAdminUpdates } from "./store/orderSlice";
import { OrderStatus, PaymentStatus } from "./pages/order/types";
import SearchProducts from "./pages/product/SearchProducts";
import Wishlist from "./pages/wishlist/Wishlist";
import ProductComparison from "./pages/comparison/ProductComparison";
import ChatWidget from "./components/ChatWidget";
import Recommended from "./pages/recommendations/Recommended";

// Add version for deployment tracking
const APP_VERSION = "1.0.2";

// Improved socket configuration
export const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("tokenauth"),
  },
  transports: ['websocket', 'polling'],
  timeout: 20000,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  forceNew: true,
  autoConnect: false, // Don't auto-connect, we'll connect manually
});

// Enhanced socket connection event listeners
socket.on("connect", () => {
  console.log("✅ Socket connected successfully:", socket.id);
  toast.success("Real-time updates connected");
});

socket.on("connect_error", (error: Error) => {
  console.error("❌ Socket connection error:", error);
  toast.error("Real-time connection failed. Using manual refresh.");
  
  // Try to reconnect after 5 seconds
  setTimeout(() => {
    if (!socket.connected) {
      console.log("🔄 Attempting to reconnect socket...");
      socket.connect();
    }
  }, 5000);
});

socket.on("disconnect", (reason: string) => {
  console.log("🔌 Socket disconnected:", reason);
  toast.error("Real-time connection lost. Using manual refresh.");
  
  if (reason === "io server disconnect") {
    // Server disconnected us, try to reconnect
    socket.connect();
  }
});

socket.on("reconnect", (attemptNumber: number) => {
  console.log("✅ Socket reconnected after", attemptNumber, "attempts");
  toast.success("Real-time connection restored");
});

socket.on("reconnect_error", (error: Error) => {
  console.error("❌ Socket reconnection error:", error);
});

socket.on("reconnect_failed", () => {
  console.error("❌ Socket reconnection failed after all attempts");
  toast.error("Real-time connection failed. Please refresh manually.");
});

socket.on("error", (error: Error) => {
  console.error("❌ Socket error:", error);
});

// Component to conditionally render navbar
const AppContent = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Log version for deployment tracking
  useEffect(() => {
    console.log(`Nike Frontend App Version: ${APP_VERSION}`);
  }, []);

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Check for Khalti payment verification on app load
  useEffect(() => {
    const pidx = localStorage.getItem('khalti_pidx');
    if (pidx) {
      console.log('Found pidx in localStorage (App):', pidx);
      dispatch(checkKhaltiPaymentStatus(pidx));
      localStorage.removeItem('khalti_pidx');
    }
  }, [dispatch]);

  // Enhanced socket connection and event listeners
  useEffect(() => {
    const token = localStorage.getItem("tokenauth");
    
    // Connect socket if token exists
    if (token && !socket.connected) {
      console.log("🔌 Connecting socket with token:", token);
      socket.connect();
    }
    
    // Enhanced WebSocket event listeners for real-time updates
    const handleOrderStatusUpdate = (data: { status: string; userId: string; orderId: string }) => {
      console.log("🔄 Frontend: Order status update received:", data);
      try {
        dispatch(updateOrderStatusinSlice({
          status: data.status as OrderStatus,
          userId: data.userId,
          orderId: data.orderId
        }));
        toast.success(`Order status updated to: ${data.status}`);
      } catch (error) {
        console.error("Error updating order status:", error);
        // Fallback to manual refresh
        dispatch(refreshOrders());
      }
    };

    const handlePaymentStatusUpdate = (data: { status: string; orderId: string; paymentId: string }) => {
      console.log("🔄 Frontend: Payment status update received:", data);
      try {
        dispatch(updatePaymentStatusinSlice({
          status: data.status as PaymentStatus,
          orderId: data.orderId,
          paymentId: data.paymentId
        }));
        toast.success(`Payment status updated to: ${data.status}`);
      } catch (error) {
        console.error("Error updating payment status:", error);
        // Fallback to manual refresh
        dispatch(refreshOrders());
      }
    };

    // Listen for multiple event names that backend might emit
    const addEventListeners = () => {
      if (socket.connected) {
        // Order status events
        socket.on("statusUpdated", handleOrderStatusUpdate);
        socket.on("orderStatusUpdated", handleOrderStatusUpdate);
        socket.on("orderUpdated", handleOrderStatusUpdate);
        socket.on("orderStatusChange", handleOrderStatusUpdate);
        
        // Payment status events
        socket.on("paymentStatusUpdated", handlePaymentStatusUpdate);
        socket.on("paymentUpdated", handlePaymentStatusUpdate);
        socket.on("paymentStatusChange", handlePaymentStatusUpdate);
        
        // General order events
        socket.on("orderChange", () => {
          console.log("🔄 Order change detected, refreshing orders...");
          dispatch(refreshOrders());
        });
        
        // Debug: Log all incoming events
        const originalEmit = socket.emit;
        socket.emit = function(eventName: string, ...args: unknown[]) {
          console.log(`📤 Frontend emitting event: ${eventName}`, args);
          return originalEmit.apply(this, [eventName, ...args]);
        };
        
        console.log("✅ Frontend: WebSocket event listeners added");
      } else {
        console.warn("⚠️ Frontend: Socket not connected, cannot add event listeners");
      }
    };

    // Add listeners immediately if connected
    addEventListeners();
    
    // Add listeners when socket connects
    socket.on("connect", addEventListeners);
    
    // Check connection every 30 seconds and reconnect if needed
    const checkSocketConnection = () => {
      if (!socket.connected && token) {
        console.log("🔄 Socket disconnected, attempting to reconnect...");
        socket.connect();
      }
    };
    
    const interval = setInterval(checkSocketConnection, 30000);
    
    // Auto-refresh orders every 2 minutes as fallback
    const autoRefreshInterval = setInterval(() => {
      if (!socket.connected) {
        console.log("🔄 Auto-refreshing orders (fallback - socket disconnected)");
        dispatch(refreshOrders());
      }
    }, 120000);
    
    // Set up admin update listeners
    const cleanupAdminListeners = dispatch(listenForAdminUpdates());
    
    return () => {
      clearInterval(interval);
      clearInterval(autoRefreshInterval);
      if (cleanupAdminListeners) cleanupAdminListeners();
      socket.off("connect", addEventListeners);
      socket.off("statusUpdated", handleOrderStatusUpdate);
      socket.off("orderStatusUpdated", handleOrderStatusUpdate);
      socket.off("orderUpdated", handleOrderStatusUpdate);
      socket.off("orderStatusChange", handleOrderStatusUpdate);
      socket.off("paymentStatusUpdated", handlePaymentStatusUpdate);
      socket.off("paymentUpdated", handlePaymentStatusUpdate);
      socket.off("paymentStatusChange", handlePaymentStatusUpdate);
      socket.off("orderChange");
    };
  }, [dispatch]);

  // Check if current route is auth page
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Toaster />
      <ChatWidget />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/all-shoes" element={<ProductFilters />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Other routes */}
        <Route path="/:collection/:brand/:id" element={<ProductDetail />} />
        <Route path="/:collection/:brand" element={<ProductFilters />} />
        <Route path="/:collection" element={<ProductFilters />} />
        <Route path="/search" element={<SearchProducts />} />

        <Route path="/collection" element={<Collections />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/my-cart" element={<MyCart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrder />} />
        <Route path="/my-orders/:id" element={<MyOrderDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/comparison" element={<ProductComparison />} />
        <Route path="/recommended" element={<Recommended initialTab='personalized' showTabs={true} />} />
        <Route path="/trending" element={<Recommended initialTab='trending' showTabs={false} titleOverride='Trending Products' />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
