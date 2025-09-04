import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API, APIS } from '../globals/http';
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
  totalStock?: number;
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

// Helper function to filter products based on criteria (like ProductFilters)
const filterProducts = (products: IProduct[], currentProduct: IProduct, excludeId: string): IProduct[] => {
  return products.filter((product) => {
    // Exclude the current product
    if (product.id === excludeId) return false;
    
    // Use the same logic as ProductFilters: filter by brand and collection
    const matchBrand = product.brand.toLowerCase() === currentProduct.brand.toLowerCase();
    const matchCollection = product.Collection?.collectionName.toLowerCase() === currentProduct.Collection?.collectionName.toLowerCase();
    
    // Return products that match either brand OR collection (like ProductFilters)
    return matchBrand || matchCollection;
  });
};

// Helper function to convert IProduct to RecommendationProduct
const convertToRecommendationProduct = (product: IProduct, reason: string): RecommendationProduct => {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images?.[0] || "/images/product-1.jpg",
    brand: product.brand,
    category: product.Category?.categoryName || "General",
    rating: product.rating,
    // If your backend includes reviewCount on product, extend IProduct accordingly; otherwise undefined
    reviewCount: (product as unknown as { reviewCount?: number }).reviewCount,
    isNew: product.isNew,
    discount: product.discount,
    totalStock: product.totalStock,
    reason
  };
};

// Async thunk for fetching recommendations
export const fetchRecommendations = createAsyncThunk(
  'recommendations/fetchRecommendations',
  async () => {
    try {
      // Try personalized recommendations endpoint from backend
      const recoRes = await APIS.get("/recommendations");
      if (recoRes.status === 200 && recoRes.data) {
        const { basedOnCategory = [], alsoBought = [], fallback = [] } = recoRes.data;

        const mapProd = (p: IProduct, reason: string) => convertToRecommendationProduct(p, reason);

        const personalized = (basedOnCategory as IProduct[]).map(p => mapProd(p, 'Recommended for you'));
        const freqBought = (alsoBought as IProduct[]).map(p => mapProd(p, 'Frequently bought together'));
        const trending = (fallback as IProduct[]).map(p => mapProd(p, 'Trending now'));

        return {
          recentlyViewed: [],
          frequentlyBought: freqBought,
          similarProducts: [],
          trendingProducts: trending,
          personalizedRecommendations: personalized.length ? personalized : trending,
        };
      }

      // Fallback to products list when reco API not available
      const response = await API.get("/product");
      if (response.status !== 200 || !response.data?.data) {
        throw new Error('Failed to fetch products from backend');
      }
      const products: IProduct[] = response.data.data;
      if (!Array.isArray(products) || products.length === 0) {
        throw new Error('No products available');
      }

      return {
        recentlyViewed: products.slice(0, 4).map((product) => 
          convertToRecommendationProduct(product, "Recently viewed by customers")
        ),
        frequentlyBought: products.slice(4, 8).map((product) => 
          convertToRecommendationProduct(product, "Frequently bought together")
        ),
        similarProducts: products.slice(8, 12).map((product) => 
          convertToRecommendationProduct(product, "Similar to what you viewed")
        ),
        trendingProducts: products.slice(12, 16).map((product) => 
          convertToRecommendationProduct(product, "Trending now")
        ),
        personalizedRecommendations: products.slice(16, 20).map((product) => 
          convertToRecommendationProduct(product, "Recommended for you")
        )
      };
    } catch (error) {
      console.warn('Failed to fetch recommendations from backend:', error);
      return {
        recentlyViewed: [],
        frequentlyBought: [],
        similarProducts: [],
        trendingProducts: [],
        personalizedRecommendations: []
      };
    }
  }
);

// Async thunk for fetching similar products
export const fetchSimilarProducts = createAsyncThunk(
  'recommendations/fetchSimilarProducts',
  async (productId: string) => {
    try {
      console.log('Fetching similar products for product ID:', productId);
      
      // Fetch products from backend
      const response = await API.get("/product");
      
      if (response.status !== 200 || !response.data?.data) {
        throw new Error('Failed to fetch products from backend');
      }
      
      const products: IProduct[] = response.data.data;
      
      if (!Array.isArray(products) || products.length === 0) {
        throw new Error('No products available');
      }
      
      console.log('Total products fetched:', products.length);
      
      // Find current product
      const currentProduct = products.find((p) => String(p.id) === String(productId));
      if (!currentProduct) {
        console.warn('Current product not found for similar products');
        return [];
      }

      console.log('Current product found:', currentProduct.name, 'Category:', currentProduct.Category?.categoryName, 'Brand:', currentProduct.brand);

      // Use the filterProducts function to get similar products
      const filteredSimilarProducts = filterProducts(products, currentProduct, String(productId));
      
      console.log('Similar products found:', filteredSimilarProducts.length);
      console.log('Current product:', {
        name: currentProduct.name,
        brand: currentProduct.brand,
        collection: currentProduct.Collection?.collectionName
      });
      
      // If no similar products found, return trending products as fallback
      if (filteredSimilarProducts.length === 0) {
        console.log('No similar products found, using trending products as fallback');
        const trendingFallback = products
          .filter(p => p.id !== String(productId))
          .slice(0, 4)
          .map((product) => convertToRecommendationProduct(product, "Popular product"));
        return trendingFallback;
      }
      
      // Take the first 4 similar products and convert them
      const similarProducts = filteredSimilarProducts
        .slice(0, 4)
        .map((product) => convertToRecommendationProduct(product, "Similar to this product"));

      return similarProducts;
    } catch (error) {
      console.error('Error fetching similar products:', error);
      throw new Error(`Failed to fetch similar products: ${error instanceof Error ? error.message : 'Unknown error'}`);
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