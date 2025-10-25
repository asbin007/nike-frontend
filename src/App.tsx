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
import MyOrderDetail from "./pages/order/MyOrderDetaills";
import { useEffect } from "react";
import { useAppDispatch } from "./store/hooks";
import { loadUserFromStorage } from "./store/authSlice";
import { checkKhaltiPaymentStatus, updateOrderStatusinSlice, updatePaymentStatusinSlice, refreshOrders, listenForAdminUpdates } from "./store/orderSlice";
import { OrderStatus, PaymentStatus } from "./pages/order/types";
import { updateProductStock, updateMultipleProductStock } from "./store/productSlice";
import { updateWishlistItemStock } from "./store/wishlistSlice";
import SearchProducts from "./pages/product/SearchProducts";
import Wishlist from "./pages/wishlist/Wishlist";
import ProductComparison from "./pages/comparison/ProductComparison";
import AllCollections from "./pages/product/Collection/AllCollections";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import CODSuccess from "./pages/payment/CODSuccess";
import RoleProtection from "./components/RoleProtection";
import ChatWidget from "./components/ChatWidget";

// Add version for deployment tracking
const APP_VERSION = "1.0.2";

// Render backend socket configuration
const RENDER_BACKEND_URL = "https://nike-backend-1-g9i6.onrender.com";
const SOCKET_URL = RENDER_BACKEND_URL;

// Socket configuration
let socket: ReturnType<typeof io> | undefined;

// Helper function to safely use socket
export const getSocket = () => {
  if (!socket) {
    console.warn("Socket not initialized yet");
    return null;
  }
  return socket;
};

// Export socket for use in other components
export { socket };


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

  // Check for Khalti payment verification on app load (fallback for non-payment pages)
  useEffect(() => {
    // Only check localStorage if we're not on the payment success page
    if (window.location.pathname !== '/payment-success') {
      const pidx = localStorage.getItem('khalti_pidx');
      if (pidx) {
        console.log('Found pidx in localStorage (App fallback):', pidx);
        dispatch(checkKhaltiPaymentStatus(pidx));
        localStorage.removeItem('khalti_pidx');
      }
    }
  }, [dispatch]);

  // Socket connection and event listeners
  useEffect(() => {
    const token = localStorage.getItem("tokenauth");
    
    // Only initialize socket if we have a token
    if (!token) {
      console.log("⚠️ No auth token found, skipping socket initialization");
      return;
    }
    
    // Initialize socket if not already done
    if (!socket) {
      try {
        console.log("🔌 Initializing socket connection to:", SOCKET_URL);
        socket = io(SOCKET_URL, {
          auth: {
            token: token,
          },
          transports: ['websocket', 'polling'],
          timeout: 30000,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 2000,
          reconnectionDelayMax: 10000,
          forceNew: false,
          autoConnect: true,
          upgrade: true,
          rememberUpgrade: false,
        });
        console.log("✅ Socket initialized successfully");
      } catch (error) {
        console.error("❌ Socket initialization error:", error);
      }

      // Socket event listeners
      socket?.on("connect", () => {
        console.log("✅ Socket connected successfully:", socket?.id);
        toast.success("Real-time updates connected");
      });

      socket?.on("disconnect", (reason: string) => {
        console.log("🔌 Socket disconnected:", reason);
        toast.error("Real-time connection lost");
      });

      socket?.on("error", (error: Error) => {
        console.error("❌ Socket error:", error);
      });

      // Order status updates
      socket?.on("orderStatusUpdated", (data: { status: string; updatedBy?: string; orderId: string }) => {
        console.log("🔄 Frontend: Order status update received:", data);
        try {
          dispatch(updateOrderStatusinSlice({
            status: data.status as OrderStatus,
            userId: data.updatedBy || 'admin',
            orderId: data.orderId
          }));
          
          // Show toast for order status update
          const statusEmoji = {
            'pending': '⏳',
            'confirmed': '✅',
            'processing': '🔄',
            'shipped': '🚚',
            'delivered': '📦',
            'cancelled': '❌',
            'returned': '↩️'
          };
          
          const emoji = statusEmoji[data.status as keyof typeof statusEmoji] || '📋';
          
          toast.success(`${emoji} Your order #${data.orderId} status has been updated to: ${data.status}`, {
            duration: 4000,
            position: 'top-right',
            style: {
              background: '#10B981',
              color: '#fff',
              fontWeight: '500',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
          });
          
          toast.success(`Order #${data.orderId} status updated to: ${data.status}`);
        } catch (error) {
          console.error("❌ Frontend: Error updating order status:", error);
          dispatch(refreshOrders());
        }
      });

      // Payment status updates
      socket?.on("paymentStatusUpdated", (data: { status: string; orderId?: string; paymentId: string }) => {
        console.log("💰 Frontend: Payment status update received:", data);
        try {
          dispatch(updatePaymentStatusinSlice({
            status: data.status as PaymentStatus,
            orderId: data.orderId || '',
            paymentId: data.paymentId
          }));
          
          // Show toast for payment status update
          const paymentEmoji = {
            'pending': '⏳',
            'completed': '✅',
            'failed': '❌',
            'refunded': '💰',
            'cancelled': '❌'
          };
          
          const emoji = paymentEmoji[data.status as keyof typeof paymentEmoji] || '💳';
          
          toast.success(`${emoji} Your payment status has been updated to: ${data.status}`, {
            duration: 4000,
            position: 'top-right',
            style: {
              background: '#10B981',
              color: '#fff',
              fontWeight: '500',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            },
          });
          
          toast.success(`Payment status updated to: ${data.status}`);
        } catch (error) {
          console.error("Error updating payment status:", error);
          dispatch(refreshOrders());
        }
      });

      // General order events
      socket?.on("orderChange", () => {
        console.log("🔄 Order change detected, refreshing orders...");
        dispatch(refreshOrders());
      });

      // Real-time stock updates
      if (socket) {
        socket.on("stockUpdated", (data: { productId: string; totalStock: number; isStock: boolean }) => {
          console.log("📦 Frontend: Stock update received:", data);
          try {
            dispatch(updateProductStock({
              productId: data.productId,
              totalStock: data.totalStock,
              isStock: data.isStock
            }));
            
            // Also update wishlist stock if item exists
            dispatch(updateWishlistItemStock({
              id: data.productId,
              inStock: data.isStock,
              totalStock: data.totalStock
            }));
            
            // Show toast for stock update
            toast.success(`📦 Product stock has been updated`, {
              duration: 4000,
              position: 'top-right',
              style: {
                background: '#10B981',
                color: '#fff',
                fontWeight: '500',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
            });
            
            toast.success(`Stock updated for product ${data.productId}`);
          } catch (error) {
            console.error("❌ Frontend: Error updating stock:", error);
          }
        });

        // Bulk stock updates
        socket.on("bulkStockUpdated", (data: { productId: string; totalStock: number; isStock: boolean }[]) => {
          console.log("📦 Frontend: Bulk stock update received:", data);
          try {
            dispatch(updateMultipleProductStock(data));
            
            // Also update wishlist stock for all items
            data.forEach(item => {
              dispatch(updateWishlistItemStock({
                id: item.productId,
                inStock: item.isStock,
                totalStock: item.totalStock
              }));
            });
            
            toast.success(`${data.length} products stock updated`);
          } catch (error) {
            console.error("❌ Frontend: Error updating bulk stock:", error);
          }
        });
      }

      // Chat events are now handled only in ChatWidget component to prevent duplicates
    }
    
    // Set up admin update listeners
    const cleanupAdminListeners = dispatch(listenForAdminUpdates());
    
    return () => {
      if (cleanupAdminListeners) cleanupAdminListeners();
      
      // Don't remove all listeners here as it might interfere with ChatWidget
      // Only clean up specific listeners if needed
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
        <Route path="/collections" element={<AllCollections />} />
        <Route path="/my-cart" element={
          <RoleProtection allowedRoles={['customer']}>
            <MyCart />
          </RoleProtection>
        } />
        <Route path="/checkout" element={
          <RoleProtection allowedRoles={['customer']}>
            <Checkout />
          </RoleProtection>
        } />
        <Route path="/my-orders" element={
          <RoleProtection allowedRoles={['customer']}>
            <MyOrder />
          </RoleProtection>
        } />
        <Route path="/my-orders/:id" element={
          <RoleProtection allowedRoles={['customer']}>
            <MyOrderDetail />
          </RoleProtection>
        } />
        <Route path="/wishlist" element={
          <RoleProtection allowedRoles={['customer']}>
            <Wishlist />
          </RoleProtection>
        } />
        <Route path="/comparison" element={
          <RoleProtection allowedRoles={['customer']}>
            <ProductComparison />
          </RoleProtection>
        } />
        <Route path="/trending" element={<ProductFilters />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/cod-success" element={<CODSuccess />} />
        
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
