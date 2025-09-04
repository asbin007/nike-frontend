import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchRecommendations, RecommendationProduct } from "../../store/recommendationsSlice";
import ProductCard from "../product/components/ProductCard";
import { ChevronLeft, ChevronRight, Grid, List } from "lucide-react";

// Convert RecommendationProduct -> minimal IProduct-like for ProductCard
function toIProductLike(p: RecommendationProduct) {
  return {
    id: p.id as unknown as string,
    name: p.name,
    price: p.price,
    // ProductCard currently checks images[1] to decide URL; provide two entries to ensure image renders
    images: [p.image, p.image],
    brand: p.brand,
    Category: { categoryName: p.category },
    description: [""],
    totalStock: p.totalStock || 0,
    isStock: (p.totalStock || 0) > 0,
    discount: p.discount || 0,
    isNew: !!p.isNew,
  } as any;
}

type RecommendedProps = {
  initialTab?: 'personalized' | 'frequently' | 'trending';
  showTabs?: boolean;
  titleOverride?: string;
};

export default function Recommended({ initialTab = 'personalized', showTabs = true, titleOverride }: RecommendedProps) {
  const dispatch = useAppDispatch();
  const { personalizedRecommendations, frequentlyBought, trendingProducts, loading } = useAppSelector(s => s.recommendations);

  const [activeTab, setActiveTab] = useState<'personalized' | 'frequently' | 'trending'>(initialTab);
  const [brand, setBrand] = useState<string>('All');
  const [category, setCategory] = useState<string>('All');
  const [priceOrder, setPriceOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [viewMode, setViewMode] = useState<'grid' | 'slider'>('slider');
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  const source = useMemo(() => {
    if (activeTab === 'frequently') return frequentlyBought;
    if (activeTab === 'trending') return trendingProducts;
    return personalizedRecommendations;
  }, [activeTab, personalizedRecommendations, frequentlyBought, trendingProducts]);

  const brands = useMemo(() => ['All', ...Array.from(new Set(source.map(x => x.brand).filter(Boolean)))], [source]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(source.map(x => x.category).filter(Boolean)))], [source]);

  const filtered = useMemo(() => {
    let list = source;
    if (brand !== 'All') list = list.filter(x => x.brand === brand);
    if (category !== 'All') list = list.filter(x => x.category === category);
    if (priceOrder !== 'none') {
      list = [...list].sort((a, b) => priceOrder === 'asc' ? a.price - b.price : b.price - a.price);
    }
    return list;
  }, [source, brand, category, priceOrder]);

  // Slider controls (copy behavior from ProductFilters)
  const nextSlide = () => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const cardWidth = container.querySelector('.product-card')?.clientWidth || 300;
      const gap = 32;
      const cardsPerView = Math.floor(container.clientWidth / (cardWidth + gap));
      const maxSlides = Math.max(0, filtered.length - cardsPerView);
      setCurrentSlide(prev => Math.min(prev + 1, maxSlides));
      container.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
    }
  };

  const prevSlide = () => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const cardWidth = container.querySelector('.product-card')?.clientWidth || 300;
      const gap = 32;
      setCurrentSlide(prev => Math.max(prev - 1, 0));
      container.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    }
  };

  const goToSlide = (index: number) => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const cardWidth = container.querySelector('.product-card')?.clientWidth || 300;
      const gap = 32;
      setCurrentSlide(index);
      container.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' });
    }
  };

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
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentSlide, viewMode, filtered.length]);

  return (
    <section className="py-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header with View Mode Toggle (matches ProductFilters) */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
            {titleOverride || (activeTab === 'trending' && !showTabs ? 'Trending Products' : 'Recommended Products')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => setViewMode('slider')}
                className={`p-2 rounded-l-lg transition-all duration-200 ${viewMode==='slider' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-r-lg transition-all duration-200 ${viewMode==='grid' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {showTabs && (
          <div className="flex justify-center gap-2 mb-6">
            <button onClick={() => setActiveTab('personalized')} className={`px-4 py-2 rounded-lg ${activeTab==='personalized'?'bg-indigo-600 text-white':'bg-white text-gray-700 border'}`}>Recommended for You</button>
            <button onClick={() => setActiveTab('frequently')} className={`px-4 py-2 rounded-lg ${activeTab==='frequently'?'bg-indigo-600 text-white':'bg-white text-gray-700 border'}`}>Frequently Bought</button>
            <button onClick={() => setActiveTab('trending')} className={`px-4 py-2 rounded-lg ${activeTab==='trending'?'bg-indigo-600 text-white':'bg-white text-gray-700 border'}`}>Trending</button>
          </div>
        )}

        {/* Brand/Category/Price Filters (chip style brand list like ProductFilters) */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Brand</label>
            <select value={brand} onChange={e=>setBrand(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full border rounded-lg px-3 py-2">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sort by Price</label>
            <select value={priceOrder} onChange={e=>setPriceOrder(e.target.value as any)} className="w-full border rounded-lg px-3 py-2">
              <option value="none">Default</option>
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={()=>{setBrand('All'); setCategory('All'); setPriceOrder('none');}} className="w-full border rounded-lg px-3 py-2">Clear</button>
          </div>
        </div>

        {/* Products Display (match ProductFilters slider/grid) */}
        {viewMode === 'slider' ? (
          <div className="relative">
            {filtered.length > 4 && (
              <>
                <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div ref={sliderRef} className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {loading ? (
                <div className="text-center text-gray-500 w-full py-10">Loading recommendations...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-gray-500 w-full py-10">No recommendations available.</div>
              ) : (
                filtered.map(p => (
                  <div key={p.id} className="product-card flex-shrink-0 w-80 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <ProductCard product={toIProductLike(p)} />
                  </div>
                ))
              )}
            </div>

            {filtered.length > 4 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(filtered.length / 4) }).map((_, index) => (
                  <button key={index} onClick={() => goToSlide(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-indigo-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-full text-center text-gray-500 py-10">Loading recommendations...</div>
            ) : filtered.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">No recommendations available.</div>
            ) : (
              filtered.map(p => (
                <div key={p.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <ProductCard product={toIProductLike(p)} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Hide scrollbar style */}
        <style dangerouslySetInnerHTML={{ __html: `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        ` }} />
      </div>
    </section>
  );
}


