import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "../globals/types/types";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  discount?: number;
  category?: string;
  brand?: string;
  totalStock?: number; // Add totalStock for better stock management
}

interface WishlistState {
  items: WishlistItem[];
  status: Status;
}

const initialState: WishlistState = {
  items: [],
  status: Status.SUCCESS,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (!existingItem) {
        state.items.push(action.payload);
      }
    },
    
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    
    clearWishlist: (state) => {
      state.items = [];
    },
    
    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
    },
    
    setStatus: (state, action: PayloadAction<Status>) => {
      state.status = action.payload;
    },

    // Add new action to update stock status
    updateWishlistItemStock: (state, action: PayloadAction<{ id: string; inStock: boolean; totalStock?: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.inStock = action.payload.inStock;
        if (action.payload.totalStock !== undefined) {
          item.totalStock = action.payload.totalStock;
        }
      }
    },

    // Add action to sync all wishlist items with current product stock
    syncWishlistStock: (state, action: PayloadAction<{ id: string; inStock: boolean; totalStock?: number }[]>) => {
      action.payload.forEach(({ id, inStock, totalStock }) => {
        const item = state.items.find(item => item.id === id);
        if (item) {
          item.inStock = inStock;
          if (totalStock !== undefined) {
            item.totalStock = totalStock;
          }
        }
      });
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlistItems,
  setStatus,
  updateWishlistItemStock,
  syncWishlistStock,
} = wishlistSlice.actions;

export default wishlistSlice.reducer; 