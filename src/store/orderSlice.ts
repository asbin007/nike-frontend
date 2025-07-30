import { IOrderDetail, OrderStatus, PaymentStatus } from "../pages/order/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../globals/types/types";
import { APIS } from "../globals/http";
import { AppDispatch } from "./store";
import toast from "react-hot-toast";

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
  Shoe: IBackendProduct[]; // Changed to match backend expectation
}

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
      const updateOrder = state.items.map((order) =>
        order.id == orderId
          ? { ...order, orderStatus: status as unknown as Status }
          : order
      );
      console.log(updateOrder, "UO");
      state.items = updateOrder;
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

      const updatedItems = state.items.map((item) =>
        item.orderId === orderId
          ? {
              ...item,
              Payment: {
                ...item.Payment,
                paymentStatus: status,
                paymentMethod: item.Payment?.paymentMethod ?? PaymentMethod.COD,
                pidx: item.Payment?.pidx, // Preserve existing pidx
              },
            }
          : item
      );

      const updatedDetails = state.orderDetails.map((detail) => {
        if (detail.orderId === orderId && detail.Order) {
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
      const response = await APIS.post("/order", data);
      if (response.status === 201) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setItems(response.data.data));
        console.log(response.data.url, "URL");
        
        if (response.data.url) {
          dispatch(setKhaltiUrl(response.data.url));
          
          // For Khalti payments, store pidx for verification
          if (data.paymentMethod === PaymentMethod.Khalti && response.data.pidx) {
            localStorage.setItem('khalti_pidx', response.data.pidx);
            console.log('Stored pidx:', response.data.pidx); // Debug log
          }
          
          // Redirect to Khalti payment page
          window.location.href = response.data.url;
        } else {
          // For COD payments
          toast.success("Order created successfully!");
        }
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      dispatch(setStatus(Status.ERROR));
      console.log(error);
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
      const response = await APIS.get(`/order/${id}`);
      if (response.status === 200) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setOrderDetails(response.data.data));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function cancelOrderAPI(id: string) {
  return async function cancelOrderAPIThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.patch("/order/cancel-order/" + id);
      if (response.status === 200) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(updateOrderStatusToCancel({ orderId: id }));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}
