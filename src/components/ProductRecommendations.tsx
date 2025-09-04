import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { RecommendationProduct } from '../store/recommendationsSlice';

interface ProductRecommendationsProps {
  title: string;
  products: RecommendationProduct[];
  type: 'trending' | 'personalized' | 'similar' | 'frequentlyBought';
  loading?: boolean;
  className?: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  title,
  products,
  type,
  loading = false,
  className = ''
}) => {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
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
            to="/recommended" 
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View All →
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            <div className="relative">
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/product-1.jpg';
                  }}
                />
              </Link>
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isNew && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                )}
                {product.discount && product.discount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    -{product.discount}%
                  </span>
                )}
              </div>

              {/* Quick Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex flex-col gap-1">
                  <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {product.brand}
                </span>
              </div>
              
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
              </Link>

              {/* Rating */}
              {product.rating && product.rating > 0 && (
                <div className="mb-2">
                  {renderStars(product.rating)}
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Reason for recommendation */}
              <div className="mb-3">
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {product.reason}
                </span>
              </div>

              {/* Add to Cart Button */}
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              {/* Stock Status */}
              {product.totalStock !== undefined && (
                <div className="mt-2 text-xs text-gray-500">
                  {product.totalStock > 0 ? (
                    <span className="text-green-600">In Stock ({product.totalStock} available)</span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;