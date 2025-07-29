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
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlistItems,
  setStatus,
} = wishlistSlice.actions;

export default wishlistSlice.reducer; 