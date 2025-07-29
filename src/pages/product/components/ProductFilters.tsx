import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchProducts } from "../../../store/productSlice";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight, Grid, List } from "lucide-react";

const ProductFilters = () => {
  const [activeBrand, setActiveBrand] = useState<string>("All");
  const [viewMode, setViewMode] = useState<'grid' | 'slider'>('slider');
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((store) => store.products);
  const { brand, collection } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Parse URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const urlBrand = searchParams.get('brand');

  useEffect(() => {
    // Set active brand from URL params or route params
    const brandFromUrl = urlBrand || brand || "All";
    setActiveBrand(brandFromUrl);
  }, [brand, urlBrand]);

  const brands = ["All", ...new Set(products.map((product) => product.brand))];
  const filtered = products.filter((product) => {
    // Check brand filter from URL query params or route params
    const brandToMatch = urlBrand || brand;
    const matchBrand = brandToMatch
      ? product.brand.toLowerCase() === brandToMatch.toLowerCase()
      : true;

    // Check collection filter from route params
    const matchCollection = collection
      ? product.Collection?.collectionName.toLowerCase() ===
        collection.toLowerCase()
      : true;

    return matchBrand && matchCollection;
  });

  const handleBrandClick = (selectedBrand: string) => {
    setActiveBrand(selectedBrand);
    
    if (selectedBrand === "All") {
      // If we're on a collection page, go back to collection, otherwise stay on all-shoes
      if (collection) {
        navigate(`/${collection}`);
      } else {
        navigate('/all-shoes');
      }
    } else {
      // If we're on a collection page, filter by brand within that collection
      if (collection) {
        navigate(`/${collection}/${selectedBrand.toLowerCase()}`);
      } else {
        // If we're on all-shoes, filter by brand only
        navigate(`/all-shoes?brand=${selectedBrand.toLowerCase()}`);
      }
    }
  };

  // Slider navigation functions
  const nextSlide = () => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const cardWidth = container.querySelector('.product-card')?.clientWidth || 300;
      const gap = 32; // gap-8 = 32px
      const cardsPerView = Math.floor(container.clientWidth / (cardWidth + gap));
      const maxSlides = Math.max(0, filtered.length - cardsPerView);
      
      setCurrentSlide(prev => Math.min(prev + 1, maxSlides));
      
      const scrollAmount = cardWidth + gap;
      container.scrollBy({
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
      
      setCurrentSlide(prev => Math.max(prev - 1, 0));
      
      const scrollAmount = -(cardWidth + gap);
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const goToSlide = (index: number) => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const cardWidth = container.querySelector('.product-card')?.clientWidth || 300;
      const gap = 32;
      
      setCurrentSlide(index);
      
      const scrollAmount = index * (cardWidth + gap);
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (viewMode === 'slider') {
      const interval = setInterval(() => {
        if (sliderRef.current) {
          const container = sliderRef.current;
          const cardWidth = container.querySelector('.product-card')?.clientWidth || 300;
          const gap = 32;
          const cardsPerView = Math.floor(container.clientWidth / (cardWidth + gap));
          const maxSlides = Math.max(0, filtered.length - cardsPerView);
          
          if (currentSlide >= maxSlides) {
            setCurrentSlide(0);
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            nextSlide();
          }
        }
      }, 5000); // Auto-scroll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [currentSlide, viewMode, filtered.length]);

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header with View Mode Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
            {collection ? `${collection.charAt(0).toUpperCase() + collection.slice(1)} Collection` : 'All Products'}
          </h2>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => setViewMode('slider')}
                className={`p-2 rounded-l-lg transition-all duration-200 ${
                  viewMode === 'slider' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-r-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Brand Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filter by Brand</h3>
            {activeBrand !== "All" && (
              <button
                onClick={() => handleBrandClick("All")}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <span>Clear Filter</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-2 min-w-max">
              {brands.map((brand) => (
                <button
                  onClick={() => handleBrandClick(brand)}
                  key={brand}
                  className={`px-6 py-3 rounded-full whitespace-nowrap transition-all duration-300 ${
                    activeBrand === brand
                      ? "bg-indigo-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md"
                  }`}
                >
                  {brand}
                  {activeBrand === brand && (
                    <span className="ml-2 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {activeBrand !== "All" && (
            <div className="mt-3 text-sm text-gray-600">
              Showing products from <span className="font-semibold text-indigo-600">{activeBrand}</span>
            </div>
          )}
        </div>

        {/* Products Display */}
        {viewMode === 'slider' ? (
          // Slider View
          <div className="relative">
            {/* Navigation Arrows */}
            {filtered.length > 4 && (
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

            {/* Products Slider */}
            <div 
              ref={sliderRef}
              className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filtered.length > 0 ? (
                filtered.map((product) => (
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
                  </div>
                </div>
              )}
            </div>

            {/* Slider Dots */}
            {filtered.length > 4 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(filtered.length / 4) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index 
                        ? 'bg-indigo-600 scale-125' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.length > 0 ? (
              filtered.map((product) => (
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
              <div className="col-span-full flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-500 text-2xl">😔</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
                  <p className="text-gray-500">Try adjusting your filters or browse our complete collection.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filtered.length} Product{filtered.length !== 1 ? 's' : ''} Found
            </h3>
            <p className="text-gray-600 mb-4">
              {collection && `Showing ${collection} collection products`}
              {activeBrand !== 'All' && ` from ${activeBrand}`}
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => navigate('/all-shoes')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                View All Products
              </button>
              {activeBrand !== 'All' && (
                <button 
                  onClick={() => handleBrandClick('All')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Clear Filter
                </button>
              )}
            </div>
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
