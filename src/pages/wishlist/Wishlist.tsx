import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Heart, ShoppingCart, Trash2, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { removeFromWishlist, clearWishlist, WishlistItem } from "../../store/wishlistSlice";
import toast from "react-hot-toast";
import { WishlistSkeleton } from "../../components/SkeletonLoader";

export default function Wishlist() {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((store) => !!store.auth.user.token || !!localStorage.getItem("token"));
  const { items: wishlistItems } = useAppSelector((store) => store.wishlist);

  const handleRemoveFromWishlist = (productId: string) => {
    dispatch(removeFromWishlist(productId));
    toast.success("Removed from wishlist");
  };

  const handleAddToCart = async (_product: WishlistItem) => {
    if (!isLoggedIn) {
      toast.error("Please log in to add to cart");
      return;
    }

    try {
      // Add to cart logic here - you can implement this later
      toast.success("Added to cart successfully!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const moveToCart = (product: WishlistItem) => {
    handleAddToCart(product);
    handleRemoveFromWishlist(product.id);
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
    toast.success("Wishlist cleared");
  };

  // Show skeleton while loading
  if (!wishlistItems || wishlistItems.length === 0) {
    return <WishlistSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Heart className="h-6 w-6 text-red-500" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">Save your favorite products for later</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Heart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{wishlistItems.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {wishlistItems.filter(item => item.inStock).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    रु{wishlistItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-6">Start adding your favorite products to your wishlist</p>
            </div>
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <Eye className="h-4 w-4" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image.startsWith('http') 
                      ? product.image 
                      : `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${product.image.replace("/uploads", "")}.jpg`
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/300x300?text=No+Image";
                    }}
                  />
                  
                  {/* Discount Badge */}
                  {product.discount && product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{product.discount}%
                    </div>
                  )}
                  
                  {/* Stock Badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    product.inStock 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => moveToCart(product)}
                      disabled={!product.inStock}
                      className={`p-2 rounded-full shadow-lg transition-all duration-200 ${
                        product.inStock
                          ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({product.reviews} reviews)
                    </span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      रु{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        रु{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveToCart(product)}
                      disabled={!product.inStock}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                        product.inStock
                          ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Move to Cart
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Bulk Actions */}
        {wishlistItems.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const inStockItems = wishlistItems.filter(item => item.inStock);
                  inStockItems.forEach(item => moveToCart(item));
                }}
                className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200"
              >
                <ShoppingCart className="h-4 w-4" />
                Move All to Cart
              </button>
              
              <button
                onClick={handleClearWishlist}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
                Clear Wishlist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 