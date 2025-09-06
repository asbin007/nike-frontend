// src/store/cartSlice.ts
import { AppDispatch } from "./store";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../globals/types/types";
import { APIS } from "../globals/http";
import { addToCartHistory } from './recommendationsSlice'

interface ICartItem {
  id: string;
  name: string;
  images: string;
  price: number;
  brand: string; // Added brand field for coupon validation
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
  id: string;
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
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.data[index].quantity = action.payload.quantity;
      }
    },
    setDeleteCartItem(
      state: IInitialData,
      action: PayloadAction<{ id: string }>
    ) {
      const index = state.data.findIndex(
        (i) => i.id === action.payload.id
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
  async ({ productId, size, color }: { productId: string; size: string; color: string }, thunkAPI) => {
    try {
      const res = await APIS.post("/cart", {
        productId,
        size,
        color,
        quantity: 1,
      });
      if (res.status >= 200 && res.status < 300) {
        console.log('✅ Cart API response successful:', res.data);
        // Track cart activity for recommendations
        try {
          const cartItem = res.data.data;
          console.log('🛒 Cart item added:', cartItem);
          console.log('🛒 Cart item structure:', {
            hasCartItem: !!cartItem,
            hasShoe: !!cartItem?.Shoe,
            shoeData: cartItem?.Shoe,
            allKeys: cartItem ? Object.keys(cartItem) : []
          });
          
          // Check if cartItem is an array (new format) or has Shoe property (old format)
          let shoeData = null;
          
          if (Array.isArray(cartItem)) {
            // New format: cartItem is an array, get the latest item
            const latestItem = cartItem[cartItem.length - 1];
            shoeData = latestItem?.Shoe;
            console.log('🔄 Using array format, latest item:', latestItem);
          } else if (cartItem && cartItem.Shoe) {
            // Old format: cartItem has Shoe property
            shoeData = cartItem.Shoe;
            console.log('🔄 Using object format with Shoe property');
          }
          
          if (shoeData) {
            const cartHistoryItem = {
              id: shoeData.id,
              name: shoeData.name,
              price: shoeData.price,
              originalPrice: shoeData.originalPrice || shoeData.price,
              images: Array.isArray(shoeData.images) ? shoeData.images : [shoeData.images || '/images/product-1.jpg'],
              brand: shoeData.brand,
              category: 'Shoes', // Default category
              reason: 'Added to cart'
            };
            console.log('📝 Adding to cart history:', cartHistoryItem);
            thunkAPI.dispatch(addToCartHistory(cartHistoryItem));
            console.log('✅ Cart history dispatch completed');
          } else {
            console.log('❌ No valid shoe data found in cart item');
            console.log('🔍 Cart item structure:', {
              isArray: Array.isArray(cartItem),
              length: Array.isArray(cartItem) ? cartItem.length : 'N/A',
              firstItem: Array.isArray(cartItem) ? cartItem[0] : cartItem,
              allKeys: cartItem ? Object.keys(cartItem) : []
            });
          }
        } catch (error) {
          console.error('❌ Error tracking cart activity:', error);
        }
        
        // Sync cart from server in case backend returns single item or different shape
        try {
          (thunkAPI.dispatch as any)(fetchCartItems());
        } catch {}
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
      if (response.status >= 200 && response.status < 300) {
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

export function updateCart(id: string, quantity: number) {
  return async function updateCartThunk(dispatch: AppDispatch) {
    // Optimistic update first
    dispatch(setUpdateCart({ id, quantity }));
    try {
      const res = await APIS.patch("/cart/" + id, { quantity });
      if (res.status >= 200 && res.status < 300) {
        dispatch(setStatus(Status.SUCCESS));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      dispatch(setStatus(Status.ERROR));
      console.log(error);
      // Optional: refetch to restore server truth if needed
      // return dispatch<any>(fetchCartItems() as any);
    }
  };
}

export function deleteCart(id: string) {
  return async function deleteCartThunk(dispatch: AppDispatch) {
    try {
      const res = await APIS.delete("/cart/" + id);
      if (res.status >= 200 && res.status < 300) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setDeleteCartItem({ id }));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      dispatch(setStatus(Status.ERROR));
      console.log(error);
    }
  };
}
