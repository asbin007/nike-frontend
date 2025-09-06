import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAllCollections, fetchPersonalizedRecommendations } from '../../../store/recommendationsSlice';
import ProductCard from '../components/ProductCard';
import { Grid, List, TrendingUp, Clock, Award, Percent, Search, SlidersHorizontal } from 'lucide-react';

interface FilterState {
  search: string;
  brands: string[];
  categories: string[];
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  colors: string[];
  rating: number | null;
  inStock: boolean | null;
  isNew: boolean | null;
  onSale: boolean | null;
  sortBy: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'rating' | 'popularity';
}

const AllCollections: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    trendingProducts, 
    newArrivals, 
    bestSellers, 
    onSaleProducts, 
    status,
    error 
  } = useAppSelector((state) => state.recommendations);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'new' | 'bestsellers' | 'sale'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    brands: [],
    categories: [],
    minPrice: 0,
    maxPrice: 100000,
    sizes: [],
    colors: [],
    rating: null,
    inStock: null,
    isNew: null,
    onSale: null,
    sortBy: 'newest'
  });

  useEffect(() => {
    console.log('🔄 Fetching all collections...');
    dispatch(fetchAllCollections(12));
    dispatch(fetchPersonalizedRecommendations());
  }, [dispatch]);

  const collections = [
    {
      id: 'trending',
      title: 'Trending Now',
      icon: TrendingUp,
      products: trendingProducts,
      description: 'Most popular products right now',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'new',
      title: 'New Arrivals',
      icon: Clock,
      products: newArrivals,
      description: 'Fresh products just added',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'bestsellers',
      title: 'Best Sellers',
      icon: Award,
      products: bestSellers,
      description: 'Top-rated customer favorites',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'sale',
      title: 'On Sale',
      icon: Percent,
      products: onSaleProducts,
      description: 'Limited time offers',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const getActiveProducts = () => {
    let products = [];
    switch (activeTab) {
      case 'trending':
        products = trendingProducts;
        break;
      case 'new':
        products = newArrivals;
        break;
      case 'bestsellers':
        products = bestSellers;
        break;
      case 'sale':
        products = onSaleProducts;
        break;
      default:
        products = [...trendingProducts, ...newArrivals, ...bestSellers, ...onSaleProducts];
    }
    return products;
  };

  const getActiveCollection = () => {
    return collections.find(col => col.id === activeTab) || collections[0];
  };

  // Filter and sort products
  const getFilteredProducts = () => {
    let products = getActiveProducts();

    // Apply search filter
    if (filters.search) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.brand.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply brand filter
    if (filters.brands.length > 0) {
      products = products.filter(product => filters.brands.includes(product.brand));
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      products = products.filter(product => filters.categories.includes(product.category));
    }

    // Apply sizes filter
    if (filters.sizes.length > 0) {
      products = products.filter(product => 
        product.sizes && product.sizes.some(size => filters.sizes.includes(size))
      );
    }

    // Apply colors filter
    if (filters.colors.length > 0) {
      products = products.filter(product => 
        product.colors && product.colors.some(color => filters.colors.includes(color))
      );
    }

    // Apply price filter
    products = products.filter(product => 
      product.price >= filters.minPrice && product.price <= filters.maxPrice
    );

    // Apply rating filter
    if (filters.rating !== null) {
      products = products.filter(product => (product.rating || 0) >= filters.rating!);
    }

    // Apply stock filter
    if (filters.inStock !== null) {
      products = products.filter(product => (product as any).inStock === filters.inStock);
    }

    // Apply new filter
    if (filters.isNew !== null) {
      products = products.filter(product => product.isNew === filters.isNew);
    }

    // Apply sale filter
    if (filters.onSale !== null) {
      products = products.filter(product => 
        filters.onSale ? (product.discount && product.discount > 0) : (!product.discount || product.discount === 0)
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popularity':
        products.sort((a, b) => ((b as any).reviewCount || 0) - ((a as any).reviewCount || 0));
        break;
      case 'oldest':
        products.sort((a, b) => new Date((a as any).createdAt || '').getTime() - new Date((b as any).createdAt || '').getTime());
        break;
      default: // newest
        products.sort((a, b) => new Date((b as any).createdAt || '').getTime() - new Date((a as any).createdAt || '').getTime());
    }

    return products;
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      brands: [],
      categories: [],
      minPrice: 0,
      maxPrice: 100000,
      sizes: [],
      colors: [],
      rating: null,
      inStock: null,
      isNew: null,
      onSale: null,
      sortBy: 'newest'
    });
  };

  // Get unique values for filter options
  const allProducts = [...trendingProducts, ...newArrivals, ...bestSellers, ...onSaleProducts];
  const uniqueBrands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
  const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
  const uniqueSizes = [...new Set(allProducts.flatMap(p => p.sizes || []).filter(Boolean))];
  const uniqueColors = [...new Set(allProducts.flatMap(p => p.colors || []).filter(Boolean))];

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
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
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Collections</h2>
            <p className="text-gray-600 mb-6">
              {error || 'Something went wrong while loading the collections. Please try again.'}
            </p>
            <button 
              onClick={() => dispatch(fetchAllCollections(12))}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Our Collections
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover our curated selection of premium footwear across different categories
          </p>
        </div>

        {/* Collection Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {collections.map((collection) => {
            const Icon = collection.icon;
            return (
              <div 
                key={collection.id}
                className={`bg-gradient-to-r ${collection.color} rounded-lg p-3 sm:p-4 text-white cursor-pointer transition-transform hover:scale-105 ${
                  activeTab === collection.id ? 'ring-2 sm:ring-4 ring-white ring-opacity-50' : ''
                }`}
                onClick={() => setActiveTab(collection.id as any)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base md:text-lg">{collection.title}</h3>
                    <p className="text-xs sm:text-sm opacity-90">{collection.products.length} products</p>
                  </div>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 opacity-80" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Controls */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white rounded-lg p-3 sm:p-4 shadow-sm gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Showing {getFilteredProducts().length} of {getActiveProducts().length} products
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Sort Dropdown */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  showFilters 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Collection Info */}
        {activeTab !== 'all' && (
          <div className="mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${getActiveCollection().color} rounded-lg flex items-center justify-center`}>
                  {React.createElement(getActiveCollection().icon, { className: "w-6 h-6 text-white" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{getActiveCollection().title}</h2>
                  <p className="text-gray-600">{getActiveCollection().description}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Sidebar */}
        {showFilters && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brands</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueBrands.map(brand => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('brands', [...filters.brands, brand]);
                          } else {
                            handleFilterChange('brands', filters.brands.filter(b => b !== brand));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueCategories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('categories', [...filters.categories, category]);
                          } else {
                            handleFilterChange('categories', filters.categories.filter(c => c !== category));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes Filter */}
              {uniqueSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uniqueSizes.map(size => (
                      <label key={size} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.sizes.includes(size)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFilterChange('sizes', [...filters.sizes, size]);
                            } else {
                              handleFilterChange('sizes', filters.sizes.filter(s => s !== size));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors Filter */}
              {uniqueColors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uniqueColors.map(color => (
                      <label key={color} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.colors.includes(color)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFilterChange('colors', [...filters.colors, color]);
                            } else {
                              handleFilterChange('colors', filters.colors.filter(c => c !== color));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (Rs)</label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value) || 100000)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock === true}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked ? true : null)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.isNew === true}
                      onChange={(e) => handleFilterChange('isNew', e.target.checked ? true : null)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">New Arrivals</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.onSale === true}
                      onChange={(e) => handleFilterChange('onSale', e.target.checked ? true : null)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">On Sale</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {getFilteredProducts().map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {getFilteredProducts().map((product) => (
                <div key={product.id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                    <img
                      src={product.images?.[0] || '/images/product-1.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{product.brand}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm sm:text-base md:text-lg font-bold text-indigo-600">Rs{product.price.toFixed(2)}</div>
                    {product.discount && (
                      <div className="text-xs sm:text-sm text-gray-400 line-through">
                        Rs{((product.price * 100) / (100 - product.discount)).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty State */}
        {getFilteredProducts().length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">
              {getActiveProducts().length === 0 
                ? "We couldn't find any products in this collection at the moment."
                : "No products match your current filters. Try adjusting your search criteria."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {getActiveProducts().length > 0 && (
                <button 
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <button 
                onClick={() => dispatch(fetchAllCollections(12))}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh Collections
              </button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-lg mb-6 opacity-90">
            Browse our complete product catalog or contact our support team for assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Browse All Products
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCollections;
