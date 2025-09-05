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
export const socket = io("https://nike-backend-1-g9i6.onrender.com", {
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
  console.log("🔌 Socket transport:", (socket.io as any).engine?.transport?.name || 'unknown');
  toast.success("Real-time updates connected");
});

socket.on("connect_error", (error: any) => {
  console.error("❌ Socket connection error:", error);
  console.error("❌ Error details:", {
    message: error.message,
    description: error.description || 'Unknown error',
    context: error.context || 'Socket connection',
    type: error.type || 'ConnectionError'
  });
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
  console.log("🔌 Disconnect details:", {
    reason,
    connected: socket.connected,
    id: socket.id
  });
  toast.error("Real-time connection lost. Using manual refresh.");
  
  if (reason === "io server disconnect") {
    // Server disconnected us, try to reconnect
    console.log("🔄 Server disconnected, attempting to reconnect...");
    socket.connect();
  }
});

socket.on("reconnect", (attemptNumber: number) => {
  console.log("✅ Socket reconnected after", attemptNumber, "attempts");
  console.log("✅ New socket ID:", socket.id);
  toast.success("Real-time connection restored");
});

socket.on("reconnect_attempt", (attemptNumber: number) => {
  console.log("🔄 Socket reconnection attempt", attemptNumber);
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
  
// Debug: Log all socket events
// Debug all socket events
(socket as any).onAny?.((eventName: string, ...args: unknown[]) => {
  console.log(`🔌 Socket event: ${eventName}`, args);
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
    if (token) {
      if (!socket.connected) {
        console.log("🔌 Connecting socket with token:", token.substring(0, 20) + "...");
        socket.connect();
        
        // Add connection timeout
        const connectionTimeout = setTimeout(() => {
          if (!socket.connected) {
            console.warn("⚠️ Socket connection timeout after 10 seconds");
          }
        }, 10000);
        
        // Clear timeout when connected
        socket.on("connect", () => {
          clearTimeout(connectionTimeout);
        });
      } else {
        console.log("🔌 Socket already connected");
      }
    } else {
      console.log("⚠️ No token found, socket will not connect");
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

    // Backend event handlers
    const handleBackendOrderStatusUpdate = (data: any) => {
      console.log("🔄 Frontend: Backend order status update received:", data);
      console.log("🔄 Frontend: Dispatching updateOrderStatusinSlice with:", {
        status: data.status,
        userId: data.updatedBy || 'admin',
        orderId: data.orderId
      });
      try {
        dispatch(updateOrderStatusinSlice({
          status: data.status as OrderStatus,
          userId: data.updatedBy || 'admin',
          orderId: data.orderId
        }));
        console.log("✅ Frontend: updateOrderStatusinSlice dispatched successfully");
        toast.success(`Order #${data.orderId} status updated to: ${data.status}`);
      } catch (error) {
        console.error("❌ Frontend: Error updating order status from backend:", error);
        dispatch(refreshOrders());
      }
    };

    const handleBackendPaymentStatusUpdate = (data: any) => {
      console.log("💰 Frontend: Backend payment status update received:", data);
      try {
        dispatch(updatePaymentStatusinSlice({
          status: data.status as PaymentStatus,
          orderId: data.orderId || '',
          paymentId: data.paymentId
        }));
        toast.success(`Payment status updated to: ${data.status}`);
      } catch (error) {
        console.error("Error updating payment status from backend:", error);
        dispatch(refreshOrders());
      }
    };

    // Listen for multiple event names that backend might emit
    const addEventListeners = () => {
      if (socket.connected) {
        console.log("🔌 Adding WebSocket event listeners...");
        
        // Remove ALL existing listeners first
        socket.removeAllListeners();
        
        // Add backend event listeners
        socket.on("orderStatusUpdated", handleBackendOrderStatusUpdate);
        socket.on("paymentStatusUpdated", handleBackendPaymentStatusUpdate);
        
        // Add legacy event listeners for compatibility
        socket.on("statusUpdated", handleOrderStatusUpdate);
        socket.on("orderStatusUpdated", handleOrderStatusUpdate);
        socket.on("orderUpdated", handleOrderStatusUpdate);
        socket.on("orderStatusChange", handleOrderStatusUpdate);
        socket.on("paymentStatusUpdated", handlePaymentStatusUpdate);
        socket.on("paymentUpdated", handlePaymentStatusUpdate);
        socket.on("paymentStatusChange", handlePaymentStatusUpdate);
        
        // General order events
        socket.on("orderChange", () => {
          console.log("🔄 Order change detected, refreshing orders...");
          dispatch(refreshOrders());
        });
        
        // Debug: Log all incoming events
        (socket as any).onAny?.((eventName: string, ...args: unknown[]) => {
          console.log(`📥 Frontend received event: ${eventName}`, args);
        });
        
        console.log("✅ Frontend: WebSocket event listeners added successfully");
      } else {
        console.warn("⚠️ Frontend: Socket not connected, cannot add event listeners");
      }
    };

    // Add listeners when socket connects
    socket.on("connect", () => {
      console.log("🔌 Socket connected, adding event listeners...");
      addEventListeners();
    });
    
    // Add listeners immediately if already connected
    if (socket.connected) {
      console.log("🔌 Socket already connected, adding event listeners immediately...");
      addEventListeners();
    }
    
    // Simple connection check - only reconnect if needed
    const checkSocketConnection = () => {
      if (!socket.connected && token) {
        console.log("🔄 Socket disconnected, attempting to reconnect...");
        socket.connect();
      }
    };
    
    const interval = setInterval(checkSocketConnection, 30000); // Check every 30 seconds
    
    // Set up admin update listeners
    const cleanupAdminListeners = dispatch(listenForAdminUpdates());
    
    // Add manual refresh function to window for debugging
    (window as any).refreshOrders = () => {
      console.log("🔄 Manual refresh triggered");
      dispatch(refreshOrders());
    };
    
    (window as any).socketStatus = () => {
      console.log("Socket status:", {
        connected: socket.connected,
        id: socket.id,
        transport: 'websocket' // Simplified for debugging
      });
    };
    
    return () => {
      clearInterval(interval);
      if (cleanupAdminListeners) cleanupAdminListeners();
      
      // Remove all socket listeners
      socket.removeAllListeners();
      
      delete (window as any).refreshOrders;
      delete (window as any).socketStatus;
      
      console.log("🧹 Frontend: WebSocket listeners cleaned up");
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
        <Route path="/search" element={<SearchProducts />} />
        <Route path="/collection" element={<Collections />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/my-cart" element={<MyCart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrder />} />
        <Route path="/my-orders/:id" element={<MyOrderDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/comparison" element={<ProductComparison />} />
        <Route path="/recommended" element={<Recommended />} />
        <Route path="/trending" element={<ProductFilters />} />
        
        {/* Dynamic routes - must be last */}
        <Route path="/:collection/:brand/:id" element={<ProductDetail />} />
        <Route path="/:collection/:brand" element={<ProductFilters />} />
        <Route path="/:collection" element={<ProductFilters />} />
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
