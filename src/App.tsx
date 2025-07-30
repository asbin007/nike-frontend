import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
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
import { checkKhaltiPaymentStatus } from "./store/orderSlice";
import SearchProducts from "./pages/product/SearchProducts";
import Wishlist from "./pages/wishlist/Wishlist";
import ProductComparison from "./pages/comparison/ProductComparison";
import ChatWidget from "./components/ChatWidget";

export const socket = io("http://localhost:5001", {
  auth: {
    token: localStorage.getItem("tokenauth"),
  },
  transports: ['websocket', 'polling'],
  timeout: 20000,
});

// Socket connection event listeners
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (error: Error) => {
  console.error("Socket connection error:", error);
});

socket.on("error", (error: Error) => {
  console.error("Socket error:", error);
});
const App = () => {
  const dispatch = useAppDispatch();


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

  // Reconnect socket when token changes
  useEffect(() => {
    const token = localStorage.getItem("tokenauth");
    if (token && !socket.connected) {
      console.log("Reconnecting socket with token:", token);
      socket.connect();
    }
  }, []);
    return (
    <BrowserRouter>
      <Navbar />

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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
