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
    { key: 'RAM', label: 'RAM Options', type: 'array' },
    { key: 'ROM', label: 'Storage Options', type: 'array' },
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
            रु {value?.toLocaleString() || 'N/A'}
          </span>
        );
      
      case 'rating':
        return (
          <div className="flex items-center">
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
        return value ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <XIcon className="w-5 h-5 text-red-500" />
        );
      
      case 'array':
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
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
        return <span className="text-gray-500">N/A</span>;
      
      default:
        return <span className="text-gray-900">{value || 'N/A'}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Comparison</h1>
            <p className="text-gray-600">
              Compare {comparisonProducts.length} products side by side
            </p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button
              onClick={handleClearComparison}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </button>
            <Link
              to="/all-shoes"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add More
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 w-48">
                    Specifications
                  </th>
                  {comparisonProducts.map((product) => (
                    <th key={product.id} className="px-6 py-4 text-center w-64">
                      <div className="relative">
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFromComparison(product.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        
                        {/* Product Image */}
                        <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Product Name */}
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        {/* Action Buttons */}
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAddToWishlist(product)}
                            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                            title="Add to Wishlist"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/men/${product.brand}/${product.id}`}
                            className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <tr key={spec.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {spec.label}
                    </td>
                    {comparisonProducts.map((product) => (
                      <td key={`${product.id}-${spec.key}`} className="px-6 py-4 text-center">
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Price Range</h3>
            <p className="text-2xl font-bold text-indigo-600">
              रु {Math.min(...comparisonProducts.map(p => p.price)).toLocaleString()} - रु {Math.max(...comparisonProducts.map(p => p.price)).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Average Rating</h3>
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < (comparisonProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / comparisonProducts.length)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-lg font-semibold">
                {(comparisonProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / comparisonProducts.length).toFixed(1)}
              </span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-gray-900 mb-2">In Stock</h3>
            <p className="text-2xl font-bold text-green-600">
              {comparisonProducts.filter(p => p.inStock).length} / {comparisonProducts.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison; 