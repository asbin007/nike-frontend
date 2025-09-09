// src/store/cartSlice.ts
import { AppDispatch } from "./store";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../globals/types/types";
import { APIS } from "../globals/http";
import { addToCartHistory } from './recommendationsSlice'
import toast from "react-hot-toast";

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
  isAddingToCart: boolean;
  isUpdatingCart: boolean;
}

const initialState: IInitialData = {
  data: [],
  status: Status.LOADING,
  isAddingToCart: false,
  isUpdatingCart: false,
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
        state.isAddingToCart = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = Status.SUCCESS;
        state.isAddingToCart = false;
        // Ensure we handle both array and single item responses
        if (Array.isArray(action.payload)) {
          state.data = action.payload;
        } else {
          // If single item, add to existing cart or create new array
          const existingIndex = state.data.findIndex(item => item.id === action.payload.id);
          if (existingIndex !== -1) {
            state.data[existingIndex] = action.payload;
          } else {
            state.data.push(action.payload);
          }
        }
        console.log('🛒 Cart state updated:', state.data);
      })
      .addCase(addToCart.rejected, (state) => {
        state.status = Status.ERROR;
        state.isAddingToCart = false;
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
    // Validation
    if (quantity < 1) {
      toast.error("Quantity must be at least 1", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    if (quantity > 10) {
      toast.error("Maximum quantity allowed is 10", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    // Set loading state
    dispatch(setStatus(Status.LOADING));
    
    // Optimistic update first (like before)
    dispatch(setUpdateCart({ id, quantity }));
    
    try {
      const res = await APIS.patch("/cart/" + id, { quantity });
      if (res.status >= 200 && res.status < 300) {
        dispatch(setStatus(Status.SUCCESS));
        toast.success("Cart updated successfully", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#10b981",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: "8px",
          },
        });
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
    if (!id) {
      toast.error("Item ID is required", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    // Optimistic update first (like before)
    dispatch(setDeleteCartItem({ id }));
    
    try {
      const res = await APIS.delete("/cart/" + id);
      if (res.status >= 200 && res.status < 300) {
        dispatch(setStatus(Status.SUCCESS));
        toast.success("Item removed from cart", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#10b981",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: "8px",
          },
        });
      } else {
        dispatch(setStatus(Status.ERROR));
        toast.error("Failed to remove item from cart. Please try again.", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#dc2626",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: "8px",
          },
        });
      }
    } catch (error) {
      dispatch(setStatus(Status.ERROR));
      console.log(error);
      toast.error("Failed to remove item from cart. Please try again.", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
    }
  };
}
