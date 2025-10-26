import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Heart, ShoppingCart, Trash2, Star, Eye, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { removeFromWishlist, clearWishlist, WishlistItem, syncWishlistStock } from "../../store/wishlistSlice";
import { fetchProducts } from "../../store/productSlice";
import toast from "react-hot-toast";
import { WishlistSkeleton } from "../../components/SkeletonLoader";
import BackButton from "../../components/BackButton";
import { useEffect, useState } from "react";

export default function Wishlist() {
  const dispatch = useAppDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { items: wishlistItems } = useAppSelector((store) => store.wishlist);
  const { products: allProducts } = useAppSelector((store) => store.products);

  // Function to refresh stock status
  const refreshStockStatus = async () => {
    setIsRefreshing(true);
    try {
      // Fetch latest product data
      await dispatch(fetchProducts());
      
      // Sync wishlist items with current product stock
      const stockUpdates = wishlistItems.map(item => {
        const currentProduct = allProducts.find(p => p.id === item.id);
        if (currentProduct) {
          // Use totalStock to determine actual stock status
          const actualInStock = (currentProduct.totalStock && currentProduct.totalStock > 0) || currentProduct.isStock || false;
          return {
            id: item.id,
            inStock: actualInStock,
            totalStock: currentProduct.totalStock
          };
        }
        return {
          id: item.id,
          inStock: item.inStock,
          totalStock: item.totalStock
        };
      });
      
      dispatch(syncWishlistStock(stockUpdates));
      toast.success("Stock status updated!");
    } catch {
      toast.error("Failed to update stock status");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh stock status when component mounts
  useEffect(() => {
    if (wishlistItems.length > 0) {
      refreshStockStatus();
    }
  }, []);

  // Function to fix stock status for existing items
  const fixStockStatus = () => {
    const fixedItems = wishlistItems.map(item => {
      // If totalStock is available, use it to determine stock status
      if (item.totalStock !== undefined) {
        const shouldBeInStock = item.totalStock > 0;
        if (shouldBeInStock !== item.inStock) {
          return {
            ...item,
            inStock: shouldBeInStock
          };
        }
      }
      return item;
    });
    
    // Only update if there are changes
    const hasChanges = fixedItems.some((item, index) => item.inStock !== wishlistItems[index].inStock);
    if (hasChanges) {
      dispatch(syncWishlistStock(fixedItems.map(item => ({
        id: item.id,
        inStock: item.inStock,
        totalStock: item.totalStock
      }))));
      toast.success("Stock status corrected!");
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    dispatch(removeFromWishlist(productId));
    toast.success("Removed from wishlist");
  };

  const moveToCart = (product: WishlistItem) => {
    if (!product.inStock) {
      toast.error("This product is out of stock");
      return;
    }
    
    // Redirect to ProductDetail page where user can select size and color
    // The route should match your existing product detail route structure
    window.location.href = `/men/${product.brand}/${product.id}`;
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
    toast.success("Wishlist cleared");
  };

  // Show skeleton while loading (only if items are undefined, not empty)
  if (!wishlistItems) {
    return <WishlistSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-red-100 rounded-full">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Save your favorite products for later</p>
              </div>
            </div>
            
            {/* Stock Management Buttons */}
            {wishlistItems.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={fixStockStatus}
                  className="flex items-center justify-center gap-2 bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Fix Stock Status
                </button>
                <button
                  onClick={refreshStockStatus}
                  disabled={isRefreshing}
                  className="flex items-center justify-center gap-2 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Updating...' : 'Refresh Stock'}
                </button>
              </div>
            )}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Items</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{wishlistItems.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">In Stock</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {wishlistItems.filter(item => item.inStock).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Value</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    रु{wishlistItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="mb-4 sm:mb-6">
              <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Start adding your favorite products to your wishlist</p>
            </div>
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              <Eye className="h-4 w-4" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group ${
                  !product.inStock ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image.startsWith('http') 
                      ? product.image 
                      : `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${product.image.replace("/uploads", "")}.jpg`
                    }
                    alt={product.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      !product.inStock ? 'opacity-60' : ''
                    }`}
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
                                             title={product.inStock ? 'View Product Details' : 'Out of Stock'}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-200"
                      title="Remove from Wishlist"
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

                  {/* Stock Information */}
                  {product.totalStock !== undefined && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Available Stock:</span>
                        <span className={`font-medium ${
                          product.totalStock > 10 ? 'text-green-600' : 
                          product.totalStock > 0 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {product.totalStock} units
                        </span>
                      </div>
                      {product.totalStock <= 10 && product.totalStock > 0 && (
                        <div className="mt-1 text-xs text-orange-600">
                          Low stock! Order soon.
                        </div>
                      )}
                      {/* Debug Info */}
                      <div className="mt-1 text-xs text-gray-500">
                        Stock Status: {product.inStock ? 'In Stock' : 'Out of Stock'} | 
                        Total Stock: {product.totalStock} | 
                        isStock: {product.inStock ? 'true' : 'false'}
                      </div>
                    </div>
                  )}
                  
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
                       {product.inStock ? 'View Details' : 'Out of Stock'}
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Remove from Wishlist"
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
                    // Redirect to collections page to browse all products
                    window.location.href = "/collections";
                  }}
                 className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200"
               >
                 <Eye className="h-4 w-4" />
                 View All Products ({wishlistItems.filter(item => item.inStock).length} items)
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