import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProducts } from '../../../store/productSlice';
import { ArrowRight, Star, TrendingUp, Sparkles, Zap } from 'lucide-react';

const Collections = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, status } = useAppSelector((store) => store.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Get unique collections from products
  const collections = ['all', ...new Set(products.map(product => product.Collection?.collectionName).filter(Boolean))];
  
  // Get unique categories from products
  const categories = [...new Set(products.map(product => product.Category?.categoryName).filter(Boolean))];
  
  // Get unique brands from products
  const brands = [...new Set(products.map(product => product.brand).filter(Boolean))];

  // Filter products by collection
  const getProductsByCollection = (collectionName: string) => {
    if (collectionName === 'all') return products;
    return products.filter(product => 
      product.Collection?.collectionName?.toLowerCase() === collectionName.toLowerCase()
    );
  };

  // Get featured products (products with high rating or new arrivals)
  const getFeaturedProducts = () => {
    return products
      .filter(product => product.isNew || (product.rating && product.rating >= 4))
      .slice(0, 6);
  };

  // Get trending products (products with high rating)
  const getTrendingProducts = () => {
    return products
      .filter(product => product.rating && product.rating >= 4.5)
      .slice(0, 4);
  };

  // Get products by category
  const getProductsByCategory = (categoryName: string) => {
    return products.filter(product => 
      product.Category?.categoryName?.toLowerCase() === categoryName.toLowerCase()
    );
  };

  const handleCollectionClick = (collection: string) => {
    if (collection === 'all') {
      navigate('/all-shoes');
    } else {
      navigate(`/${collection.toLowerCase()}`);
    }
  };

  const handleCategoryClick = (category: string) => {
    // Navigate to products filtered by category
    navigate(`/all-shoes?category=${category.toLowerCase()}`);
  };

  const handleBrandClick = (brand: string) => {
    // Navigate to products filtered by brand
    navigate(`/all-shoes?brand=${brand.toLowerCase()}`);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold">Our Collections</h1>
            <Sparkles className="w-8 h-8 ml-3" />
          </div>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            Discover our carefully curated selection of premium footwear for every style and occasion
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              {products.length}+ Products
            </span>
            <span className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              {brands.length} Brands
            </span>
            <span className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              {categories.length} Categories
            </span>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Collection</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our collections designed for different styles and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => {
              const collectionProducts = getProductsByCollection(collection);
              const firstProduct = collectionProducts[0];
              
              return (
                <div 
                  key={collection}
                  onClick={() => handleCollectionClick(collection)}
                  className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                >
                  <div className="relative h-80">
                    {firstProduct?.images?.[0] ? (
                      <img 
                        src={`https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${firstProduct.images[0].replace("/uploads", "")}.jpg`}
                        alt={collection}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1552346154-21d32810aba3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-500 text-lg">No Image</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    
                    {/* Collection Badge */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
                        {collectionProducts.length} Products
                      </div>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="text-white">
                        <h3 className="text-2xl font-bold mb-2 capitalize">
                          {collection === 'all' ? 'All Products' : collection}
                        </h3>
                        <p className="text-gray-200 mb-4">
                          {collection === 'all' 
                            ? 'Browse our complete collection' 
                            : `Discover our ${collection} collection`
                          }
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">
                            Starting from रु{Math.min(...collectionProducts.map(p => p.price))}
                          </span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {getFeaturedProducts().length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our most popular and highly-rated products
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {getFeaturedProducts().map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="relative h-64">
                    <img 
                      src={`https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${product.images?.[0]?.replace("/uploads", "")}.jpg`}
                      alt={product.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/300x300?text=No+Image";
                      }}
                    />
                    {product.isNew && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        NEW
                      </div>
                    )}
                    {product.discount > 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{product.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{product.brand}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">रु{product.price.toLocaleString()}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">रु{product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <Link 
                        to={`/${product.Collection?.collectionName?.toLowerCase()}/${product.brand?.toLowerCase()}/${product.id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find the perfect style for your needs
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => {
                const categoryProducts = getProductsByCategory(category);
                const firstProduct = categoryProducts[0];
                
                return (
                  <div 
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="relative h-48">
                      {firstProduct?.images?.[0] ? (
                        <img 
                          src={`https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${firstProduct.images[0].replace("/uploads", "")}.jpg`}
                          alt={category}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1552346154-21d32810aba3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-gray-500">{category}</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold text-lg">{category}</h3>
                        <p className="text-gray-200 text-sm">{categoryProducts.length} products</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Trending Products */}
      {getTrendingProducts().length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our highest-rated products that customers love
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getTrendingProducts().map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="relative h-48">
                    <img 
                      src={`https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${product.images?.[0]?.replace("/uploads", "")}.jpg`}
                      alt={product.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/300x300?text=No+Image";
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                      <Star className="w-3 h-3 fill-current mr-1" />
                      {product.rating?.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{product.brand}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">रु{product.price.toLocaleString()}</span>
                      <Link 
                        to={`/${product.Collection?.collectionName?.toLowerCase()}/${product.brand?.toLowerCase()}/${product.id}`}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brands Section */}
      {brands.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Brand</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover products from your favorite brands
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {brands.slice(0, 12).map((brand) => {
                const brandProducts = products.filter(product => product.brand === brand);
                
                return (
                  <div 
                    key={brand}
                    onClick={() => handleBrandClick(brand)}
                    className="group bg-gray-50 rounded-xl p-6 text-center hover:bg-indigo-50 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-indigo-200"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition-colors">
                      <span className="text-indigo-600 font-bold text-lg">{brand.charAt(0)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{brand}</h3>
                    <p className="text-sm text-gray-600">{brandProducts.length} products</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Products Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span className="animate-pulse">🚀</span>
              <span>Coming Soon</span>
              <span className="animate-pulse">🚀</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Upcoming Products
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Get ready for our latest collections and exclusive releases
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* Upcoming Product 1 */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  Coming Soon
                </div>
              </div>
              
              <div className="relative h-64 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👟</div>
                    <p className="text-gray-600 font-medium">Winter Collection</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-blue-900/20"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Winter Collection 2024</h3>
                <p className="text-gray-600 mb-4">Stay warm and stylish with our upcoming winter footwear collection</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Available from:</span> December 1, 2024
                  </div>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                    Notify Me
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Product 2 */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  Pre-order
                </div>
              </div>
              
              <div className="relative h-64 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-green-200 to-emerald-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏃‍♂️</div>
                    <p className="text-gray-600 font-medium">Sports Edition</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-green-900/20"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sports Edition Pro</h3>
                <p className="text-gray-600 mb-4">Professional sports shoes with advanced technology and comfort</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Available from:</span> January 15, 2025
                  </div>
                  <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105">
                    Pre-order
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Product 3 */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  Limited Edition
                </div>
              </div>
              
              <div className="relative h-64 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">✨</div>
                    <p className="text-gray-600 font-medium">Luxury Collection</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-purple-900/20"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Luxury Premium</h3>
                <p className="text-gray-600 mb-4">Exclusive luxury footwear collection with premium materials</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Available from:</span> February 1, 2025
                  </div>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105">
                    Join Waitlist
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Product 4 */}
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  Early Access
                </div>
              </div>
              
              <div className="relative h-64 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-gray-600 font-medium">Artist Series</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-orange-900/20"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Artist Collaboration</h3>
                <p className="text-gray-600 mb-4">Unique designs created in collaboration with local artists</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Available from:</span> March 1, 2025
                  </div>
                  <button className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105">
                    Get Early Access
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Special Message */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                🚀 Stay Updated with New Releases
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                Be the first to know about our latest collections and exclusive releases. Sign up for notifications and get early access to limited edition products.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <span>📧 Email Notifications</span>
                <span>🔔 Push Alerts</span>
                <span>🎁 Early Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Perfect Pair?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Explore our complete collection and discover shoes that match your style and comfort needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/all-shoes"
              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <Zap className="w-5 h-5 mr-2" />
              Browse All Products
            </Link>
            <Link 
              to="/my-cart"
              className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              View Cart
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Collections;