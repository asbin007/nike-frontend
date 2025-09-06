import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchProducts } from "../../../store/productSlice";
import { fetchPersonalizedRecommendations } from "../../../store/recommendationsSlice";
import ProductCard from "./ProductCard";
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  List, 
  Search, 
  Star,
  SlidersHorizontal
} from "lucide-react";

interface FilterState {
  search: string;
  brands: string[];
  categories: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  rating: number;
  availability: 'all' | 'in-stock' | 'out-of-stock';
  sortBy: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'rating' | 'popularity';
  isNew: boolean | null;
  onSale: boolean | null;
}

const ProductFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    brands: [],
    categories: [],
    priceRange: [0, 100000],
    sizes: [],
    colors: [],
    rating: 0,
    availability: 'all',
    sortBy: 'newest',
    isNew: null,
    onSale: null
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'slider'>('grid');
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((store) => store.products);
  const { personalizedRecommendations, cartHistory, purchaseHistory } = useAppSelector((store) => store.recommendations);
  const { collection } = useParams();
  
  const hasUserActivity = cartHistory.length > 0 || purchaseHistory.length > 0;

  useEffect(() => {
    dispatch(fetchProducts());
    
    if (hasUserActivity && personalizedRecommendations.length === 0) {
      dispatch(fetchPersonalizedRecommendations());
    }
  }, [dispatch, hasUserActivity, personalizedRecommendations.length]);

  // Get unique values for filters
  const allBrands = [...new Set(products.map(p => p.brand))].sort();
  const allCategories = [...new Set(products.map(p => p.Category?.categoryName).filter(Boolean))].sort();
  const allSizes = [...new Set(products.flatMap(p => p.sizes || []))].sort();
  const allColors = [...new Set(products.flatMap(p => p.colors || []))].sort();
  const maxPrice = Math.max(...products.map(p => p.price), 0);
  const minPrice = Math.min(...products.map(p => p.price), 0);

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    // Search filter
    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Brand filter
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }

    // Category filter
    if (filters.categories.length > 0 && product.Category?.categoryName && !filters.categories.includes(product.Category.categoryName)) {
      return false;
    }

    // Price range filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }

    // Size filter
    if (filters.sizes.length > 0 && product.sizes && !filters.sizes.some(size => product.sizes?.includes(size))) {
      return false;
    }

    // Color filter
    if (filters.colors.length > 0 && product.colors && !filters.colors.some(color => product.colors?.includes(color))) {
      return false;
    }

    // Rating filter
    if (filters.rating > 0 && (product.rating || 0) < filters.rating) {
      return false;
    }

    // Availability filter
    if (filters.availability === 'in-stock' && !((product.totalStock && product.totalStock > 0) || product.isStock)) {
      return false;
    }
    if (filters.availability === 'out-of-stock' && ((product.totalStock && product.totalStock > 0) || product.isStock)) {
      return false;
    }

    // New product filter
    if (filters.isNew === true && !product.isNew) {
      return false;
    }
    if (filters.isNew === false && product.isNew) {
      return false;
    }

    // On sale filter
    if (filters.onSale === true && !product.discount) {
      return false;
    }
    if (filters.onSale === false && product.discount) {
      return false;
    }

    // Collection filter
    if (collection && product.Collection?.collectionName.toLowerCase() !== collection.toLowerCase()) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'oldest':
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'popularity':
        return (b.totalStock || 0) - (a.totalStock || 0);
      default:
        return 0;
    }
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMultiSelectFilter = (key: 'brands' | 'categories' | 'sizes' | 'colors', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      brands: [],
      categories: [],
      priceRange: [minPrice, maxPrice],
      sizes: [],
      colors: [],
      rating: 0,
      availability: 'all',
      sortBy: 'newest',
      isNew: null,
      onSale: null
    });
  };

  const activeFiltersCount = [
    filters.brands.length,
    filters.categories.length,
    filters.sizes.length,
    filters.colors.length,
    filters.rating > 0 ? 1 : 0,
    filters.availability !== 'all' ? 1 : 0,
    filters.isNew !== null ? 1 : 0,
    filters.onSale !== null ? 1 : 0,
    filters.search ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  // Slider navigation functions
  const nextSlide = () => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const cardWidth = container.querySelector('.product-card')?.clientWidth || 300;
      const gap = 32;
      const cardsPerView = Math.floor(container.clientWidth / (cardWidth + gap));
      const maxSlides = Math.max(0, sortedProducts.length - cardsPerView);
      
      const newSlide = Math.min(currentSlide + 1, maxSlides);
      setCurrentSlide(newSlide);
      
      const scrollAmount = newSlide * (cardWidth + gap);
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const prevSlide = () => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const cardWidth = container.querySelector('.product-card')?.clientWidth || 300;
      const gap = 32;
      
      const newSlide = Math.max(currentSlide - 1, 0);
      setCurrentSlide(newSlide);
      
      const scrollAmount = newSlide * (cardWidth + gap);
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-4 sm:py-6 md:py-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-3 sm:px-4">
        
        {/* Personalized Recommendations */}

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {collection ? `${collection.charAt(0).toUpperCase() + collection.slice(1)} Collection` : 'All Products'}
          </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64 text-sm sm:text-base"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
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
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('slider')}
                className={`p-2 rounded-r-lg transition-all duration-200 ${
                  viewMode === 'slider' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Price Range</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                    />
                    <span className="text-gray-500 text-xs sm:text-sm">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || maxPrice])}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Rs {filters.priceRange[0].toLocaleString()} - Rs {filters.priceRange[1].toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Brands</h4>
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {allBrands.map(brand => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => handleMultiSelectFilter('brands', brand)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="ml-2 text-xs sm:text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Categories</h4>
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {allCategories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleMultiSelectFilter('categories', category)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="ml-2 text-xs sm:text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Sizes</h4>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {allSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => handleMultiSelectFilter('sizes', size)}
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-colors ${
                        filters.sizes.includes(size)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Colors</h4>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {allColors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleMultiSelectFilter('colors', color)}
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-colors ${
                        filters.colors.includes(color)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.rating === rating}
                        onChange={() => handleFilterChange('rating', rating)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="ml-2 flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-700">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Availability</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Products' },
                    { value: 'in-stock', label: 'In Stock' },
                    { value: 'out-of-stock', label: 'Out of Stock' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="availability"
                        checked={filters.availability === option.value}
                        onChange={(e) => handleFilterChange('availability', e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
              ))}
            </div>
          </div>

              {/* Special Filters */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Special</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.isNew === true}
                      onChange={(e) => handleFilterChange('isNew', e.target.checked ? true : null)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">New Arrivals</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.onSale === true}
                      onChange={(e) => handleFilterChange('onSale', e.target.checked ? true : null)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">On Sale</span>
                  </label>
                </div>
              </div>
            </div>
        </div>

        {/* Products Display */}
          <div className="flex-1">
        {viewMode === 'slider' ? (
          // Slider View
          <div className="relative">
                {sortedProducts.length > 4 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div 
              ref={sliderRef}
              className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                  {sortedProducts.length > 0 ? (
                    sortedProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="product-card flex-shrink-0 w-80 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <ProductCard
                      product={{
                        ...product,
                        images: Array.isArray(product.images)
                          ? product.images
                          : ([product.images].filter(Boolean) as string[]),
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center w-full py-16">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-500 text-2xl">😔</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
                    <p className="text-gray-500">Try adjusting your filters or browse our complete collection.</p>
                        <button
                          onClick={clearAllFilters}
                          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Clear All Filters
                        </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {sortedProducts.length > 0 ? (
                  sortedProducts.map((product) => (
                <div 
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <ProductCard
                    product={{
                      ...product,
                      images: Array.isArray(product.images)
                        ? product.images
                        : ([product.images].filter(Boolean) as string[]),
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-12 sm:py-16">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-500 text-xl sm:text-2xl">😔</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4">Try adjusting your filters or browse our complete collection.</p>
                      <button
                        onClick={clearAllFilters}
                        className="mt-4 bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                      >
                        Clear All Filters
                      </button>
                </div>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>


      {/* Custom CSS for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `
      }} />
    </section>
  );
};

export default ProductFilters;