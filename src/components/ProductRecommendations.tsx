import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRecommendations, RecommendationProduct } from '../store/recommendationsSlice';
import { addToCart } from '../store/cartSlice';
import { addToWishlist } from '../store/wishlistSlice';
import { Status } from '../globals/types/types';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, TrendingUp, Eye, Users, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductFilters from '../pages/product/components/ProductFilters';

//Recommendation system of product

interface ProductRecommendationsProps {
  type?: 'recentlyViewed' | 'frequentlyBought' | 'similarProducts' | 'trendingProducts' | 'personalized';
  productId?: string;
  title?: string;
  subtitle?: string;
  maxProducts?: number;
  showReason?: boolean;
  className?: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  type = 'trendingProducts',
  productId,
  title,
  subtitle,
  maxProducts = 4,
  showReason = true,
  className = ''
}) => {
  const dispatch = useAppDispatch();
  const { 
    recentlyViewed, 
    frequentlyBought, 
    trendingProducts, 
    personalizedRecommendations,
    loading,
    error
  } = useAppSelector((store) => store.recommendations);
  
  const cartStatus = useAppSelector((store) => store.cart.status);
  
  const isLoggedIn = useAppSelector((store) => !!store.auth.user.token || !!localStorage.getItem("tokenauth"));

  // Local loading state for refresh button
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Update last updated time when data changes
  useEffect(() => {
    if (!loading && trendingProducts.length > 0) {
      setLastUpdated(new Date());
    }
  }, [trendingProducts.length, loading]);

  useEffect(() => {
    if (type !== 'similarProducts') {
      dispatch(fetchRecommendations());
    }
  }, [dispatch, type]);

  // Refresh data periodically for real-time updates
  useEffect(() => {
    if (type === 'similarProducts') return; // Don't auto-refresh similar products
    
    const interval = setInterval(() => {
      dispatch(fetchRecommendations());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch, type]);

  // If it's similar products, use ProductFilters component
  if (type === 'similarProducts') {
    return (
      <section className={`py-12 bg-gradient-to-br from-gray-50 to-white ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-5 h-5" />
              <span>Similar Products</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Similar Products
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              You might also like these products
            </p>
          </div>
          
          {/* Use ProductFilters for similar products */}
          <ProductFilters />
        </div>
      </section>
    );
  }

  const getRecommendations = () => {
    switch (type) {
      case 'recentlyViewed':
        return recentlyViewed.slice(0, maxProducts);
      case 'frequentlyBought':
        return frequentlyBought.slice(0, maxProducts);
      case 'trendingProducts':
        return trendingProducts.slice(0, maxProducts);
      case 'personalized':
        return personalizedRecommendations.slice(0, maxProducts);
      default:
        return trendingProducts.slice(0, maxProducts);
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'recentlyViewed':
        return 'Recently Viewed';
      case 'frequentlyBought':
        return 'Frequently Bought Together';
      case 'trendingProducts':
        return 'Trending Now';
      case 'personalized':
        return 'Recommended for You';
      default:
        return 'Recommended Products';
    }
  };

  const getSubtitle = () => {
    if (subtitle) return subtitle;
    
    switch (type) {
      case 'recentlyViewed':
        return 'Continue shopping from where you left off';
      case 'frequentlyBought':
        return 'Customers often buy these together';
      case 'trendingProducts':
        return 'Most popular products right now';
      case 'personalized':
        return 'Curated just for you';
      default:
        return 'Discover amazing products';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'recentlyViewed':
        return <Eye className="w-5 h-5" />;
      case 'frequentlyBought':
        return <Users className="w-5 h-5" />;
      case 'trendingProducts':
        return <TrendingUp className="w-5 h-5" />;
      case 'personalized':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const handleAddToCart = async (product: RecommendationProduct) => {
    console.log('🛒 handleAddToCart called with product:', product);
    console.log('🛒 User logged in status:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('❌ User not logged in, showing error toast');
      toast.error("Please log in to add to cart");
      return;
    }
    
    try {
      console.log('🛒 Dispatching addToCart with:', {
        productId: product.id,
        size: "Default",
        color: "Default"
      });
      
      // Add to cart and redirect to product detail page
      const result = await dispatch(addToCart({
        productId: product.id,
        size: "Default", // Default size
        color: "Default"  // Default color
      })).unwrap();
      
      console.log('✅ Add to cart successful:', result);
      toast.success("Added to cart! Redirecting to product page...");
      
      // Redirect to product detail page after adding to cart
      setTimeout(() => {
        window.location.href = `/product/${product.id}`;
      }, 1000);
      
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const handleAddToWishlist = (product: RecommendationProduct) => {
    console.log('❤️ handleAddToWishlist called with product:', product);
    console.log('❤️ User logged in status:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('❌ User not logged in, showing error toast');
      toast.error("Please log in to add to wishlist");
      return;
    }

    console.log('❤️ Creating wishlist item:', {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      rating: product.rating || 4.5,
      reviews: product.reviewCount || 0,
      inStock: (product.totalStock && product.totalStock > 0) || true,
      totalStock: product.totalStock || 0,
      category: product.category,
      brand: product.brand,
    });

    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      rating: product.rating || 4.5,
      reviews: product.reviewCount || 0,
      inStock: (product.totalStock && product.totalStock > 0) || true, // Check stock first, default to true for recommendations
      totalStock: product.totalStock || 0,
      category: product.category,
      brand: product.brand,
    };
    
    dispatch(addToWishlist(wishlistItem));
    console.log('✅ Added to wishlist successfully');
    toast.success("Added to wishlist");
  };

  const recommendations = getRecommendations();

  // Debug logging
  console.log('ProductRecommendations render - type:', type);
  console.log('ProductRecommendations render - productId:', productId);
  console.log('ProductRecommendations render - final recommendations:', recommendations);
  console.log('ProductRecommendations render - loading:', loading);

  if (loading) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600 text-lg mb-2">Failed to load recommendations</p>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button 
                onClick={async () => {
                  setIsRefreshing(true);
                  try {
                    dispatch(fetchRecommendations());
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
                disabled={isRefreshing}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isRefreshing ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No recommendations available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={`py-12 bg-gradient-to-br from-gray-50 to-white ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            {getIcon()}
            <span>{getTitle()}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {getTitle()}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {getSubtitle()}
          </p>
          
          {/* Refresh Button */}
          <button
            onClick={async () => {
              setIsRefreshing(true);
              try {
                await dispatch(fetchRecommendations());
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing || loading}
            className="mt-4 inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh recommendations"
          >
            <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          {/* Last Updated Indicator */}
          <div className="mt-2 text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
            <span className="ml-2 inline-flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="ml-1">Live</span>
            </span>
            <span className="ml-4 text-xs text-gray-400">
              Auto-refresh every 30s
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((product) => (
            <div key={product.id} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                             {/* Badges */}
               <div className="absolute top-3 left-3 flex space-x-2 z-10">
                 {product.isNew && (
                   <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                     New
                   </span>
                 )}
                 {product.discount && (
                   <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                     -{product.discount}%
                   </span>
                 )}
                 {/* Stock Status Badge */}
                 {product.totalStock !== undefined && (
                   <span className={`text-white text-xs font-bold px-2 py-1 rounded-md ${
                     product.totalStock > 0 ? 'bg-green-500' : 'bg-red-500'
                   }`}>
                     {product.totalStock > 0 ? 'In Stock' : 'Out of Stock'}
                   </span>
                 )}
               </div>

              {/* Reason Badge */}
              {showReason && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
                    {product.reason}
                  </span>
                </div>
              )}

              {/* Product Image */}
              <Link to={`/product/${product.id}`}>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image.startsWith('http') ? product.image : 
                         product.image.startsWith('/images/') ? product.image : 
                         `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${product.image.replace("/uploads", "")}.jpg`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/product-1.jpg"; // Fallback image
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>

                               {/* Product Info */}
                 <div className="p-6">
                   <div className="mb-3">
                     <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                       {product.name}
                     </h3>
                     <div className="flex items-center justify-between">
                       <p className="text-gray-500 text-sm">{product.brand}</p>
                       <p className="text-gray-400 text-xs">{product.category}</p>
                     </div>
                   </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">({product.reviewCount || 0})</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-bold text-xl text-indigo-600">
                      रु {product.price?.toLocaleString()}
                    </span>
                    {product.discount && (
                      <span className="text-gray-400 text-sm line-through ml-2">
                        रु {((product.price * 100) / (100 - product.discount)).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                                 {/* Action Buttons */}
                 <div className="flex space-x-2">
                                       <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🛒 Add to Cart button clicked for:', product);
                        handleAddToCart(product);
                      }}
                      disabled={product.totalStock !== undefined && product.totalStock <= 0 || cartStatus === Status.LOADING}
                      className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        product.totalStock !== undefined && product.totalStock <= 0
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : cartStatus === Status.LOADING
                          ? 'bg-indigo-400 text-white cursor-wait'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {product.totalStock !== undefined && product.totalStock <= 0 
                        ? 'Out of Stock' 
                        : cartStatus === Status.LOADING 
                        ? 'Adding...' 
                        : 'Add to Cart'
                      }
                    </button>
                   <button
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       console.log('❤️ Add to Wishlist button clicked for:', product);
                       handleAddToWishlist(product);
                     }}
                     className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                     title="Add to Wishlist"
                   >
                     <Heart className="w-4 h-4" />
                   </button>
                   <Link
                     to={`/product/${product.id}`}
                     className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                     title="View Details"
                   >
                     <Eye className="w-4 h-4" />
                   </Link>
                 </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            to="/all-shoes"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium"
          >
            View All Products
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductRecommendations; 
