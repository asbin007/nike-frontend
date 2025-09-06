import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RecommendationProduct } from '../store/recommendationsSlice';
import { ChevronLeft, ChevronRight, Heart, BarChart3 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';
import { addToComparison, removeFromComparison } from '../store/comparisonSlice';
import toast from 'react-hot-toast';

const CLOUDINARY_VERSION = "v1750340657";

interface ProductRecommendationsProps {
  title: string;
  products: RecommendationProduct[];
  type: 'trending' | 'personalized' | 'similar' | 'frequentlyBought' | 'new-arrivals' | 'best-sellers' | 'on-sale';
  loading?: boolean;
  className?: string;
  showActions?: boolean; // Add showActions prop like ProductCard
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  title,
  products,
  type,
  loading = false,
  className = '',
  showActions = true
}) => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((store) => !!store.auth.user.token || !!localStorage.getItem("tokenauth"));
  const { items: wishlistItems } = useAppSelector((store) => store.wishlist);
  const { products: comparisonProducts, maxProducts } = useAppSelector((store) => store.comparison);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 4; // Show 4 items per slide
  const totalSlides = Math.ceil(products.length / itemsPerSlide);

  // DEBUG: Log component props and state
  console.log(`🎯 ProductRecommendations [${type}]:`, {
    title,
    productsLength: products.length,
    products,
    loading,
    type,
    currentSlide,
    totalSlides,
    itemsPerSlide
  });

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Wishlist and Comparison handlers (same as ProductCard)
  const handleWishlistToggle = (e: React.MouseEvent, product: RecommendationProduct) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast.error("Please log in to add to wishlist");
      return;
    }

    const isInWishlist = wishlistItems.some(item => item.id === product.id);

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.success("Removed from wishlist");
    } else {
      const wishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ? `https://res.cloudinary.com/dxpe7jikz/image/upload/${CLOUDINARY_VERSION}${product.images[0].replace("/uploads", "")}.jpg` : "",
        rating: product.rating || 4.5,
        reviews: 0,
        inStock: (product.totalStock && product.totalStock > 0) || false,
        totalStock: product.totalStock,
        category: product.category,
        brand: product.brand,
      };
      dispatch(addToWishlist(wishlistItem));
      toast.success("Added to wishlist");
    }
  };

  const handleComparisonToggle = (e: React.MouseEvent, product: RecommendationProduct) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    const isInComparison = comparisonProducts.some(item => item.id === product.id);

    if (isInComparison) {
      dispatch(removeFromComparison(product.id));
      toast.success("Removed from comparison");
    } else {
      if (comparisonProducts.length >= maxProducts) {
        toast.error(`You can only compare up to ${maxProducts} products`);
        return;
      }
      
      const comparisonItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ? `https://res.cloudinary.com/dxpe7jikz/image/upload/${CLOUDINARY_VERSION}${product.images[0].replace("/uploads", "")}.jpg` : "",
        brand: product.brand,
        category: product.category,
        description: product.description || "Premium quality shoes designed for comfort and style",
        inStock: (product.totalStock && product.totalStock > 0) || false,
        totalStock: product.totalStock || 0,
        color: Array.isArray(product.colors) ? product.colors : (product.colors ? [product.colors] : []),
        size: Array.isArray(product.sizes) ? product.sizes : (product.sizes ? [product.sizes] : []),
        isNew: product.isNew,
        rating: product.rating || 4.5,
        reviewCount: 0,
      };
      dispatch(addToComparison(comparisonItem));
      toast.success("Added to comparison");
    }
  };

  // Debug logging for ProductRecommendations
  console.log(`🔍 ProductRecommendations [${title}]:`, {
    type,
    productsLength: products?.length || 0,
    loading,
    products: products?.slice(0, 2).map(p => ({
      name: p.name,
      originalImages: p.images,
      isRealImage: p.images && p.images.length > 0 && !p.images.some(img => img.includes('product-1.jpg') || img.includes('product-2.jpg') || img.includes('product-3.jpg'))
    })) // Show first 2 products with image info
  });

  if (loading) {
    return (
      <div className={`${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={`${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No recommendations available at the moment.</p>
        </div>
      </div>
    );
  }


  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-4">
          {type === 'trending' && (
            <Link 
              to="/trending" 
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View All →
            </Link>
          )}
          {type === 'personalized' && (
            <Link 
              to="/collections" 
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              View All →
            </Link>
          )}
          
          {/* Slider Navigation */}
          {totalSlides > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                {currentSlide + 1} / {totalSlides}
              </span>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                disabled={currentSlide === totalSlides - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: totalSlides }, (_, slideIndex) => {
            const startIndex = slideIndex * itemsPerSlide;
            const slideProducts = products.slice(startIndex, startIndex + itemsPerSlide);
            
            return (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {slideProducts.map((product) => {
                  // Build image URL using EXACT same logic as ProductCard
                  const imageUrl = product.images && product.images[1]
                    ? `https://res.cloudinary.com/dxpe7jikz/image/upload/${CLOUDINARY_VERSION}${product.images[0].replace("/uploads", "")}.jpg`
                    : "https://via.placeholder.com/300x300?text=No+Image";

                  // Debug image URL construction (same as ProductCard debugging)
                  console.log(`🖼️ ProductRecommendations Image Debug [${product.name}]:`, {
                    originalImages: product.images,
                    cloudinaryUrl: imageUrl,
                    hasImagesArray: product.images && product.images.length > 0,
                    hasSecondImage: product.images && product.images[1],
                    isPlaceholder: imageUrl.includes('placeholder')
                  });

                  // Determine the brand slug for routing (same as ProductCard)
                  const brandSlug = (product.brand || '').toLowerCase();

                  return (
                    <Link key={product.id} to={`/${product.category.toLowerCase()}/${brandSlug}/${product.id}`}>
                      <div className="group relative bg-white/60 backdrop-blur-sm border border-white/20 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col hover:bg-white/80 hover:scale-105">
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex space-x-2 z-10">
                          {product.isNew && (
                            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                              New
                            </span>
                          )}
                          {product.discount && product.discount > 0 && (
                            <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                              -{product.discount}%
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {showActions && (
                          <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2">
                            {/* Wishlist Button */}
                            <button
                              onClick={(e) => handleWishlistToggle(e, product)}
                              className={`p-2.5 rounded-full transition-all duration-300 backdrop-blur-sm ${
                                wishlistItems.some(item => item.id === product.id)
                                  ? 'bg-red-500/90 text-white hover:bg-red-600/90 shadow-lg'
                                  : 'bg-white/70 text-gray-600 hover:bg-white/90 hover:text-red-500 shadow-md'
                              }`}
                              title={wishlistItems.some(item => item.id === product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                              <Heart 
                                className="w-4 h-4" 
                                fill={wishlistItems.some(item => item.id === product.id) ? 'currentColor' : 'none'}
                              />
                            </button>
                            
                            {/* Comparison Button */}
                            <button
                              onClick={(e) => handleComparisonToggle(e, product)}
                              className={`p-2.5 rounded-full transition-all duration-300 backdrop-blur-sm ${
                                comparisonProducts.some(item => item.id === product.id)
                                  ? 'bg-blue-500/90 text-white hover:bg-blue-600/90 shadow-lg'
                                  : 'bg-white/70 text-gray-600 hover:bg-white/90 hover:text-blue-500 shadow-md'
                              }`}
                              title={comparisonProducts.some(item => item.id === product.id) ? 'Remove from comparison' : 'Add to comparison'}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Product Image with Overlay */}
                        <div className="relative w-full h-56 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Product Info with Better Typography */}
                        <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors duration-300 text-gray-800">
                                {product.name}
                              </h3>
                              <p className="text-gray-600 text-sm mt-1 font-medium">{product.brand}</p>
                            </div>
                            <span className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1.5 rounded-full flex-shrink-0 ml-2 font-medium">
                              {product.category}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex flex-col">
                              <span className="font-bold text-xl text-indigo-600">
                                Rs{product.price.toFixed(2)}
                              </span>
                              {product.discount && product.discount > 0 && (
                                <span className="text-gray-400 text-sm line-through">
                                  Rs{((product.price * 100) / (100 - product.discount)).toFixed(2)}
                                </span>
                              )}
                            </div>
                            <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2.5 rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendations;