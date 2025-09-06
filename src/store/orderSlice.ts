import { IOrderDetail, OrderStatus, PaymentStatus } from "../pages/order/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../globals/types/types";
import { APIS } from "../globals/http";
import { AppDispatch } from "./store";
import toast from "react-hot-toast";
import { socket } from "../App";
import { addToPurchaseHistory } from './recommendationsSlice'

interface IProduct {
  productId: string;
  quantity: number;
  totalPrice?: number;
  orderStatus: Status;
  paymentId: string;
  Payment?: {
    pidx?: string; // Make pidx optional
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
  };
}

export interface IOrderItems extends IProduct {
  id: string;
  orderId: string;
}

export interface IOrder {
  status: Status;
  items: IOrderItems[];
  khaltiUrl: string | null;
  orderDetails: IOrderDetail[];
}

export enum PaymentMethod {
  Esewa = "esewa",
  Khalti = "khalti",
  COD = "cod",
}

// Interface for backend API
export interface IBackendProduct {
  productId: string;
  productQty: number;
}

export interface IData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine: string;
  city: string;
  street: string;
  zipcode: string;
  email: string;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  Shoe: IBackendProduct[]; }

const initialState: IOrder = {
  status: Status.LOADING,
  items: [],
  khaltiUrl: null,
  orderDetails: [],
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setItems(state: IOrder, action: PayloadAction<IOrderItems[]>) {
      state.items = action.payload;
    },
    setOrderDetails(state: IOrder, action: PayloadAction<IOrderDetail[]>) {
      state.orderDetails = action.payload;
    },
    setStatus(state: IOrder, action: PayloadAction<Status>) {
      state.status = action.payload;
    },
    setKhaltiUrl(state: IOrder, action: PayloadAction<string>) {
      state.khaltiUrl = action.payload;
    },

    updateKhaltiPaymentStatus(
      state: IOrder,
      action: PayloadAction<{ pidx: string; status: PaymentStatus }>
    ) {
      const { pidx, status } = action.payload;

      const updatedItems = state.items.map(item => {
        if (item.Payment?.pidx === pidx) {
          return {
            ...item,
            Payment: {
              ...item.Payment,
              paymentStatus: status,
            }
          };
        }
        return item;
      });

      const updatedDetails = state.orderDetails.map(detail => {
        if (detail.Order?.Payment?.pidx === pidx) {
          return {
            ...detail,
            Order: {
              ...detail.Order,
              Payment: {
                ...detail.Order.Payment,
                paymentStatus: status,
              }
            }
          };
        }
        return detail;
      });

      state.items = updatedItems;
      state.orderDetails = updatedDetails;
    },

    updateOrderStatusToCancel(
      state: IOrder,
      action: PayloadAction<{ orderId: string }>
    ) {
      const orderId = action.payload.orderId;
      const datas = state.orderDetails.find(
        (order) => order.orderId === orderId
      );
      if (datas && datas.Order) {
        datas.Order.orderStatus = OrderStatus.Cancelled;
      }
    },

    updateOrderStatusinSlice(
      state: IOrder,
      action: PayloadAction<{
        status: OrderStatus;
        userId: string;
        orderId: string;
      }>
    ) {
      const { status, orderId } = action.payload;
      console.log("🔄 Redux: updateOrderStatusinSlice called with:", { status, orderId, userId: action.payload.userId });
      console.log("🔄 Redux: Current state items count:", state.items.length);
      console.log("🔄 Redux: Current state orderDetails count:", state.orderDetails.length);
      
      // Update items array - check both id and orderId
      const updatedItems = state.items.map((order) => {
        if (order.id === orderId || order.orderId === orderId) {
          console.log(`🔄 Redux: Updating order ${order.id} status from ${order.orderStatus} to ${status}`);
          return { ...order, orderStatus: status as unknown as Status };
        }
        return order;
      });
      
      // Update orderDetails array
      const updatedDetails = state.orderDetails.map((detail) => {
        if (detail.orderId === orderId && detail.Order) {
          console.log(`🔄 Redux: Updating order detail ${detail.orderId} status from ${detail.Order.orderStatus} to ${status}`);
          return {
            ...detail,
            Order: {
              ...detail.Order,
              orderStatus: status,
            },
          };
        }
        return detail;
      });

      console.log("✅ Redux: Order status updated successfully:", { 
        orderId, 
        status, 
        updatedItemsCount: updatedItems.length,
        updatedDetailsCount: updatedDetails.length,
        itemsChanged: updatedItems !== state.items,
        detailsChanged: updatedDetails !== state.orderDetails
      });
      state.items = updatedItems;
      state.orderDetails = updatedDetails;
    },

    updatePaymentStatusinSlice(
      state: IOrder,
      action: PayloadAction<{
        status: PaymentStatus;
        orderId: string;
        paymentId: string;
      }>
    ) {
      const { status, orderId } = action.payload;

      // Update items array - check both orderId and id
      const updatedItems = state.items.map((item) => {
        if (item.orderId === orderId || item.id === orderId) {
          console.log(`Updating payment status for order ${item.id} from ${item.Payment?.paymentStatus} to ${status}`);
          return {
            ...item,
            Payment: {
              ...item.Payment,
              paymentStatus: status,
              paymentMethod: item.Payment?.paymentMethod ?? PaymentMethod.COD,
              pidx: item.Payment?.pidx, // Preserve existing pidx
            },
          };
        }
        return item;
      });

      // Update orderDetails array
      const updatedDetails = state.orderDetails.map((detail) => {
        if (detail.orderId === orderId && detail.Order) {
          console.log(`Updating payment status for order detail ${detail.orderId} from ${detail.Order.Payment?.paymentStatus} to ${status}`);
          return {
            ...detail,
            Order: {
              ...detail.Order,
              Payment: {
                ...detail.Order.Payment,
                paymentStatus: status,
              },
            },
          };
        }
        return detail;
      });

      console.log("Payment status updated successfully:", { orderId, status, updatedItemsCount: updatedItems.length });
      state.items = updatedItems;
      state.orderDetails = updatedDetails;
    },
  },
});

export default orderSlice.reducer;

export const {
  setItems,
  setStatus,
  setKhaltiUrl,
  setOrderDetails,
  updateOrderStatusToCancel,
  updateOrderStatusinSlice,
  updatePaymentStatusinSlice,
  updateKhaltiPaymentStatus
} = orderSlice.actions;

export function checkKhaltiPaymentStatus(pidx: string) {
  return async function checkKhaltiPaymentStatusThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.post("/order/khalti/verify", { pidx });
      if (response.status === 200) {
        const { paymentStatus } = response.data;
        dispatch(updateKhaltiPaymentStatus({ pidx, status: paymentStatus }));
        
        // Show success message
        if (paymentStatus === "paid") {
          toast.success("Payment successful! Your order has been confirmed.");
        } else {
          toast.error("Payment verification failed. Please contact support.");
        }
      }
    } catch (error) {
      console.log("Payment verification error:", error);
      toast.error("Payment verification failed. Please contact support.");
    }
  };
}

export function orderItem(data: IData) {
  return async function orderItemThunk(dispatch: AppDispatch) {
    try {
      console.log('🚀 OrderItem: Starting order creation with data:', {
        paymentMethod: data.paymentMethod,
        totalPrice: data.totalPrice,
        itemsCount: data.Shoe?.length || 0
      });
      
      const response = await APIS.post("/order", data);
      console.log('📦 OrderItem: Backend response:', {
        status: response.status,
        hasUrl: !!response.data.url,
        url: response.data.url,
        data: response.data
      });
      
      if (response.status === 201) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setItems(response.data.data));
        
        if (response.data.url) {
          // Khalti payment flow
          console.log('💳 OrderItem: Khalti payment detected, redirecting to:', response.data.url);
          dispatch(setKhaltiUrl(response.data.url));
          
          // For Khalti payments, store pidx for verification
          if (data.paymentMethod === PaymentMethod.Khalti && response.data.pidx) {
            localStorage.setItem('khalti_pidx', response.data.pidx);
            console.log('Stored pidx:', response.data.pidx);
          }
          
          // Redirect to Khalti payment page
          window.location.href = response.data.url;
        } else {
          // COD payment flow
          console.log('💰 OrderItem: COD payment detected, redirecting to success page');
          
          // Track purchase history for recommendations
          try {
            if (Array.isArray(data.Shoe)) {
              // Get the actual product data from the response
              const orderItems = response.data.data;
              if (Array.isArray(orderItems)) {
                orderItems.forEach((orderItem: any) => {
                  if (orderItem.Shoe) {
                    dispatch(addToPurchaseHistory({
                      id: orderItem.Shoe.id,
                      name: orderItem.Shoe.name,
                      price: orderItem.Shoe.price,
                      originalPrice: orderItem.Shoe.originalPrice || orderItem.Shoe.mrp || orderItem.Shoe.price,
                      images: Array.isArray(orderItem.Shoe.images) ? orderItem.Shoe.images : [orderItem.Shoe.images || '/images/product-1.jpg'],
                      brand: orderItem.Shoe.brand,
                      category: 'Shoes',
                      reason: 'Purchased'
                    }));
                  }
                });
              }
            }
          } catch (e) {
            console.log('Error tracking purchase history:', e);
          }
          
          // Refresh orders to ensure the new order is available
          console.log('🔄 OrderItem: Refreshing orders after COD creation');
          dispatch(fetchMyOrders());
          
          // Redirect to COD success page
          console.log('🔄 OrderItem: About to redirect to /cod-success');
          window.location.href = '/cod-success';
        }
      } else {
        console.log('❌ OrderItem: Order creation failed with status:', response.status);
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log('❌ OrderItem: Order creation error:', error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function fetchMyOrders() {
  return async function fetchMyOrdersThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.get("/order");
      if (response.status === 201) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setItems(response.data.data));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function fetchMyOrderDetails(id: string) {
  return async function fetchMyOrderDetailsThunk(dispatch: AppDispatch) {
    try {
      console.log("🔍 Fetching order details for ID:", id);
      const response = await APIS.get(`/order/${id}`);
      console.log("🔍 Order details response:", response.data);
      
      if (response.status === 200) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setOrderDetails(response.data.data));
        console.log("✅ Order details fetched successfully");
      } else {
        console.error("❌ Failed to fetch order details:", response.status);
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.error("❌ Error fetching order details:", error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function cancelOrderAPI(id: string) {
  return async function cancelOrderAPIThunk(dispatch: AppDispatch) {
    // Optimistic update first
    dispatch(updateOrderStatusToCancel({ orderId: id }));
    toast.success("Order cancelled successfully");

    try {
      const response = await APIS.patch("/order/cancel-order/" + id);
      if (response.status === 200) {
        dispatch(setStatus(Status.SUCCESS));
      } else {
        dispatch(setStatus(Status.ERROR));
        // Revert optimistic update on error
        dispatch(fetchMyOrderDetails(id));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
      toast.error("Failed to cancel order");
      // Revert optimistic update on error
      dispatch(fetchMyOrderDetails(id));
    }
  };
}

// Function to manually refresh orders when socket updates fail
export function refreshOrders() {
  return async function refreshOrdersThunk(dispatch: AppDispatch) {
    try {
      console.log("🔄 Manually refreshing orders...");
      const response = await APIS.get("/order");
      if (response.status === 201) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setItems(response.data.data));
        console.log("✅ Orders refreshed successfully");
        toast.success("Orders refreshed successfully");
      } else {
        dispatch(setStatus(Status.ERROR));
        toast.error("Failed to refresh orders");
      }
    } catch (error) {
      console.log("❌ Error refreshing orders:", error);
      dispatch(setStatus(Status.ERROR));
      toast.error("Failed to refresh orders");
    }
  };
}

// Simple refresh function - no auto-refresh
export function startAutoRefresh() {
  return function startAutoRefreshThunk() {
    // No auto-refresh - rely on WebSocket for real-time updates
    console.log("🔄 Auto-refresh disabled - using WebSocket for real-time updates");
    return () => {}; // No cleanup needed
  };
}

// Function to update order status via API when WebSocket fails
export function updateOrderStatusAPI(orderId: string, status: OrderStatus) {
  return async function updateOrderStatusAPIThunk(dispatch: AppDispatch) {
    try {
      console.log(`Updating order status via API: ${orderId} -> ${status}`);
      const response = await APIS.patch(`/order/admin/change-status/${orderId}`, { orderStatus: status });
      
      if (response.status === 200) {
        // Update local state
        dispatch(updateOrderStatusinSlice({
          status,
          userId: "admin",
          orderId
        }));
        
        console.log("Order status updated successfully via API");
        toast.success(`Order status updated to: ${status}`);
        return true;
      } else {
        console.error("Failed to update order status via API");
        toast.error("Failed to update order status");
        return false;
      }
    } catch (error) {
      console.error("Error updating order status via API:", error);
      toast.error("Failed to update order status");
      return false;
    }
  };
}

// Function to update payment status via API when WebSocket fails
export function updatePaymentStatusAPI(paymentId: string, status: PaymentStatus) {
  return async function updatePaymentStatusAPIThunk(dispatch: AppDispatch) {
    try {
      console.log(`Updating payment status via API: ${paymentId} -> ${status}`);
      const response = await APIS.patch(`/order/admin/change-payment-status/${paymentId}`, { status });
      
      if (response.status === 200) {
        // Update local state
        dispatch(updatePaymentStatusinSlice({
          status,
          orderId: paymentId, // This might need to be the actual orderId
          paymentId: paymentId
        }));
        
        console.log("Payment status updated successfully via API");
        toast.success(`Payment status updated to: ${status}`);
        return true;
      } else {
        console.error("Failed to update payment status via API");
        toast.error("Failed to update payment status");
        return false;
      }
    } catch (error) {
      console.error("Error updating payment status via API:", error);
      toast.error("Failed to update payment status");
      return false;
    }
  };
}

// WebSocket function to update order status with fallback to API
export function updateOrderStatusWebSocket(orderId: string, status: OrderStatus, userId: string) {
  return async function updateOrderStatusWebSocketThunk(dispatch: AppDispatch) {
    try {
      console.log(`📤 Sending order status update via WebSocket: ${JSON.stringify({ status, orderId, userId })}`);
      
      // Try WebSocket first
      if (socket && socket.connected) {
        socket.emit("updateOrderStatus", { status, orderId, userId });
        
        // Wait for response or timeout
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("WebSocket timeout")), 5000)
        );
        
        const response = new Promise((resolve, reject) => {
          const successHandler = (data: unknown) => {
            console.log("✅ Order status updated via WebSocket:", data);
            resolve(data);
          };
          
          const errorHandler = (error: unknown) => {
            console.log("❌ WebSocket error received:", error);
            reject(error);
          };
          
          socket.once("orderStatusUpdated", successHandler);
          socket.once("statusUpdated", successHandler);
          socket.once("error", errorHandler);
        });
        
        try {
          await Promise.race([response, timeout]);
          // WebSocket succeeded
          dispatch(updateOrderStatusinSlice({ status, userId, orderId }));
          toast.success(`Order status updated to: ${status}`);
          return true;
        } catch {
          console.log("🔄 WebSocket failed, falling back to API");
          // Fallback to API
          return await dispatch(updateOrderStatusAPI(orderId, status));
        }
      } else {
        console.log("🔄 WebSocket not connected, using API");
        return await dispatch(updateOrderStatusAPI(orderId, status));
      }
    } catch (error) {
      console.error("❌ Failed to update order status:", error);
      toast.error("Failed to update order status");
      return false;
    }
  };
}

// WebSocket function to update payment status with fallback to API
export function updatePaymentStatusWebSocket(orderId: string, status: PaymentStatus, paymentId: string) {
  return async function updatePaymentStatusWebSocketThunk(dispatch: AppDispatch) {
    try {
      console.log(`📤 Sending payment status update via WebSocket: ${JSON.stringify({ status, orderId, paymentId })}`);
      
      // Try WebSocket first
      if (socket && socket.connected) {
        socket.emit("updatePaymentStatus", { status, orderId, paymentId });
        
        // Wait for response or timeout
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("WebSocket timeout")), 5000)
        );
        
        const response = new Promise((resolve, reject) => {
          const successHandler = (data: unknown) => {
            console.log("✅ Payment status updated via WebSocket:", data);
            resolve(data);
          };
          
          const errorHandler = (error: unknown) => {
            console.log("❌ WebSocket error received:", error);
            reject(error);
          };
          
          socket.once("paymentStatusUpdated", successHandler);
          socket.once("paymentUpdated", successHandler);
          socket.once("error", errorHandler);
        });
        
        try {
          await Promise.race([response, timeout]);
          // WebSocket succeeded
          dispatch(updatePaymentStatusinSlice({ status, orderId, paymentId }));
          toast.success(`Payment status updated to: ${status}`);
          return true;
        } catch {
          console.log("🔄 WebSocket failed, falling back to API");
          // Fallback to API
          return await dispatch(updatePaymentStatusAPI(orderId, status));
        }
      } else {
        console.log("🔄 WebSocket not connected, using API");
        return await dispatch(updatePaymentStatusAPI(orderId, status));
      }
    } catch (error) {
      console.error("❌ Failed to update payment status:", error);
      toast.error("Failed to update payment status");
      return false;
    }
  };
}

// Enhanced function to listen for real-time updates from admin panel
export function listenForAdminUpdates() {
  return function listenForAdminUpdatesThunk(dispatch: AppDispatch) {
    console.log("🎧 Setting up admin update listeners...");
    
    const handleOrderStatusUpdate = (data: { status: string; userId: string; orderId: string }) => {
      console.log("🔄 Admin order status update received:", data);
      try {
        dispatch(updateOrderStatusinSlice({
          status: data.status as OrderStatus,
          userId: data.userId,
          orderId: data.orderId
        }));
        toast.success(`Order status updated to: ${data.status}`);
      } catch (error) {
        console.error("Error updating order status from admin:", error);
        dispatch(refreshOrders());
      }
    };

    const handlePaymentStatusUpdate = (data: { status: string; orderId: string; paymentId: string }) => {
      console.log("🔄 Admin payment status update received:", data);
      try {
        dispatch(updatePaymentStatusinSlice({
          status: data.status as PaymentStatus,
          orderId: data.orderId,
          paymentId: data.paymentId
        }));
        toast.success(`Payment status updated to: ${data.status}`);
      } catch (error) {
        console.error("Error updating payment status from admin:", error);
        dispatch(refreshOrders());
      }
    };

    // Listen for multiple event names that admin panel might emit
    if (socket && socket.connected) {
      // Order status events
      socket.on("adminOrderStatusUpdate", handleOrderStatusUpdate);
      socket.on("adminOrderUpdate", handleOrderStatusUpdate);
      socket.on("orderStatusChanged", handleOrderStatusUpdate);
      socket.on("statusUpdated", handleOrderStatusUpdate);
      socket.on("orderStatusUpdated", handleOrderStatusUpdate);
      
      // Payment status events
      socket.on("adminPaymentStatusUpdate", handlePaymentStatusUpdate);
      socket.on("adminPaymentUpdate", handlePaymentStatusUpdate);
      socket.on("paymentStatusChanged", handlePaymentStatusUpdate);
      socket.on("paymentStatusUpdated", handlePaymentStatusUpdate);
      socket.on("paymentUpdated", handlePaymentStatusUpdate);
      
      // General admin events
      socket.on("adminUpdate", () => {
        console.log("🔄 Admin update detected, refreshing orders...");
        dispatch(refreshOrders());
      });
      
      console.log("✅ Admin update listeners added successfully");
    } else {
      console.warn("⚠️ Socket not connected, cannot add admin update listeners");
    }
    
    // Return cleanup function
    return () => {
      if (socket) {
        socket.off("adminOrderStatusUpdate", handleOrderStatusUpdate);
        socket.off("adminOrderUpdate", handleOrderStatusUpdate);
        socket.off("orderStatusChanged", handleOrderStatusUpdate);
        socket.off("statusUpdated", handleOrderStatusUpdate);
        socket.off("orderStatusUpdated", handleOrderStatusUpdate);
        socket.off("adminPaymentStatusUpdate", handlePaymentStatusUpdate);
        socket.off("adminPaymentUpdate", handlePaymentStatusUpdate);
        socket.off("paymentStatusChanged", handlePaymentStatusUpdate);
        socket.off("paymentStatusUpdated", handlePaymentStatusUpdate);
        socket.off("paymentUpdated", handlePaymentStatusUpdate);
        socket.off("adminUpdate");
        console.log("🔄 Admin update listeners removed");
      }
    };
  };
}

// Simple function to update order status via API (for admin panel)
export function updateOrderStatusDirect(orderId: string, status: OrderStatus) {
  return async function updateOrderStatusDirectThunk(dispatch: AppDispatch) {
    try {
      console.log(`🔄 Updating order status directly: ${orderId} -> ${status}`);
      
      // Update via API
      const response = await APIS.patch(`/order/admin/change-status/${orderId}`, { orderStatus: status });
      
      if (response.status === 200) {
        // Update local state
        dispatch(updateOrderStatusinSlice({
          status,
          userId: "admin",
          orderId
        }));
        
        console.log("✅ Order status updated successfully");
        toast.success(`Order status updated to: ${status}`);
        return true;
      } else {
        console.error("❌ Failed to update order status");
        toast.error("Failed to update order status");
        return false;
      }
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      toast.error("Failed to update order status");
      return false;
    }
  };
}

// Simple function to update payment status via API (for admin panel)
export function updatePaymentStatusDirect(paymentId: string, status: PaymentStatus) {
  return async function updatePaymentStatusDirectThunk(dispatch: AppDispatch) {
    try {
      console.log(`🔄 Updating payment status directly: ${paymentId} -> ${status}`);
      
      // Update via API
      const response = await APIS.patch(`/order/admin/change-payment-status/${paymentId}`, { status });
      
      if (response.status === 200) {
        // Update local state
        dispatch(updatePaymentStatusinSlice({
          status,
          orderId: paymentId, // This might need to be the actual orderId
          paymentId: paymentId
        }));
        
        console.log("✅ Payment status updated successfully");
        toast.success(`Payment status updated to: ${status}`);
        return true;
      } else {
        console.error("❌ Failed to update payment status");
        toast.error("Failed to update payment status");
        return false;
      }
    } catch (error) {
      console.error("❌ Error updating payment status:", error);
      toast.error("Failed to update payment status");
      return false;
    }
  };
}
