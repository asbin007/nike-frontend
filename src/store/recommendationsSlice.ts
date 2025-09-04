import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API } from '../globals/http';
import { IProduct } from '../globals/types/types';

export interface RecommendationProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  brand: string;
  category: string;
  rating?: number;
  isNew?: boolean;
  discount?: number;
  totalStock?: number;
  reason: string; // Why this product is recommended
}

interface RecommendationsState {
  recentlyViewed: RecommendationProduct[];
  frequentlyBought: RecommendationProduct[];
  similarProducts: RecommendationProduct[];
  trendingProducts: RecommendationProduct[];
  personalizedRecommendations: RecommendationProduct[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: RecommendationsState = {
  recentlyViewed: [],
  frequentlyBought: [],
  similarProducts: [],
  trendingProducts: [],
  personalizedRecommendations: [],
  status: 'idle',
  error: null,
};

// Helper function to convert IProduct to RecommendationProduct
const convertToRecommendationProduct = (product: IProduct, reason: string): RecommendationProduct => {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.images?.[0] || '/images/product-1.jpg',
    brand: product.brand,
    category: product.Category?.categoryName || 'Shoes',
    rating: product.rating,
    isNew: product.isNew,
    discount: product.discount,
    totalStock: product.totalStock,
    reason
  };
};

// Helper function to get similar products based on category and brand
const getSimilarProducts = (currentProduct: IProduct, allProducts: IProduct[], limit: number = 4): RecommendationProduct[] => {
  const similar = allProducts
    .filter(product => 
      product.id !== currentProduct.id && 
      (product.Category?.categoryName === currentProduct.Category?.categoryName || 
       product.brand === currentProduct.brand)
    )
    .sort((a, b) => {
      // Prioritize same brand, then same category
      if (a.brand === currentProduct.brand && b.brand !== currentProduct.brand) return -1;
      if (b.brand === currentProduct.brand && a.brand !== currentProduct.brand) return 1;
      if (a.Category?.categoryName === currentProduct.Category?.categoryName && b.Category?.categoryName !== currentProduct.Category?.categoryName) return -1;
      if (b.Category?.categoryName === currentProduct.Category?.categoryName && a.Category?.categoryName !== currentProduct.Category?.categoryName) return 1;
      return 0;
    })
    .slice(0, limit)
    .map(product => convertToRecommendationProduct(product, 'Similar products'));

  return similar;
};

// Helper function to get trending products (newest, highest rated, or discounted)
const getTrendingProducts = (allProducts: IProduct[], limit: number = 8): RecommendationProduct[] => {
  const trending = allProducts
    .filter(product => product.isStock)
    .sort((a, b) => {
      // Prioritize new products, then high ratings, then discounts
      if (a.isNew && !b.isNew) return -1;
      if (b.isNew && !a.isNew) return 1;
      if (a.rating > b.rating) return -1;
      if (b.rating < a.rating) return 1;
      if (a.discount > b.discount) return -1;
      if (b.discount < a.discount) return 1;
      return 0;
    })
    .slice(0, limit)
    .map(product => convertToRecommendationProduct(product, 'Trending now'));

  return trending;
};

// Helper function to get frequently bought together (based on category and price range)
const getFrequentlyBought = (currentProduct: IProduct, allProducts: IProduct[], limit: number = 4): RecommendationProduct[] => {
  const priceRange = currentProduct.price * 0.5; // 50% price range
  
  const frequentlyBought = allProducts
    .filter(product => 
      product.id !== currentProduct.id && 
      product.isStock &&
      Math.abs(product.price - currentProduct.price) <= priceRange
    )
    .sort((a, b) => {
      // Prioritize same category, then similar price
      if (a.Category?.categoryName === currentProduct.Category?.categoryName && b.Category?.categoryName !== currentProduct.Category?.categoryName) return -1;
      if (b.Category?.categoryName === currentProduct.Category?.categoryName && a.Category?.categoryName !== currentProduct.Category?.categoryName) return 1;
      return Math.abs(a.price - currentProduct.price) - Math.abs(b.price - currentProduct.price);
    })
    .slice(0, limit)
    .map(product => convertToRecommendationProduct(product, 'Frequently bought together'));

  return frequentlyBought;
};

// Async thunk for fetching recommendations
export const fetchRecommendations = createAsyncThunk(
  'recommendations/fetchRecommendations',
  async () => {
    try {
      const response = await API.get("/product");
      if (response.status !== 200 || !response.data?.data) {
        throw new Error('Failed to fetch products from backend');
      }
      
      const products: IProduct[] = response.data.data;
      if (!Array.isArray(products) || products.length === 0) {
        throw new Error('No products available');
      }

      // Generate trending products
      const trendingProducts = getTrendingProducts(products, 8);
      
      // Generate personalized recommendations (mix of new, discounted, and high-rated)
      const personalizedRecommendations = products
        .filter(product => product.isStock)
        .sort((a, b) => {
          // Mix of new products, discounts, and ratings
          const scoreA = (a.isNew ? 3 : 0) + (a.discount > 0 ? 2 : 0) + (a.rating || 0);
          const scoreB = (b.isNew ? 3 : 0) + (b.discount > 0 ? 2 : 0) + (b.rating || 0);
          return scoreB - scoreA;
        })
        .slice(0, 6)
        .map(product => convertToRecommendationProduct(product, 'Recommended for you'));

      return {
        recentlyViewed: [],
        frequentlyBought: [],
        similarProducts: [],
        trendingProducts,
        personalizedRecommendations,
      };
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }
);

// Async thunk for fetching similar products for a specific product
export const fetchSimilarProducts = createAsyncThunk(
  'recommendations/fetchSimilarProducts',
  async (productId: string) => {
    try {
      const response = await API.get("/product");
      if (response.status !== 200 || !response.data?.data) {
        throw new Error('Failed to fetch products from backend');
      }
      
      const products: IProduct[] = response.data.data;
      const currentProduct = products.find(p => p.id === productId);
      
      if (!currentProduct) {
        throw new Error('Product not found');
      }

      const similarProducts = getSimilarProducts(currentProduct, products, 4);
      const frequentlyBought = getFrequentlyBought(currentProduct, products, 4);

      return {
        similarProducts,
        frequentlyBought,
      };
    } catch (error) {
      console.error('Error fetching similar products:', error);
      throw error;
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
    clearRecommendations: (state) => {
      state.recentlyViewed = [];
      state.frequentlyBought = [];
      state.similarProducts = [];
      state.trendingProducts = [];
      state.personalizedRecommendations = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trendingProducts = action.payload.trendingProducts;
        state.personalizedRecommendations = action.payload.personalizedRecommendations;
        state.error = null;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch recommendations';
      })
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.similarProducts = action.payload.similarProducts;
        state.frequentlyBought = action.payload.frequentlyBought;
        state.error = null;
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch similar products';
      });
  },
});

export const { addToRecentlyViewed, clearRecommendations } = recommendationsSlice.actions;
export default recommendationsSlice.reducer;