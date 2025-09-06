import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { removeFromComparison, clearComparison } from '../../store/comparisonSlice';
import { addToCart } from '../../store/cartSlice';
import { addToWishlist } from '../../store/wishlistSlice';
interface ComparisonProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  totalStock?: number;
  isNew?: boolean;
  sizes?: string[];
  colors?: string[];
  description?: string;

}
import { X, ShoppingCart, Heart, Star, Check, X as XIcon, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';


const ProductComparison: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products: comparisonProducts } = useAppSelector((store) => store.comparison);
  const isLoggedIn = useAppSelector((store) => !!store.auth.user.token || !!localStorage.getItem("tokenauth"));

  const handleRemoveFromComparison = (productId: string) => {
    dispatch(removeFromComparison(productId));
    toast.success("Product removed from comparison");
  };

  const handleClearComparison = () => {
    dispatch(clearComparison());
    toast.success("Comparison cleared");
  };

  const handleAddToCart = (product: ComparisonProduct) => {
    if (!isLoggedIn) {
      toast.error("Please log in to add to cart");
      return;
    }
    
    // Add with default selections
    dispatch(addToCart({
      productId: product.id,
      size: product.sizes?.[0] || "Default",
      color: product.colors?.[0] || "Default"
    }));
    toast.success("Added to cart");
  };

  const handleAddToWishlist = (product: ComparisonProduct) => {
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
                             inStock: (product.totalStock && product.totalStock > 0) || product.inStock || true,
        totalStock: product.totalStock,
        category: product.category,
        brand: product.brand,
    };
    dispatch(addToWishlist(wishlistItem));
    toast.success("Added to wishlist");
  };

  if (comparisonProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Products to Compare</h2>
          <p className="text-gray-600 mb-8">Add products to your comparison list to see them side by side</p>
          <Link
            to="/all-shoes"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const specifications = [
    { key: 'name', label: 'Product Name', type: 'text' },
    { key: 'brand', label: 'Brand', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'price', label: 'Price', type: 'price' },
    { key: 'rating', label: 'Rating', type: 'rating' },
    { key: 'inStock', label: 'Stock Status', type: 'boolean' },
    { key: 'totalStock', label: 'Total Stock', type: 'number' },
    { key: 'isNew', label: 'New Product', type: 'boolean' },
    { key: 'color', label: 'Color Options', type: 'array' },
    { key: 'size', label: 'Size Options', type: 'array' },
    { key: 'description', label: 'Description', type: 'text' },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderSpecValue = (product: any, spec: any) => {
    const value = product[spec.key];

    switch (spec.type) {
      case 'price':
        return (
          <span className="font-bold text-indigo-600">
            Rs {value?.toLocaleString() || 'N/A'}
          </span>
        );
      
      case 'rating':
        return (
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < (value || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">({value || 0})</span>
          </div>
        );
      
      case 'boolean':
        return (
          <div className="flex justify-center">
            {value ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <XIcon className="w-5 h-5 text-red-500" />
            )}
          </div>
        );
      
      case 'array':
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div className="flex flex-wrap gap-1 justify-center">
              {value.slice(0, 3).map((item: string, index: number) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {item}
                </span>
              ))}
              {value.length > 3 && (
                <span className="text-xs text-gray-500">+{value.length - 3} more</span>
              )}
            </div>
          );
        }
        // Show default values for colors and sizes if not available
        if (spec.key === 'color') {
          return (
            <div className="flex flex-wrap gap-1 justify-center">
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Black</span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">White</span>
            </div>
          );
        }
        if (spec.key === 'size') {
          return (
            <div className="flex flex-wrap gap-1 justify-center">
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">38</span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">39</span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">40</span>
            </div>
          );
        }
        return <span className="text-gray-500 text-center">N/A</span>;
      
      default:
        if (spec.key === 'description') {
          return <span className="text-gray-900 text-sm text-center">{value || 'Premium quality shoes designed for comfort and style'}</span>;
        }
        return <span className="text-gray-900 text-center">{value || 'N/A'}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Product Comparison
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Compare <span className="font-semibold text-indigo-600">{comparisonProducts.length}</span> products side by side
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0 w-full sm:w-auto">
              <button
                onClick={handleClearComparison}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center text-sm sm:text-base"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </button>
              <Link
                to="/all-shoes"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md text-center text-sm sm:text-base"
              >
                Add More Products
              </Link>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-3 sm:px-6 py-4 sm:py-6 text-left text-sm sm:text-base md:text-lg font-bold text-gray-900 w-32 sm:w-48 border-r border-gray-200">
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
                      <span className="hidden sm:inline">Specifications</span>
                      <span className="sm:hidden">Specs</span>
                    </div>
                  </th>
                  {comparisonProducts.map((product) => (
                    <th key={product.id} className="px-3 sm:px-6 py-4 sm:py-6 text-center w-60 sm:w-80 border-r border-gray-200 last:border-r-0">
                      <div className="relative bg-white rounded-lg p-2 sm:p-4 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFromComparison(product.id)}
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        
                        {/* Product Image */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto mb-3 sm:mb-4 rounded-xl overflow-hidden border-2 border-gray-100 shadow-md">
                          <img
                            src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://via.placeholder.com/300x300?text=No+Image";
                            }}
                          />
                        </div>
                        
                        {/* Product Name */}
                        <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 text-center text-xs sm:text-sm leading-tight">
                          {product.name}
                        </h3>
                        
                        {/* Price */}
                        <div className="text-center mb-3 sm:mb-4">
                          <span className="text-sm sm:text-base md:text-xl font-bold text-indigo-600">
                            Rs {product.price?.toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex justify-center space-x-2 sm:space-x-3">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="p-2 sm:p-3 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-all duration-300 transform hover:scale-110 shadow-md"
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => handleAddToWishlist(product)}
                            className="p-2 sm:p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all duration-300 transform hover:scale-110 shadow-md"
                            title="Add to Wishlist"
                          >
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <Link
                            to={`/men/${product.brand}/${product.id}`}
                            className="p-2 sm:p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-110 shadow-md"
                            title="View Details"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {specifications.map((spec, index) => (
                  <tr key={spec.key} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-200`}>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-xs sm:text-sm font-semibold text-gray-800 border-r border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50">
                      {spec.label}
                    </td>
                    {comparisonProducts.map((product) => (
                      <td key={`${product.id}-${spec.key}`} className="px-3 sm:px-6 py-3 sm:py-5 text-center border-r border-gray-200 last:border-r-0">
                        {renderSpecValue(product, spec)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Price Range</h3>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600">
              Rs {Math.min(...comparisonProducts.map(p => p.price)).toLocaleString()} - Rs {Math.max(...comparisonProducts.map(p => p.price)).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Average Rating</h3>
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      i < (comparisonProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / comparisonProducts.length)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-base sm:text-lg font-semibold">
                {(comparisonProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / comparisonProducts.length).toFixed(1)}
              </span>
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 md:col-span-1">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Availability</h3>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
              {comparisonProducts.filter(p => p.inStock).length === comparisonProducts.length 
                ? 'All Available' 
                : `${comparisonProducts.filter(p => p.inStock).length} Available`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison; 