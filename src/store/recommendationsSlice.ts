import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IProduct } from '../globals/types/types';

export interface RecommendationProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  discount?: number;
  reason: string; // Why this product is recommended
}

interface RecommendationsState {
  recentlyViewed: RecommendationProduct[];
  frequentlyBought: RecommendationProduct[];
  similarProducts: RecommendationProduct[];
  trendingProducts: RecommendationProduct[];
  personalizedRecommendations: RecommendationProduct[];
  loading: boolean;
  error: string | null;
}

const initialState: RecommendationsState = {
  recentlyViewed: [],
  frequentlyBought: [],
  similarProducts: [],
  trendingProducts: [],
  personalizedRecommendations: [],
  loading: false,
  error: null,
};

// Async thunk for fetching recommendations
export const fetchRecommendations = createAsyncThunk(
  'recommendations/fetchRecommendations',
  async (productId?: string) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate with mock data
      const response = await fetch('http://localhost:5001/api/products');
      const products = await response.json();
      
      // Simulate different recommendation algorithms
      const mockRecommendations = {
        recentlyViewed: products.slice(0, 4).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images?.[0] ? `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${p.images[0].replace("/uploads", "")}.jpg` : "",
          brand: p.brand,
          category: p.Category?.categoryName || "",
          rating: 4.5,
          reviewCount: Math.floor(Math.random() * 100),
          isNew: p.isNew,
          discount: p.discount,
          reason: "Recently viewed by customers"
        })),
        frequentlyBought: products.slice(4, 8).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images?.[0] ? `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${p.images[0].replace("/uploads", "")}.jpg` : "",
          brand: p.brand,
          category: p.Category?.categoryName || "",
          rating: 4.3,
          reviewCount: Math.floor(Math.random() * 200),
          isNew: p.isNew,
          discount: p.discount,
          reason: "Frequently bought together"
        })),
        similarProducts: products.slice(8, 12).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images?.[0] ? `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${p.images[0].replace("/uploads", "")}.jpg` : "",
          brand: p.brand,
          category: p.Category?.categoryName || "",
          rating: 4.2,
          reviewCount: Math.floor(Math.random() * 150),
          isNew: p.isNew,
          discount: p.discount,
          reason: "Similar to what you viewed"
        })),
        trendingProducts: products.slice(12, 16).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images?.[0] ? `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${p.images[0].replace("/uploads", "")}.jpg` : "",
          brand: p.brand,
          category: p.Category?.categoryName || "",
          rating: 4.6,
          reviewCount: Math.floor(Math.random() * 300),
          isNew: p.isNew,
          discount: p.discount,
          reason: "Trending now"
        })),
        personalizedRecommendations: products.slice(16, 20).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images?.[0] ? `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${p.images[0].replace("/uploads", "")}.jpg` : "",
          brand: p.brand,
          category: p.Category?.categoryName || "",
          rating: 4.4,
          reviewCount: Math.floor(Math.random() * 180),
          isNew: p.isNew,
          discount: p.discount,
          reason: "Recommended for you"
        }))
      };

      return mockRecommendations;
    } catch (error) {
      throw new Error('Failed to fetch recommendations');
    }
  }
);

// Async thunk for fetching similar products
export const fetchSimilarProducts = createAsyncThunk(
  'recommendations/fetchSimilarProducts',
  async (productId: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/products');
      const products = await response.json();
      
      // Filter products similar to the current product
      const currentProduct = products.find((p: any) => p.id === productId);
      if (!currentProduct) return [];

      const similarProducts = products
        .filter((p: any) => 
          p.id !== productId && 
          (p.brand === currentProduct.brand || 
           p.Category?.categoryName === currentProduct.Category?.categoryName ||
           Math.abs(p.price - currentProduct.price) < 1000)
        )
        .slice(0, 4)
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images?.[0] ? `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${p.images[0].replace("/uploads", "")}.jpg` : "",
          brand: p.brand,
          category: p.Category?.categoryName || "",
          rating: 4.2 + Math.random() * 0.6,
          reviewCount: Math.floor(Math.random() * 150),
          isNew: p.isNew,
          discount: p.discount,
          reason: "Similar to this product"
        }));

      return similarProducts;
    } catch (error) {
      throw new Error('Failed to fetch similar products');
    }
  }
);

const recommendationsSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    addToRecentlyViewed: (state, action: PayloadAction<RecommendationProduct>) => {
      const product = action.payload;
      // Remove if already exists
      state.recentlyViewed = state.recentlyViewed.filter(p => p.id !== product.id);
      // Add to beginning
      state.recentlyViewed.unshift(product);
      // Keep only last 10
      state.recentlyViewed = state.recentlyViewed.slice(0, 10);
    },
    clearRecentlyViewed: (state) => {
      state.recentlyViewed = [];
    },
    setRecommendationReason: (state, action: PayloadAction<{ productId: string; reason: string }>) => {
      const { productId, reason } = action.payload;
      // Update reason for all recommendation types
      [state.recentlyViewed, state.frequentlyBought, state.similarProducts, 
       state.trendingProducts, state.personalizedRecommendations].forEach(list => {
        const product = list.find(p => p.id === productId);
        if (product) {
          product.reason = reason;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recentlyViewed = action.payload.recentlyViewed;
        state.frequentlyBought = action.payload.frequentlyBought;
        state.similarProducts = action.payload.similarProducts;
        state.trendingProducts = action.payload.trendingProducts;
        state.personalizedRecommendations = action.payload.personalizedRecommendations;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch recommendations';
      })
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.similarProducts = action.payload;
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch similar products';
      });
  },
});

export const { 
  addToRecentlyViewed, 
  clearRecentlyViewed, 
  setRecommendationReason 
} = recommendationsSlice.actions;

export default recommendationsSlice.reducer; 