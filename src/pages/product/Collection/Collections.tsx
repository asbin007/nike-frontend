import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchProducts } from '../../../store/productSlice';
import { addToWishlist, removeFromWishlist } from '../../../store/wishlistSlice';
import { ArrowRight, Heart, Clock, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import CountdownTimer from '../../../components/CountdownTimer';

interface Product {
  id: string;
  name: string;
  price: number;
  brand: string;
  image?: string;
  images?: string[];
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  discount?: number;
  isNew?: boolean;
}

const Collections = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, status } = useAppSelector((store) => store.products);
  const { items: wishlistItems } = useAppSelector((store) => store.wishlist);
  const location = useLocation();
  
  // Debug logging
  console.log('Collections component rendered, current path:', location.pathname);
  
  // Add effect to log when component mounts/unmounts
  useEffect(() => {
    console.log('Collections component mounted');
    return () => {
      console.log('Collections component unmounted');
    };
  }, []);
  
  // State for notifications and interactions
  const [notifiedProducts, setNotifiedProducts] = useState<Set<string>>(new Set());
  const [showFestivalCountdown, setShowFestivalCountdown] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [currentFestival, setCurrentFestival] = useState<'dashain' | 'tihar' | 'none'>('dashain');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Get unique collections from products (using brands instead of categories)
  const collections = ['all', ...new Set(products.map(product => product.brand).filter(Boolean))];
  
  // Featured products (filtered by selected brand or first 6 products)
  const featuredProducts = selectedBrand 
    ? products.filter(product => product.brand === selectedBrand)
    : products.slice(0, 6);

  // Mock upcoming products for Dashain/Tihar season (without prices)
  const upcomingProducts = [
    {
      id: 'upcoming-1',
      name: 'Nike Air Max Dashain Special',
      brand: 'Nike',
      category: 'Running',
      releaseDate: '2025-10-15',
      description: 'Limited edition Dashain collection with traditional Nepali design elements',
      image: '/images/product-1.jpg',
      isNew: true
    },
    {
      id: 'upcoming-2',
      name: 'Adidas Ultraboost Tihar Edition',
      brand: 'Adidas',
      category: 'Running',
      releaseDate: '2025-10-20',
      description: 'Festive Tihar collection featuring vibrant colors and premium comfort',
      image: '/images/product-2.jpg',
      isNew: true
    },
    {
      id: 'upcoming-3',
      name: 'Puma RS-X Festival Collection',
      brand: 'Puma',
      category: 'Lifestyle',
      releaseDate: '2025-10-25',
      description: 'Celebration-ready footwear perfect for the festive season',
      image: '/images/product-3.jpg',
      isNew: true
    }
  ];

  // Enhanced festive offers with better functionality
  const festiveOffers = [
    {
      id: 'offer-1',
      title: 'Dashain Dhamaka Sale',
      description: 'Up to 50% off on all Nike products',
      discount: '50%',
      validUntil: '2024-10-20',
      category: 'Nike',
      color: 'from-orange-500 to-red-600',
      code: 'DASHAIN50',
      minSpend: 5000,
      maxDiscount: 10000
    },
    {
      id: 'offer-2',
      title: 'Tihar Twinkle Deals',
      description: 'Buy 2 Get 1 Free on Adidas',
      discount: 'B2G1',
      validUntil: '2024-11-05',
      category: 'Adidas',
      color: 'from-purple-500 to-pink-600',
      code: 'TIHARB2G1',
      minSpend: 8000,
      maxDiscount: 15000
    },
    {
      id: 'offer-3',
      title: 'Festival Flash Sale',
      description: 'Extra 15% off on Puma products',
      discount: '15%',
      validUntil: '2024-10-30',
      category: 'Puma',
      color: 'from-green-500 to-blue-600',
      code: 'FESTIVAL15',
      minSpend: 3000,
      maxDiscount: 5000
    }
  ];

  // Real festival dates for 2025 - memoized to prevent re-creation on every render
  const festivalDates = useMemo(() => ({
    dashain: {
      start: new Date('2025-09-22T00:00:00'),
      end: new Date('2025-10-06T23:59:59'),
      tika: new Date('2025-10-02T00:00:00'),
      name: 'Dashain',
      emoji: '🎉'
    },
    tihar: {
      start: new Date('2025-10-25T00:00:00'),
      end: new Date('2025-10-29T23:59:59'),
      tika: new Date('2025-10-27T00:00:00'), // Bhai Tika day
      name: 'Tihar',
      emoji: '🪔'
    }
  }), []);

  // Target date for countdown
  const [targetDate, setTargetDate] = useState<Date>(new Date());

  // Calculate which festival is currently active or upcoming and set target date
  useEffect(() => {
    const now = new Date();
    let newTargetDate: Date;
    let newFestival: 'dashain' | 'tihar' | 'none' = 'none';

    // Check if Dashain is active
    if (now >= festivalDates.dashain.start && now <= festivalDates.dashain.end) {
      newFestival = 'dashain';
      if (now < festivalDates.dashain.tika) {
        newTargetDate = festivalDates.dashain.tika; // Countdown to Tika
      } else {
        newTargetDate = festivalDates.dashain.end; // Countdown to end
      }
    }
    // Check if Tihar is active
    else if (now >= festivalDates.tihar.start && now <= festivalDates.tihar.end) {
      newFestival = 'tihar';
      if (now < festivalDates.tihar.tika) {
        newTargetDate = festivalDates.tihar.tika; // Countdown to Bhai Tika
      } else {
        newTargetDate = festivalDates.tihar.end; // Countdown to end
      }
    }
    // Check which festival is upcoming
    else if (now < festivalDates.dashain.start) {
      newFestival = 'dashain';
      newTargetDate = festivalDates.dashain.start; // Countdown to start
    }
    else if (now < festivalDates.tihar.start) {
      newFestival = 'tihar';
      newTargetDate = festivalDates.tihar.start; // Countdown to start
    }
    else {
      newTargetDate = new Date('2026-09-22T00:00:00'); // Next year's Dashain
    }

    setCurrentFestival(newFestival);
    setTargetDate(newTargetDate);
  }, [festivalDates]);

  const handleCollectionClick = (collection: string) => {
    if (collection === 'all') {
      setSelectedBrand(null);
    } else {
      setSelectedBrand(collection);
    }
    // Scroll to products section
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };


  // Handle notification signup
  const handleNotifyMe = (productId: string, productName: string) => {
    if (notifiedProducts.has(productId)) {
      toast.success('You\'re already notified for this product!');
      return;
    }

    setNotifiedProducts(prev => new Set(prev).add(productId));
    toast.success(`You'll be notified when ${productName} is available!`);
    
    // In a real app, you'd send this to your backend
    console.log(`User notified for product: ${productId}`);
  };

  // Handle offer code copy
  const handleCopyCode = (code: string, offerTitle: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`${offerTitle} code copied to clipboard!`);
  };

  // Handle shop now for offers
  const handleShopNow = (category: string) => {
    setSelectedBrand(category);
    // Scroll to products section
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
    toast.success(`Browsing ${category} products with special offers!`);
  };

  // Handle product navigation to details
  const handleProductClick = (product: Product) => {
    const brandSlug = product.brand.toLowerCase();
    navigate(`/men/${brandSlug}/${product.id}`);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent product click
    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || product.image || '/images/product-1.jpg',
        brand: product.brand,
        originalPrice: product.originalPrice,
        rating: product.rating || 4.5,
        reviews: product.reviews || 0,
        inStock: product.inStock !== false
      }));
      toast.success('Added to wishlist');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 lg:px-6 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            Discover Amazing Collections
          </h1>
          <p className="text-xl lg:text-2xl text-indigo-100 mb-8">
            Find your perfect style from our curated selection
          </p>
          
          {/* Festival Countdown */}
          {showFestivalCountdown && currentFestival !== 'none' && (
            <div className="bg-gradient-to-r from-white/25 to-white/15 backdrop-blur-md rounded-3xl p-8 mb-8 max-w-5xl mx-auto border border-white/20 shadow-2xl">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="text-4xl animate-bounce">
                    {currentFestival === 'dashain' ? '🎉' : '🪔'}
                  </div>
                  <h3 className="text-3xl font-bold text-white drop-shadow-lg">
                    {currentFestival === 'dashain' ? 'Dashain' : 'Tihar'} Countdown
                  </h3>
                  <div className="text-4xl animate-bounce" style={{animationDelay: '0.5s'}}>
                    {currentFestival === 'dashain' ? '🎉' : '🪔'}
                  </div>
                </div>
                <div className="bg-white/20 rounded-full px-6 py-2 inline-block">
                  <p className="text-white font-medium text-sm">
                    {(() => {
                      const now = new Date();
                      if (currentFestival === 'dashain') {
                        if (now < festivalDates.dashain.start) return 'Dashain starts on September 22, 2025';
                        if (now < festivalDates.dashain.tika) return 'Tika day on October 2, 2025';
                        if (now < festivalDates.dashain.end) return 'Dashain ends on October 6, 2025';
                        return 'Tihar starts on October 25, 2025';
                      } else {
                        if (now < festivalDates.tihar.start) return 'Tihar starts on October 25, 2025';
                        if (now < festivalDates.tihar.tika) return 'Bhai Tika on October 27, 2025';
                        if (now < festivalDates.tihar.end) return 'Tihar ends on October 29, 2025';
                        return 'Next Dashain in 2026';
                      }
                    })()}
                  </p>
                </div>
              </div>
              
              <CountdownTimer
                targetDate={targetDate}
                variant="festival"
                size="lg"
                className="max-w-4xl mx-auto"
              />
              
              <div className="text-center mt-6">
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => setShowFestivalCountdown(false)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-white/30 hover:border-white/50"
                  >
                    Hide Countdown
                  </button>
                  <button 
                    onClick={() => setCurrentFestival(currentFestival === 'dashain' ? 'tihar' : 'dashain')}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-white/30 hover:border-white/50"
                  >
                    Switch to {currentFestival === 'dashain' ? 'Tihar' : 'Dashain'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="bg-white bg-opacity-20 rounded-full px-6 py-2">
              <span className="font-semibold">{products.length}+</span> Products
            </div>
            <div className="bg-white bg-opacity-20 rounded-full px-6 py-2">
              <span className="font-semibold">{collections.length}</span> Collections
            </div>
            <div className="bg-white bg-opacity-20 rounded-full px-6 py-2">
              <span className="font-semibold">24/7</span> Support
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-12">
        {/* Festive Offers Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Festival Special Offers</h2>
              <p className="text-gray-600">Celebrate Dashain & Tihar with amazing deals</p>
            </div>
            <Link 
              to="/offers" 
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All Offers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {festiveOffers.map((offer) => (
              <div key={offer.id} className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`h-32 bg-gradient-to-r ${offer.color} relative`}>
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                      {offer.discount}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-bold text-lg">{offer.title}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{offer.description}</p>
                  
                  {/* Offer Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Min. Spend:</span>
                      <span className="font-medium">रु{offer.minSpend.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Max. Discount:</span>
                      <span className="font-medium">रु{offer.maxDiscount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Valid until:</span>
                      <span className="font-medium">{new Date(offer.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Offer Code */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Use Code:</span>
                      <span className="font-mono font-bold text-indigo-600">{offer.code}</span>
                    </div>
                    <button 
                      onClick={() => handleCopyCode(offer.code, offer.title)}
                      className="w-full mt-2 bg-indigo-100 text-indigo-700 py-2 px-3 rounded-lg hover:bg-indigo-200 transition-colors duration-200 text-sm font-medium"
                    >
                      Copy Code
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleShopNow(offer.category)}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    Shop Now
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Use code <span className="font-mono font-bold">{offer.code}</span> at checkout
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Collections Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Collection</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated collections designed to match your lifestyle and preferences
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collections.map((collection) => (
                             <div
                 key={collection}
                 onClick={() => handleCollectionClick(collection)}
                 className={`group cursor-pointer rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                   selectedBrand === collection 
                     ? 'bg-blue-50 border-2 border-blue-200' 
                     : 'bg-white'
                 }`}
               >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors duration-300">
                  <span className="text-2xl font-bold text-indigo-600">
                    {collection === 'all' ? '🏷️' : '👟'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 capitalize">
                  {collection === 'all' ? 'All Products' : collection}
                </h3>
                                 <p className="text-sm text-gray-600">
                   {collection === 'all' 
                     ? `${products.length} products` 
                     : `${products.filter(p => p.brand === collection).length} products`
                   }
                 </p>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Products Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🚀 Upcoming Products</h2>
              <p className="text-gray-600">Get ready for the latest releases this festive season</p>
            </div>
            <Link 
              to="/upcoming" 
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingProducts.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Coming Soon
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(product.releaseDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500">{product.brand}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">New</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  
                  {/* No price shown for upcoming products */}
                  <div className="text-center mb-4">
                    <span className="text-lg font-semibold text-indigo-600">Price TBA</span>
                  </div>
                  
                  <button 
                    onClick={() => handleNotifyMe(product.id, product.name)}
                    disabled={notifiedProducts.has(product.id)}
                    className={`w-full py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
                      notifiedProducts.has(product.id)
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {notifiedProducts.has(product.id) ? (
                      <>
                        <Bell className="h-4 w-4" />
                        Already Notified
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4" />
                        Notify Me
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
                 <section id="products-section">
           <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">
               {selectedBrand ? `${selectedBrand} Products` : 'Featured Products'}
             </h2>
             <p className="text-gray-600 max-w-2xl mx-auto">
               {selectedBrand 
                 ? `Explore our amazing ${selectedBrand} collection`
                 : 'Discover our most popular and trending products loved by customers'
               }
             </p>
             {selectedBrand && (
               <button
                 onClick={() => setSelectedBrand(null)}
                 className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
               >
                 ← Back to All Products
               </button>
             )}
           </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => {
              const isInWishlist = wishlistItems.some(item => item.id === product.id);
              
              return (
                <div 
                  key={product.id} 
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative">
                    <img
                      src={product.images?.[0] ? `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${product.images[0].replace("/uploads", "")}.jpg` : "/images/product-1.jpg"}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discount && product.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        -{product.discount}%
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <button 
                        onClick={(e) => handleWishlistToggle(product, e)}
                        className={`p-2 rounded-full shadow-md transition-all duration-200 ${
                          isInWishlist 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-white hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">{product.brand}</span>
                      {product.isNew && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">New</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-gray-900">रु{product.price.toLocaleString()}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">रु{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Collections;