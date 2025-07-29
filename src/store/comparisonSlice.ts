import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ComparisonProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  category: string;
  description: string;
  inStock: boolean;
  totalStock: number;
  RAM?: string[];
  ROM?: string[];
  color?: string[];
  size?: string[];
  isNew?: boolean;
  rating?: number;
  reviewCount?: number;
}

interface ComparisonState {
  products: ComparisonProduct[];
  maxProducts: number;
}

const initialState: ComparisonState = {
  products: [],
  maxProducts: 4, // Maximum 4 products can be compared
};

const comparisonSlice = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    addToComparison: (state, action: PayloadAction<ComparisonProduct>) => {
      const product = action.payload;
      const exists = state.products.find(p => p.id === product.id);
      
      if (!exists && state.products.length < state.maxProducts) {
        state.products.push(product);
      }
    },
    removeFromComparison: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    clearComparison: (state) => {
      state.products = [];
    },
    setMaxProducts: (state, action: PayloadAction<number>) => {
      state.maxProducts = action.payload;
    },
  },
});

export const { 
  addToComparison, 
  removeFromComparison, 
  clearComparison, 
  setMaxProducts 
} = comparisonSlice.actions;

export default comparisonSlice.reducer; 