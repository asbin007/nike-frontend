// src/store/cartSlice.ts
import { AppDispatch } from "./store";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../globals/types/types";
import { APIS } from "../globals/http";

interface ICartItem {
  id: string;
  name: string;
  images: string;
  price: number;
}

interface IData {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  Shoe: ICartItem;
  size: string;
  color: string; // Added color
}

interface ICartUpdateItem {
  productId: string;
  quantity: number;
}

interface IInitialData {
  data: IData[];
  status: Status;
}

const initialState: IInitialData = {
  data: [],
  status: Status.LOADING,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart(state: IInitialData, action: PayloadAction<IData[]>) {
      state.data = action.payload;
    },
    setStatus(state: IInitialData, action: PayloadAction<Status>) {
      state.status = action.payload;
    },
    setUpdateCart(state: IInitialData, action: PayloadAction<ICartUpdateItem>) {
      const index = state.data.findIndex(
        (item) => item.Shoe.id === action.payload.productId
      );
      if (index !== -1) {
        state.data[index].quantity = action.payload.quantity;
      }
    },
    setDeleteCartItem(
      state: IInitialData,
      action: PayloadAction<{ productId: string }>
    ) {
      const index = state.data.findIndex(
        (i) => i.productId === action.payload.productId
      );
      if (index !== -1) {
        state.data.splice(index, 1);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.status = Status.LOADING;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = Status.SUCCESS;
        state.data = action.payload;
      })
      .addCase(addToCart.rejected, (state) => {
        state.status = Status.ERROR;
      });
  },
});

export const { setCart, setStatus, setUpdateCart, setDeleteCartItem } =
  cartSlice.actions;
export default cartSlice.reducer;

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, size, color }: { productId: string; size: string; color: string }) => {
    try {
      const res = await APIS.post("/cart", {
        productId,
        size,
        color,
        quantity: 1,
      });
      if (res.status === 201) {
        return res.data.data;
      } else {
        throw new Error("Failed to add to cart");
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

export function fetchCartItems() {
  return async function fetchCartItemsThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.get("/cart");
      if (response.status === 201) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setCart(response.data.data));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function updateCart(productId: string, quantity: number) {
  return async function updateCartThunk(dispatch: AppDispatch) {
    try {
      const res = await APIS.patch("/cart/"+ productId, {  quantity });
      if (res.status === 201) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setUpdateCart({ productId, quantity }));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      dispatch(setStatus(Status.ERROR));
      console.log(error);
    }
  };
}

export function deleteCart(productId: string) {
  return async function deleteCartThunk(dispatch: AppDispatch) {
    try {
      const res = await APIS.delete("/cart/" + productId);
      if (res.status === 201) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setDeleteCartItem({ productId }));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      dispatch(setStatus(Status.ERROR));
      console.log(error);
    }
  };
}
