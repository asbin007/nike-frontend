import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { API } from '../globals/http';
import { IProduct } from '../globals/types/types';

// Interface for backend product response (can have different field names)
interface BackendProduct {
  id?: string;
  _id?: string;
  productId?: string;
  name?: string;
  productName?: string;
  price?: number;
  sellingPrice?: number;
  originalPrice?: number;
  mrp?: number;
  images?: string[];
  image?: string;
  Images?: string[];
  brand?: string;
  Category?: { categoryName?: string };
  category?: { categoryName?: string };
  categoryName?: string;
  rating?: number;
  isNew?: boolean;
  isNewProduct?: boolean;
  discount?: number;
  totalStock?: number;
  stock?: number;
  isStock?: boolean;
  inStock?: boolean;
  createdAt?: string;
}

export interface RecommendationProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  images: string[]; // Changed to array to match ProductCard
  brand: string;
  category: string;
  rating?: number;
  isNew?: boolean;
  discount?: number;
  totalStock?: number;
  reason: string; // Why this product is recommended
  description?: string;
  colors?: string[];
  sizes?: string[];
}

interface RecommendationsState {
  recentlyViewed: RecommendationProduct[];
  frequentlyBought: RecommendationProduct[];
  similarProducts: RecommendationProduct[];
  trendingProducts: RecommendationProduct[];
  newArrivals: RecommendationProduct[];
  bestSellers: RecommendationProduct[];
  onSaleProducts: RecommendationProduct[];
  personalizedRecommendations: RecommendationProduct[];
  cartHistory: RecommendationProduct[];
  purchaseHistory: RecommendationProduct[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Load cart history from localStorage on initialization
const loadCartHistoryFromStorage = (): RecommendationProduct[] => {
  try {
    const saved = localStorage.getItem('cartHistory');
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log('📂 Loaded cart history from localStorage:', parsed.length, 'items');
      return parsed;
    }
  } catch (error) {
    console.error('❌ Failed to load cart history from localStorage:', error);
  }
  return [];
};

const initialState: RecommendationsState = {
  recentlyViewed: [],
  frequentlyBought: [],
  similarProducts: [],
  trendingProducts: [],
  newArrivals: [],
  bestSellers: [],
  onSaleProducts: [],
  personalizedRecommendations: [],
  cartHistory: loadCartHistoryFromStorage(),
  purchaseHistory: [],
  status: 'idle',
  error: null,
};

// Helper function to convert BackendProduct to RecommendationProduct
const convertToRecommendationProduct = (product: BackendProduct, reason: string): RecommendationProduct => {
  console.log('🔄 Converting product:', product);
  
  // Handle different field names from backend
  const id = product.id || product._id || product.productId;
  const name = product.name || product.productName || 'Product';
  const price = product.price || product.sellingPrice || 0;
  const originalPrice = product.originalPrice || product.mrp || price;
  
  // Handle images array - take first image or fallback
  console.log('🖼️ Processing images for product:', product.name, {
    productId: product.id || product._id || product.productId,
    images: product.images,
    image: product.image,
    Images: product.Images,
    allFields: Object.keys(product)
  });
  
  let images: string[] = [];
  
  // Try different image field names and formats
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    // Filter out empty/null images
    const validImages = product.images.filter(img => img && img.trim() !== '');
    console.log('📸 Found images array:', validImages);
    
    if (validImages.length > 0) {
      let firstImage = validImages[0];
      
      // Handle images without file extensions (common in your backend)
      if (firstImage.includes('/uploads/') && !firstImage.includes('.')) {
        // Add .jpg extension if missing
        firstImage = `${firstImage}.jpg`;
        console.log('🔧 Added .jpg extension to image:', firstImage);
      }
      
      // Return the raw image paths for Cloudinary processing in components
      images = validImages;
    }
  } else if (product.image && product.image.trim() !== '') {
    console.log('📸 Found single image:', product.image);
    
    let singleImage = product.image;
    
    // Handle images without file extensions
    if (singleImage.includes('/uploads/') && !singleImage.includes('.')) {
      singleImage = `${singleImage}.jpg`;
      console.log('🔧 Added .jpg extension to single image:', singleImage);
    }
    
    // Return the raw image paths for Cloudinary processing in components
    images = [singleImage];
  } else if (product.Images && Array.isArray(product.Images) && product.Images.length > 0) {
    // Filter out empty/null images
    const validImages = product.Images.filter(img => img && img.trim() !== '');
    console.log('📸 Found Images array:', validImages);
    
    if (validImages.length > 0) {
      let firstImage = validImages[0];
      
      // Handle images without file extensions
      if (firstImage.includes('/uploads/') && !firstImage.includes('.')) {
        firstImage = `${firstImage}.jpg`;
        console.log('🔧 Added .jpg extension to Images array image:', firstImage);
      }
      
      // Return the raw image paths for Cloudinary processing in components
      images = validImages;
    }
  }
  
  // If no real images found, use a more appropriate fallback
  if (images.length === 0) {
    console.log('⚠️ No real images found for product:', product.name, 'using fallback');
    // Use a fallback that will work with Cloudinary or direct URL
    images = ['/images/product-1.jpg']; // Simple fallback path
  }
  
  // Additional validation: ensure images have proper path format
  images = images.map(img => {
    if (img && !img.startsWith('http') && !img.startsWith('/') && !img.startsWith('uploads/')) {
      console.log('⚠️ Invalid image format, trying to fix:', img);
      // If it's just a filename, assume it's in uploads
      if (!img.includes('/')) {
        return `/uploads/${img}`;
      }
    }
    return img;
  });
  
  console.log('✅ Final images array:', images);
  console.log('🖼️ Product summary:', {
    name: product.name,
    originalImages: product.images,
    finalImages: images,
    hasValidImage: images.length > 0 && !images.some(img => img.includes('product-1.jpg'))
  });
  
  const brand = product.brand || 'Nike';
  const category = product.Category?.categoryName || product.category?.categoryName || product.categoryName || 'Shoes';
  const rating = product.rating || 4.0; // Default rating if not provided
  const isNew = product.isNew || product.isNewProduct || false;
  const discount = product.discount || 0;
  const totalStock = product.totalStock || product.stock || 0;
  
  const converted = {
    id: String(id),
    name: String(name),
    price: Number(price),
    originalPrice: Number(originalPrice),
    images: images, // Array of image strings
    brand: String(brand),
    category: String(category),
    rating: Number(rating),
    isNew: Boolean(isNew),
    discount: Number(discount),
    totalStock: Number(totalStock),
    reason: String(reason)
  };
  
  console.log('✅ Converted product:', {
    id: converted.id,
    name: converted.name,
    price: converted.price,
    images: converted.images,
    category: converted.category,
    brand: converted.brand
  });
  return converted;
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

// Async thunk for fetching trending products
export const fetchTrendingProducts = createAsyncThunk(
  'recommendations/fetchTrendingProducts',
  async (limit: number = 8) => {
    try {
      console.log('🔍 Fetching trending products with limit:', limit);
      const response = await API.get(`/recommendations/trending?limit=${limit}`);
      console.log('📊 Trending API response:', response.data);
      const products = response.data.data || [];
      console.log('📦 Trending products count:', products.length);
      
      const convertedProducts = products.map((product: BackendProduct) => 
        convertToRecommendationProduct(product, 'Trending now')
      );
      console.log('✅ Converted trending products:', convertedProducts.length);
      return convertedProducts;
    } catch (error) {
      console.error('❌ Error fetching trending products:', error);
      
      // Fallback: get regular products and create trending list
      try {
        const productsResponse = await API.get('/product');
        const allProducts = productsResponse.data.data || [];
        
        const trendingProducts = allProducts
          .filter((p: BackendProduct) => p.inStock !== false && p.isStock !== false)
          .sort((a: BackendProduct, b: BackendProduct) => {
            const scoreA = (a.isNew ? 3 : 0) + (a.rating || 4.0) + (a.discount ? 1 : 0);
            const scoreB = (b.isNew ? 3 : 0) + (b.rating || 4.0) + (b.discount ? 1 : 0);
            return scoreB - scoreA;
          })
          .slice(0, limit)
          .map((product: BackendProduct) => 
            convertToRecommendationProduct(product, 'Trending now')
          );
        
        console.log('✅ Fallback trending products:', trendingProducts.length);
        return trendingProducts;
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        return [];
      }
    }
  }
);

// Async thunk for fetching new arrivals
export const fetchNewArrivals = createAsyncThunk(
  'recommendations/fetchNewArrivals',
  async (limit: number = 6) => {
    try {
      const response = await API.get(`/recommendations/new-arrivals?limit=${limit}`);
      const products = response.data.data || [];
      return products.map((product: BackendProduct) => 
        convertToRecommendationProduct(product, 'Just arrived')
      );
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      
      // Fallback: get regular products and filter new ones
      try {
        const productsResponse = await API.get('/product');
        const allProducts = productsResponse.data.data || [];
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newArrivals = allProducts
          .filter((p: BackendProduct) => {
            if (p.isNew || p.isNewProduct) return true;
            if (p.createdAt) {
              const createdDate = new Date(p.createdAt);
              return createdDate >= thirtyDaysAgo;
            }
            return false;
          })
          .slice(0, limit)
          .map((product: BackendProduct) => 
            convertToRecommendationProduct(product, 'Just arrived')
          );
        
        return newArrivals;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  }
);

// Async thunk for fetching best sellers
export const fetchBestSellers = createAsyncThunk(
  'recommendations/fetchBestSellers',
  async (limit: number = 10) => {
    try {
      const response = await API.get(`/recommendations/best-sellers?limit=${limit}`);
      const products = response.data.data || [];
      return products.map((product: BackendProduct) => 
        convertToRecommendationProduct(product, 'Best seller')
      );
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      
      // Fallback: get regular products and filter high-rated ones
      try {
        const productsResponse = await API.get('/product');
        const allProducts = productsResponse.data.data || [];
        
        const bestSellers = allProducts
          .filter((p: BackendProduct) => (p.rating || 4.0) >= 3.5 && (p.inStock !== false && p.isStock !== false))
          .sort((a: BackendProduct, b: BackendProduct) => (b.rating || 4.0) - (a.rating || 4.0))
          .slice(0, limit)
          .map((product: BackendProduct) => 
            convertToRecommendationProduct(product, 'Best seller')
          );
        
        return bestSellers;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  }
);

// Async thunk for fetching on sale products
export const fetchOnSaleProducts = createAsyncThunk(
  'recommendations/fetchOnSaleProducts',
  async (limit: number = 8) => {
    try {
      const response = await API.get(`/recommendations/on-sale?minDiscount=10&limit=${limit}`);
      const products = response.data.data || [];
      return products.map((product: BackendProduct) => 
        convertToRecommendationProduct(product, 'On sale')
      );
    } catch (error) {
      console.error('Error fetching on sale products:', error);
      
      // Fallback: get regular products and filter discounted ones
      try {
        const productsResponse = await API.get('/product');
        const allProducts = productsResponse.data.data || [];
        
        const onSaleProducts = allProducts
          .filter((p: BackendProduct) => p.discount && p.discount >= 5 && (p.inStock !== false && p.isStock !== false))
          .sort((a: BackendProduct, b: BackendProduct) => (b.discount || 0) - (a.discount || 0))
          .slice(0, limit)
          .map((product: BackendProduct) => 
            convertToRecommendationProduct(product, 'On sale')
          );
        
        return onSaleProducts;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return [];
      }
    }
  }
);

// Async thunk for fetching all collections
export const fetchAllCollections = createAsyncThunk(
  'recommendations/fetchAllCollections',
  async (limit: number = 6) => {
    try {
      console.log('🔍 Fetching all collections with limit:', limit);
      
      // First, try to get regular products to ensure we have data
      const productsResponse = await API.get('/product');
      const allProducts = productsResponse.data.data || [];
      console.log('📦 Total products available:', allProducts.length);
      
      // Debug: Check the first product's image data
      if (allProducts.length > 0) {
        console.log('🔍 First product image data:', {
          name: allProducts[0].name,
          images: allProducts[0].images,
          image: allProducts[0].image,
          Images: allProducts[0].Images,
          allFields: Object.keys(allProducts[0])
        });
        
        // Test the conversion function
        const testProduct = convertToRecommendationProduct(allProducts[0], 'Test');
        console.log('🧪 Test conversion result:', {
          name: testProduct.name,
          images: testProduct.images,
          originalImages: allProducts[0].images
        });
        
        // Test with the specific Air Max 270 product if found
        const airMaxProduct = allProducts.find((p: BackendProduct) => p.name?.includes('Air Max 270'));
        if (airMaxProduct) {
          console.log('🧪 Air Max 270 test:', {
            originalImages: airMaxProduct.images,
            expectedURL: airMaxProduct.images?.[0] ? `https://nike-backend-1-g9i6.onrender.com${airMaxProduct.images[0]}.jpg` : 'No images'
          });
        }
      }
      
      if (allProducts.length === 0) {
        console.log('❌ No products found in database');
        return {
          trending: [],
          newArrivals: [],
          bestSellers: [],
          onSale: []
        };
      }
      
      // Try the collections endpoint first
      try {
      const response = await API.get(`/recommendations/collections?limit=${limit}`);
      console.log('📊 Collections API response:', response.data);
      const collections = response.data.data || {};
      
      const result = {
        trending: collections.trending?.products?.map((product: BackendProduct) => 
          convertToRecommendationProduct(product, 'Trending now')
        ) || [],
        newArrivals: collections.newArrivals?.products?.map((product: BackendProduct) => 
          convertToRecommendationProduct(product, 'Just arrived')
        ) || [],
        bestSellers: collections.bestSellers?.products?.map((product: BackendProduct) => 
          convertToRecommendationProduct(product, 'Best seller')
        ) || [],
        onSale: collections.onSale?.products?.map((product: BackendProduct) => 
          convertToRecommendationProduct(product, 'On sale')
        ) || [],
      };
      
        // If we got some data from the API, use it
        if (result.trending.length > 0 || result.newArrivals.length > 0 || 
            result.bestSellers.length > 0 || result.onSale.length > 0) {
          console.log('✅ Collections result from API:', {
        trending: result.trending.length,
        newArrivals: result.newArrivals.length,
        bestSellers: result.bestSellers.length,
        onSale: result.onSale.length
      });
      return result;
        }
      } catch (apiError) {
        console.log('⚠️ Collections API failed, trying individual endpoints...', apiError);
        console.log('🔍 API Error details:', {
          message: apiError instanceof Error ? apiError.message : 'Unknown error',
          status: (apiError as { response?: { status?: number } })?.response?.status,
          data: (apiError as { response?: { data?: unknown } })?.response?.data
        });
      }
      
      // Fallback: try individual endpoints
      try {
        console.log('🔄 Trying individual endpoints as fallback...');
        const [trendingRes, newArrivalsRes, bestSellersRes, onSaleRes] = await Promise.allSettled([
          API.get(`/recommendations/trending?limit=${limit}`),
          API.get(`/recommendations/new-arrivals?limit=${limit}`),
          API.get(`/recommendations/best-sellers?limit=${limit}`),
          API.get(`/recommendations/on-sale?minDiscount=10&limit=${limit}`)
        ]);
        
        // Log the results of each endpoint
        console.log('🔍 Individual endpoint results:', {
          trending: trendingRes.status,
          newArrivals: newArrivalsRes.status,
          bestSellers: bestSellersRes.status,
          onSale: onSaleRes.status
        });
        
        // Log errors for rejected promises
        if (trendingRes.status === 'rejected') {
          console.error('❌ Trending endpoint failed:', trendingRes.reason);
        }
        if (newArrivalsRes.status === 'rejected') {
          console.error('❌ New arrivals endpoint failed:', newArrivalsRes.reason);
        }
        if (bestSellersRes.status === 'rejected') {
          console.error('❌ Best sellers endpoint failed:', bestSellersRes.reason);
        }
        if (onSaleRes.status === 'rejected') {
          console.error('❌ On sale endpoint failed:', onSaleRes.reason);
        }
        
        const fallbackResult = {
          trending: trendingRes.status === 'fulfilled' ? 
            (trendingRes.value.data.data || []).map((product: BackendProduct) => 
              convertToRecommendationProduct(product, 'Trending now')
            ) : [],
          newArrivals: newArrivalsRes.status === 'fulfilled' ? 
            (newArrivalsRes.value.data.data || []).map((product: BackendProduct) => 
              convertToRecommendationProduct(product, 'Just arrived')
            ) : [],
          bestSellers: bestSellersRes.status === 'fulfilled' ? 
            (bestSellersRes.value.data.data || []).map((product: BackendProduct) => 
              convertToRecommendationProduct(product, 'Best seller')
            ) : [],
          onSale: onSaleRes.status === 'fulfilled' ? 
            (onSaleRes.value.data.data || []).map((product: BackendProduct) => 
              convertToRecommendationProduct(product, 'On sale')
            ) : [],
        };
        
        // If we got some data from individual endpoints, use it
        if (fallbackResult.trending.length > 0 || fallbackResult.newArrivals.length > 0 || 
            fallbackResult.bestSellers.length > 0 || fallbackResult.onSale.length > 0) {
          console.log('🔄 Fallback result from individual endpoints:', {
          trending: fallbackResult.trending.length,
          newArrivals: fallbackResult.newArrivals.length,
          bestSellers: fallbackResult.bestSellers.length,
          onSale: fallbackResult.onSale.length
        });
        return fallbackResult;
        }
      } catch (fallbackError) {
        console.log('⚠️ Individual endpoints also failed:', fallbackError);
      }
      
      // Last resort: create recommendations from regular products
      console.log('🔄 Creating recommendations from regular products...');
      
      // Create trending products (mix of new and high-rated products)
      const trendingProducts = allProducts
        .filter((p: BackendProduct) => p.inStock !== false && p.isStock !== false)
        .sort((a: BackendProduct, b: BackendProduct) => {
          // Prioritize new products, then high ratings, then discounts
          const scoreA = (a.isNew ? 3 : 0) + (a.rating || 4.0) + (a.discount ? 1 : 0);
          const scoreB = (b.isNew ? 3 : 0) + (b.rating || 4.0) + (b.discount ? 1 : 0);
          return scoreB - scoreA;
        })
        .slice(0, limit)
        .map((product: BackendProduct) => {
          console.log('🔄 Creating trending product:', product.name, 'with images:', product.images);
          return convertToRecommendationProduct(product, 'Trending now');
        });
      
      // Create new arrivals (products created in last 30 days or marked as new)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      console.log('🔍 New Arrivals Debug:', {
        totalProducts: allProducts.length,
        thirtyDaysAgo: thirtyDaysAgo.toISOString(),
        productsWithIsNew: allProducts.filter((p: BackendProduct) => p.isNew || p.isNewProduct).length,
        productsWithRecentCreatedAt: allProducts.filter((p: BackendProduct) => {
          if (!p.createdAt) return false;
          const createdDate = new Date(p.createdAt);
          return createdDate >= thirtyDaysAgo;
        }).length,
        sampleProducts: allProducts.slice(0, 3).map((p: BackendProduct) => ({
          name: p.name,
          isNew: p.isNew,
          isNewProduct: p.isNewProduct,
          createdAt: p.createdAt,
          inStock: p.inStock,
          isStock: p.isStock
        }))
      });
      
      const newArrivals = allProducts
        .filter((p: BackendProduct) => {
          // Must be in stock
          if (p.inStock === false || p.isStock === false) return false;
          
          // Check if marked as new
          if (p.isNew || p.isNewProduct) return true;
          
          // Check if created in last 30 days
          if (p.createdAt) {
            const createdDate = new Date(p.createdAt);
            return createdDate >= thirtyDaysAgo;
          }
          return false;
        })
        .sort((a: BackendProduct, b: BackendProduct) => {
          // Prioritize new products, then by creation date
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        })
        .slice(0, limit)
        .map((product: BackendProduct) => {
          console.log('🔄 Creating new arrival product:', {
            name: product.name,
            isNew: product.isNew,
            isNewProduct: product.isNewProduct,
            createdAt: product.createdAt,
            inStock: product.inStock,
            isStock: product.isStock,
            images: product.images
          });
          return convertToRecommendationProduct(product, 'Just arrived');
        });
      
      // If no new arrivals found with strict criteria, use a more lenient approach
      let finalNewArrivals = newArrivals;
      if (newArrivals.length === 0) {
        console.log('⚠️ No strict new arrivals found, using lenient fallback...');
        finalNewArrivals = allProducts
          .filter((p: BackendProduct) => p.inStock !== false && p.isStock !== false)
          .sort((a: BackendProduct, b: BackendProduct) => {
            // Sort by creation date (newest first) as fallback
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          })
                .slice(0, limit)
          .map((product: BackendProduct) => {
            console.log('🔄 Creating lenient new arrival product:', product.name);
            return convertToRecommendationProduct(product, 'Just arrived');
          });
      }
      
      // Create best sellers (products with high ratings)
      const bestSellers = allProducts
        .filter((p: BackendProduct) => (p.rating || 4.0) >= 3.5 && (p.inStock !== false && p.isStock !== false))
        .sort((a: BackendProduct, b: BackendProduct) => (b.rating || 4.0) - (a.rating || 4.0))
                .slice(0, limit)
                .map((product: BackendProduct) => 
                  convertToRecommendationProduct(product, 'Best seller')
        );
      
      // Create on sale products (products with discount)
      const onSaleProducts = allProducts
        .filter((p: BackendProduct) => p.discount && p.discount >= 5 && (p.inStock !== false && p.isStock !== false))
        .sort((a: BackendProduct, b: BackendProduct) => (b.discount || 0) - (a.discount || 0))
                .slice(0, limit)
                .map((product: BackendProduct) => 
                  convertToRecommendationProduct(product, 'On sale')
        );
      
      const lastResortResult = {
        trending: trendingProducts,
        newArrivals: finalNewArrivals,
        bestSellers: bestSellers.length > 0 ? bestSellers : trendingProducts.slice(0, limit),
        onSale: onSaleProducts.length > 0 ? onSaleProducts : trendingProducts.slice(0, limit),
      };
      
      console.log('✅ Final result from regular products:', {
              trending: lastResortResult.trending.length,
              newArrivals: lastResortResult.newArrivals.length,
              bestSellers: lastResortResult.bestSellers.length,
              onSale: lastResortResult.onSale.length
            });
            
            return lastResortResult;
      
    } catch (error) {
      console.error('❌ All methods failed:', error);
      
      // Ultimate fallback: return empty arrays
      return {
        trending: [],
        newArrivals: [],
        bestSellers: [],
        onSale: []
      };
    }
  }
);

// Async thunk for fetching personalized recommendations
export const fetchPersonalizedRecommendations = createAsyncThunk(
  'recommendations/fetchPersonalizedRecommendations',
  async (_, { getState }) => {
    try {
      console.log('🎯 Fetching personalized recommendations...');
      console.log('🎯 Thunk started at:', new Date().toISOString());
      
      // Get current state to access cart and purchase history
      const state = getState() as { recommendations: RecommendationsState };
      const cartHistory = state.recommendations?.cartHistory || [];
      const purchaseHistory = state.recommendations?.purchaseHistory || [];
      
      console.log('📊 User activity data:', {
        cartHistoryCount: cartHistory.length,
        purchaseHistoryCount: purchaseHistory.length,
        cartHistory: cartHistory.map((item: RecommendationProduct) => ({ id: item.id, name: item.name, brand: item.brand })),
        purchaseHistory: purchaseHistory.map((item: RecommendationProduct) => ({ id: item.id, name: item.name, brand: item.brand }))
      });
      
      // If user has no activity, fetch general recommendations
      if (cartHistory.length === 0 && purchaseHistory.length === 0) {
        console.log('📝 No user activity found, fetching general recommendations');
        console.log('📝 Cart history length:', cartHistory.length, 'Purchase history length:', purchaseHistory.length);
        const response = await API.get("/product");
        if (response.status === 200 && response.data?.data) {
          const products: BackendProduct[] = response.data.data;
          const generalRecommendations = products
            .filter(product => product.isStock)
            .sort((a, b) => {
              // Prioritize new products, discounts, and ratings
              const scoreA = (a.isNew ? 3 : 0) + ((a.discount || 0) > 0 ? 2 : 0) + (a.rating || 0);
              const scoreB = (b.isNew ? 3 : 0) + ((b.discount || 0) > 0 ? 2 : 0) + (b.rating || 0);
              return scoreB - scoreA;
            })
            .slice(0, 6)
            .map(product => convertToRecommendationProduct(product, 'Popular items'));
          
          return generalRecommendations;
        }
      }
      
      // Try backend recommendations first
    try {
      console.log('🎯 Calling backend personalized recommendations API...');
      const response = await API.get('/recommendations/personalized');
      console.log('📊 Backend API response:', response.data);
      
      if (response.data && response.data.data) {
        const backendRecommendations = response.data.data.map((product: BackendProduct) => 
          convertToRecommendationProduct(product, 'Recommended for you')
        );
        
        console.log('✅ Backend recommendations fetched:', backendRecommendations.length);
        return backendRecommendations;
      }
    } catch (backendError) {
      console.log('⚠️ Backend recommendations failed, using local logic:', backendError);
    }
      
      // Fallback: Generate recommendations based on user activity
      const response = await API.get("/product");
      if (response.status !== 200 || !response.data?.data) {
        throw new Error('Failed to fetch products');
      }
      
      const allProducts: BackendProduct[] = response.data.data;
      const userActivity = [...cartHistory, ...purchaseHistory];
      
      if (userActivity.length > 0) {
        console.log('🎯 Generating recommendations based on user activity');
        
        // Get unique brands and categories from user activity
        const userBrands = [...new Set(userActivity.map((item: RecommendationProduct) => item.brand).filter(Boolean))];
        const userCategories = [...new Set(userActivity.map((item: RecommendationProduct) => item.category).filter(Boolean))];
        
        console.log('🏷️ User preferences:', { userBrands, userCategories });
        
        // Find similar products based on brand and category
        const similarProducts = allProducts
          .filter(product => {
            // Exclude products user already has
            const userProductIds = userActivity.map((item: RecommendationProduct) => item.id).filter(Boolean);
            const productId = product.id || product._id || product.productId;
            if (productId && userProductIds.includes(productId)) {
              return false;
            }
            
            // Check if product matches user preferences
            const productBrand = product.brand?.toLowerCase();
            const productCategory = (typeof product.category === 'string' ? product.category : 'shoes').toLowerCase();
            
            const matchesBrand = userBrands.some(brand => 
              brand.toLowerCase() === productBrand || 
              (productBrand && productBrand.includes(brand.toLowerCase()))
            );
            
            const matchesCategory = userCategories.some(category => 
              category.toLowerCase() === productCategory ||
              productCategory.includes(category.toLowerCase())
            );
            
            return (matchesBrand || matchesCategory) && product.isStock;
          })
          .sort((a, b) => {
            // Prioritize by brand match, then by discount, then by rating
            const scoreA = (a.brand && userBrands.includes(a.brand) ? 3 : 0) + ((a.discount || 0) > 0 ? 2 : 0) + (a.rating || 0);
            const scoreB = (b.brand && userBrands.includes(b.brand) ? 3 : 0) + ((b.discount || 0) > 0 ? 2 : 0) + (b.rating || 0);
            return scoreB - scoreA;
          })
          .slice(0, 6)
          .map(product => convertToRecommendationProduct(product, 'Based on your activity'));
        
        if (similarProducts.length > 0) {
        console.log('✅ Generated personalized recommendations:', similarProducts.length, similarProducts);
        return similarProducts;
        }
      }
      
      // Final fallback: general recommendations
      console.log('📝 Using general recommendations as fallback');
      const generalRecommendations = allProducts
        .filter(product => product.isStock)
        .sort((a, b) => {
          const scoreA = (a.isNew ? 3 : 0) + ((a.discount || 0) > 0 ? 2 : 0) + (a.rating || 0);
          const scoreB = (b.isNew ? 3 : 0) + ((b.discount || 0) > 0 ? 2 : 0) + (b.rating || 0);
          return scoreB - scoreA;
        })
        .slice(0, 6)
        .map(product => convertToRecommendationProduct(product, 'Popular items'));
      
      console.log('🎯 Final fallback recommendations:', generalRecommendations.length, generalRecommendations);
      console.log('🎯 Returning from fetchPersonalizedRecommendations with:', generalRecommendations.length, 'items');
      
      // TEMPORARY: Add test data if no recommendations found
      if (generalRecommendations.length === 0) {
        console.log('🧪 TEMPORARY: Adding test recommendations for debugging');
        const testRecommendations = [
          {
            id: 'test-rec-1',
            name: 'Test Recommendation 1',
            price: 5000,
            originalPrice: 6000,
            images: ['/images/product-1.jpg'],
            brand: 'Nike',
            category: 'Shoes',
            reason: 'Test recommendation 1'
          },
          {
            id: 'test-rec-2', 
            name: 'Test Recommendation 2',
            price: 7000,
            originalPrice: 8000,
            images: ['/images/product-2.jpg'],
            brand: 'Adidas',
            category: 'Shoes',
            reason: 'Test recommendation 2'
          }
        ];
        console.log('🧪 Returning test recommendations:', testRecommendations);
        return testRecommendations;
      }
      
      return generalRecommendations;
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
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
    addToCartHistory: (state, action: PayloadAction<RecommendationProduct>) => {
      const product = action.payload;
      console.log('🛒 Redux: Adding to cart history:', product);
      // Remove if already exists
      state.cartHistory = state.cartHistory.filter(p => p.id !== product.id);
      // Add to beginning
      state.cartHistory.unshift(product);
      // Keep only last 20
      state.cartHistory = state.cartHistory.slice(0, 20);
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem('cartHistory', JSON.stringify(state.cartHistory));
        console.log('💾 Cart history saved to localStorage');
      } catch (error) {
        console.error('❌ Failed to save cart history to localStorage:', error);
      }
      
      console.log('✅ Cart history updated. New length:', state.cartHistory.length, 'Items:', state.cartHistory);
    },
    addToPurchaseHistory: (state, action: PayloadAction<RecommendationProduct>) => {
      const product = action.payload;
      // Remove if already exists
      state.purchaseHistory = state.purchaseHistory.filter(p => p.id !== product.id);
      // Add to beginning
      state.purchaseHistory.unshift(product);
      // Keep only last 20
      state.purchaseHistory = state.purchaseHistory.slice(0, 20);
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
      })
      .addCase(fetchTrendingProducts.fulfilled, (state, action) => {
        state.trendingProducts = action.payload;
      })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.newArrivals = action.payload;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.bestSellers = action.payload;
      })
      .addCase(fetchOnSaleProducts.fulfilled, (state, action) => {
        state.onSaleProducts = action.payload;
      })
      .addCase(fetchAllCollections.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllCollections.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trendingProducts = action.payload.trending;
        state.newArrivals = action.payload.newArrivals;
        state.bestSellers = action.payload.bestSellers;
        state.onSaleProducts = action.payload.onSale;
        state.error = null;
        console.log('✅ Redux state updated with collections:', {
          trending: action.payload.trending.length,
          newArrivals: action.payload.newArrivals.length,
          bestSellers: action.payload.bestSellers.length,
          onSale: action.payload.onSale.length
        });
      })
      .addCase(fetchAllCollections.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch collections';
        console.error('❌ Redux state: fetchAllCollections rejected:', action.error);
      })
      .addCase(fetchPersonalizedRecommendations.fulfilled, (state, action) => {
        console.log('✅ Redux: fetchPersonalizedRecommendations fulfilled:', {
          payloadLength: action.payload.length,
          payload: action.payload,
          currentPersonalizedLength: state.personalizedRecommendations.length
        });
        state.personalizedRecommendations = action.payload;
        console.log('🔄 Redux: After setting personalizedRecommendations:', {
          newLength: state.personalizedRecommendations.length,
          newData: state.personalizedRecommendations
        });
      })
      .addCase(fetchPersonalizedRecommendations.rejected, (state, action) => {
        console.error('❌ Redux: fetchPersonalizedRecommendations rejected:', action.error);
        state.error = action.error.message || 'Failed to fetch personalized recommendations';
      });
  },
});

export const { addToRecentlyViewed, addToCartHistory, addToPurchaseHistory, clearRecommendations } = recommendationsSlice.actions;
export default recommendationsSlice.reducer;