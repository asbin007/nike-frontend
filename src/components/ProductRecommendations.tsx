import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRecommendations, fetchSimilarProducts, addToRecentlyViewed } from '../store/recommendationsSlice';
import { addToCart } from '../store/cartSlice';
import { addToWishlist } from '../store/wishlistSlice';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, TrendingUp, Eye, Users, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

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
    similarProducts, 
    trendingProducts, 
    personalizedRecommendations,
    loading 
  } = useAppSelector((store) => store.recommendations);
  
  const isLoggedIn = useAppSelector((store) => !!store.auth.user.token || !!localStorage.getItem("tokenauth"));

  useEffect(() => {
    if (type === 'similarProducts' && productId) {
      dispatch(fetchSimilarProducts(productId));
    } else {
      dispatch(fetchRecommendations(productId));
    }
  }, [dispatch, type, productId]);

  const getRecommendations = () => {
    switch (type) {
      case 'recentlyViewed':
        return recentlyViewed.slice(0, maxProducts);
      case 'frequentlyBought':
        return frequentlyBought.slice(0, maxProducts);
      case 'similarProducts':
        return similarProducts.slice(0, maxProducts);
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
      case 'similarProducts':
        return 'Similar Products';
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
      case 'similarProducts':
        return 'You might also like these products';
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
      case 'similarProducts':
        return <Sparkles className="w-5 h-5" />;
      case 'trendingProducts':
        return <TrendingUp className="w-5 h-5" />;
      case 'personalized':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const handleAddToCart = (product: any) => {
    if (!isLoggedIn) {
      toast.error("Please log in to add to cart");
      return;
    }
    
    dispatch(addToCart(
      product.id,
      product.size?.[0] || "Default",
      product.color?.[0] || "Default",
      product.RAM?.[0] || "Default",
      product.ROM?.[0] || "Default"
    ));
    toast.success("Added to cart");
  };

  const handleAddToWishlist = (product: any) => {
    if (!isLoggedIn) {
      toast.error("Please log in to add to wishlist");
      return;
    }

    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      rating: product.rating || 4.5,
      reviews: product.reviewCount || 0,
      inStock: product.inStock,
      category: product.category,
      brand: product.brand,
    };
    dispatch(addToWishlist(wishlistItem));
    toast.success("Added to wishlist");
  };

  const recommendations = getRecommendations();

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
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
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
              <Link to={`/men/${product.brand}/${product.id}`}>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                  <p className="text-gray-500 text-sm">{product.brand}</p>
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
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleAddToWishlist(product)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
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