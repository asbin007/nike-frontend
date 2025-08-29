import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API } from '../globals/http';
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
    rating: product.rating || 4.5,
    reviewCount: Math.floor(Math.random() * 500) + 50, // Mock review count
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
      // Fetch products from backend
      const response = await API.get("/product");
      
      if (response.status !== 200 || !response.data?.data) {
        throw new Error('Failed to fetch products from backend');
      }
      
      const products: IProduct[] = response.data.data;
      
      if (!Array.isArray(products) || products.length === 0) {
        throw new Error('No products available');
      }
      
      // Create different recommendation categories
      const mockRecommendations = {
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

      return mockRecommendations;
    } catch (error) {
      console.warn('Failed to fetch recommendations from backend, using mock data:', error);
      // Return comprehensive mock data as fallback
      return {
        recentlyViewed: [
          {
            id: "1",
            name: "Nike Air Max 270",
            price: 12999,
            image: "/images/product-1.jpg",
            brand: "Nike",
            category: "Running",
            rating: 4.5,
            reviewCount: 128,
            isNew: false,
            discount: 15,
            totalStock: 45,
            reason: "Recently viewed by customers"
          },
          {
            id: "2",
            name: "Nike Zoom Fly 5",
            price: 15999,
            image: "/images/product-2.jpg",
            brand: "Nike",
            category: "Running",
            rating: 4.3,
            reviewCount: 89,
            isNew: true,
            discount: 0,
            totalStock: 32,
            reason: "Recently viewed by customers"
          },
          {
            id: "3",
            name: "Nike Air Jordan 1",
            price: 18999,
            image: "/images/product-3.jpg",
            brand: "Nike",
            category: "Basketball",
            rating: 4.7,
            reviewCount: 256,
            isNew: false,
            discount: 20,
            totalStock: 28,
            reason: "Recently viewed by customers"
          },
          {
            id: "4",
            name: "Nike React Vision",
            price: 11999,
            image: "/images/product-4.jpg",
            brand: "Nike",
            category: "Lifestyle",
            rating: 4.2,
            reviewCount: 67,
            isNew: false,
            discount: 10,
            totalStock: 15,
            reason: "Recently viewed by customers"
          }
        ],
        frequentlyBought: [
          {
            id: "5",
            name: "Nike Air Force 1",
            price: 9999,
            image: "/images/product-5.jpg",
            brand: "Nike",
            category: "Lifestyle",
            rating: 4.6,
            reviewCount: 342,
            isNew: false,
            discount: 0,
            totalStock: 67,
            reason: "Frequently bought together"
          },
          {
            id: "6",
            name: "Nike Dunk Low",
            price: 10999,
            image: "/images/product-6.jpg",
            brand: "Nike",
            category: "Lifestyle",
            rating: 4.4,
            reviewCount: 198,
            isNew: false,
            discount: 5,
            totalStock: 43,
            reason: "Frequently bought together"
          },
          {
            id: "7",
            name: "Nike Blazer Mid",
            price: 8999,
            image: "/images/product-7.jpg",
            brand: "Nike",
            category: "Lifestyle",
            rating: 4.1,
            reviewCount: 145,
            isNew: false,
            discount: 15,
            totalStock: 38,
            reason: "Frequently bought together"
          },
          {
            id: "8",
            name: "Nike Air Max 90",
            price: 13999,
            image: "/images/product-8.jpg",
            brand: "Nike",
            category: "Lifestyle",
            rating: 4.5,
            reviewCount: 223,
            isNew: false,
            discount: 0,
            totalStock: 52,
            reason: "Frequently bought together"
          }
        ],
        similarProducts: [
          {
            id: "9",
            name: "Nike Air Max 95",
            price: 14999,
            image: "/images/product-1.jpg",
            brand: "Nike",
            category: "Lifestyle",
            rating: 4.3,
            reviewCount: 167,
            isNew: false,
            discount: 10,
            totalStock: 41,
            reason: "Similar to what you viewed"
          },
          {
            id: "10",
            name: "Nike Air Max 97",
            price: 16999,
            image: "/images/product-2.jpg",
            brand: "Nike",
            category: "Lifestyle",
            rating: 4.4,
            reviewCount: 189,
            isNew: false,
            discount: 0,
            totalStock: 33,
            reason: "Similar to what you viewed"
          },
          {
            id: "11",
            name: "Nike Air Max 200",
            price: 12999,
            image: "/images/product-3.jpg",
            brand: "Nike",
            category: "Lifestyle",
            rating: 4.2,
            reviewCount: 134,
            isNew: false,
            discount: 20,
            totalStock: 19,
            reason: "Similar to what you viewed"
          },
          {
            id: "12",
            name: "Nike Air Max 720",
            price: 17999,
            image: "/images/product-4.jpg",
            brand: "Nike",
            category: "Lifestyle",
            rating: 4.6,
            reviewCount: 201,
            isNew: false,
            discount: 0,
            totalStock: 27,
            reason: "Similar to what you viewed"
          }
        ],
        trendingProducts: [
          {
            id: "13",
            name: "Nike Air Jordan 4",
            price: 21999,
            image: "/images/product-5.jpg",
            brand: "Nike",
            category: "Basketball",
            rating: 4.8,
            reviewCount: 445,
            isNew: false,
            discount: 0,
            totalStock: 14,
            reason: "Trending now"
          },
          {
            id: "14",
            name: "Nike Air Jordan 11",
            price: 24999,
            image: "/images/product-6.jpg",
            brand: "Nike",
            category: "Basketball",
            rating: 4.7,
            reviewCount: 378,
            isNew: false,
            discount: 0,
            totalStock: 8,
            reason: "Trending now"
          },
          {
            id: "15",
            name: "Nike SB Dunk",
            price: 11999,
            image: "/images/product-7.jpg",
            brand: "Nike",
            category: "Skateboarding",
            rating: 4.5,
            reviewCount: 289,
            isNew: false,
            totalStock: 22,
            discount: 10,
            reason: "Trending now"
          },
          {
            id: "16",
            name: "Nike Air Max Plus",
            price: 15999,
            image: "/images/product-8.jpg",
            brand: "Nike",
            category: "Lifestyle",
            rating: 4.4,
            reviewCount: 312,
            isNew: false,
            discount: 0,
            totalStock: 35,
            reason: "Trending now"
          }
        ],
        personalizedRecommendations: [
          {
            id: "17",
            name: "Nike ZoomX Vaporfly",
            price: 29999,
            image: "/images/product-1.jpg",
            brand: "Nike",
            category: "Running",
            rating: 4.9,
            reviewCount: 567,
            isNew: false,
            discount: 0,
            totalStock: 12,
            reason: "Recommended for you"
          },
          {
            id: "18",
            name: "Nike Air Zoom Pegasus",
            price: 13999,
            image: "/images/product-2.jpg",
            brand: "Nike",
            category: "Running",
            rating: 4.6,
            reviewCount: 423,
            isNew: false,
            discount: 15,
            totalStock: 48,
            reason: "Recommended for you"
          },
          {
            id: "19",
            name: "Nike React Infinity Run",
            price: 16999,
            image: "/images/product-3.jpg",
            brand: "Nike",
            category: "Running",
            rating: 4.5,
            reviewCount: 298,
            isNew: false,
            discount: 0,
            totalStock: 31,
            reason: "Recommended for you"
          },
          {
            id: "20",
            name: "Nike Air Zoom Tempo",
            price: 14999,
            image: "/images/product-4.jpg",
            brand: "Nike",
            category: "Running",
            rating: 4.3,
            reviewCount: 234,
            isNew: false,
            discount: 10,
            totalStock: 26,
            reason: "Recommended for you"
          }
        ]
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