import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { checkKhaltiPaymentStatus } from "../../store/orderSlice";
import { fetchAllReviews } from "../../store/reviewSlice";
import { fetchAllCollections, fetchPersonalizedRecommendations } from "../../store/recommendationsSlice";
import { useNavigate } from "react-router-dom";

import Footer from "../../globals/components/Footer";
import Features from "../features/Features";
import ProductFilters from "../product/components/ProductFilters";
import ProductRecommendations from "../../components/ProductRecommendations";
import RealTimeReviews from "../../components/RealTimeReviews";
import { Star, Zap, Shield, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Cloudinary version constant (same as ProductCard)
const CLOUDINARY_VERSION = "v1750340657";

// Default fallback images (moved outside component to avoid re-renders)
const defaultSliderImages = [
  "/images/hero-banner.png",
  "/images/special-banner.jpg",
  "/images/cta-1.jpg",
  "/images/cta-2.jpg",
  "/images/collection-1.jpg",
  "/images/collection-2.jpg",
  "/images/collection-3.jpg"
];

export default function Hero() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { review } = useAppSelector((state) => state.reviews);
  const { user } = useAppSelector((state) => state.auth);
  const { 
    personalizedRecommendations, 
    trendingProducts, 
    newArrivals, 
    bestSellers, 
    onSaleProducts, 
    status 
  } = useAppSelector((state) => state.recommendations);
  
  // Check if user has cart or purchase history
  const { cartHistory, purchaseHistory } = useAppSelector((state) => state.recommendations);
  
  // Debug personalized recommendations
  console.log('🎯 Personalized Recommendations Debug:', {
    user: !!user,
    cartHistoryLength: cartHistory.length,
    purchaseHistoryLength: purchaseHistory.length,
    personalizedRecommendationsLength: personalizedRecommendations.length,
    hasUserActivity: cartHistory.length > 0 || purchaseHistory.length > 0,
    shouldShowPersonalized: user && (cartHistory.length > 0 || purchaseHistory.length > 0) && personalizedRecommendations.length > 0
  });
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const imageRef = useRef(null);
  const featuresRef = useRef(null);
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [sliderProducts, setSliderProducts] = useState<any[]>([]);
  // const [usingBackendImages, setUsingBackendImages] = useState(false);

  const sliderTitles = [
    "Special Offers",
    "Premium Quality",
    "Trending Styles",
    "Sport Collection",
    "Casual Wear",
    "Formal Collection"
  ];

  const sliderDescriptions = [
    "Discover our latest summer shoes designed for comfort and style",
    "Get amazing discounts on selected items",
    "Experience premium quality footwear",
    "Stay ahead with trending styles",
    "Perfect for your active lifestyle",
    "Comfortable and stylish casual wear",
    "Elegant formal collection for every occasion"
  ];

  // Navigation routes for each slider image
  const sliderRoutes = [
    "/all-shoes?filter=discount", // Special Offers
    "/collections", // Premium Quality
    "/all-shoes?sort=trending", // Trending Styles
    "/collections/sport", // Sport Collection
    "/all-shoes?category=casual", // Casual Wear
    "/collections/formal", // Formal Collection
    "/collections" // Default collection
  ];

  // Function to fetch real-time product data for slider
  const fetchSliderImages = useCallback(async () => {
    try {
      setIsLoadingImages(true);
      console.log('🖼️ Fetching real-time product data for slider...');
      
      // Fetch real-time product data from API
      const response = await fetch('http://localhost:5000/api/product?limit=20&sort=createdAt&order=desc');
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Real-time product data received:', data);
        
        if (data.data && data.data.length > 0) {
          // Filter products with valid images and process them
          const productsWithImages = data.data
            .filter((product: any) => 
              product.images && 
              Array.isArray(product.images) && 
              product.images.length > 0 &&
              product.images.some((img: string) => img && img.trim() !== '')
            );
          
          console.log('🖼️ Products with images found:', productsWithImages.length);
          
          if (productsWithImages.length > 0) {
            // Select up to 7 products for slider
            const selectedProducts = productsWithImages.slice(0, 7);
            
            const processedImages = selectedProducts.map((product: any, index: number) => {
              // Get the first valid image from each product
              const firstImage = product.images.find((img: string) => img && img.trim() !== '');
              
              if (!firstImage) return null;
              
              console.log(`🖼️ Processing product ${index + 1} image:`, {
                productId: product.id,
                productName: product.name,
                category: product.Category?.categoryName,
                brand: product.brand,
                originalImage: firstImage,
                isCloudinary: firstImage.includes('cloudinary'),
                isUploads: firstImage.includes('/uploads/')
              });
              
              // Process image URL for optimal Cloudinary delivery
              if (firstImage.includes('cloudinary')) {
                // Already a Cloudinary URL - optimize it
                if (!firstImage.includes('q_') || !firstImage.includes('w_')) {
                  const optimizedUrl = firstImage.replace('/upload/', '/upload/q_auto,f_auto,w_1920,h_1080,c_fill,g_auto/');
                  console.log('☁️ Optimized Cloudinary URL:', optimizedUrl);
                  return optimizedUrl;
                }
                console.log('☁️ Already optimized Cloudinary URL:', firstImage);
                return firstImage;
              } else if (firstImage.includes('/uploads/')) {
                // Convert uploads path to Cloudinary URL
                const cloudinaryUrl = `https://res.cloudinary.com/dxpe7jikz/image/upload/q_auto,f_auto,w_1920,h_1080,c_fill,g_auto/${CLOUDINARY_VERSION}${firstImage.replace("/uploads", "")}.jpg`;
                console.log('🔄 Converted to Cloudinary URL:', cloudinaryUrl);
                return cloudinaryUrl;
              } else {
                // Direct URL - use as is
                console.log('📁 Direct URL:', firstImage);
                return firstImage;
              }
            }).filter(Boolean); // Remove null values
            
            if (processedImages.length > 0) {
              console.log('✅ Real-time images processed successfully:', processedImages.length);
              console.log('🎯 Final image URLs:', processedImages);
              setSliderImages(processedImages);
              setSliderProducts(selectedProducts); // Store product data for titles/descriptions
              setIsLoadingImages(false);
              return;
            }
          }
        }
      }
      
      // Fallback to default images if API fails or no images found
      console.log('⚠️ Using fallback images - API failed or no images found');
      setSliderImages(defaultSliderImages);
      setIsLoadingImages(false);
      
    } catch (error) {
      console.error('❌ Error fetching real-time product data:', error);
      console.log('🔄 Falling back to default images');
      setSliderImages(defaultSliderImages);
      setIsLoadingImages(false);
    }
  }, []);



  // Check for Khalti payment verification on page load
  useEffect(() => {
    const pidx = localStorage.getItem('khalti_pidx');
    if (pidx) {
      dispatch(checkKhaltiPaymentStatus(pidx));
      localStorage.removeItem('khalti_pidx');
    }
  }, [dispatch]);

  // Fetch all reviews for real-time display
  useEffect(() => {
    console.log('🏠 Home component mounted, fetching data...');
    dispatch(fetchAllReviews());
    
    // Always fetch public collections (trending, new arrivals, best sellers, on sale)
    dispatch(fetchAllCollections(6));
    
    // Fetch slider images from backend
    fetchSliderImages();
    
    // Only fetch personalized recommendations if user is logged in
    if (user && user.token) {
      dispatch(fetchPersonalizedRecommendations()).catch((error) => {
        console.error('fetchPersonalizedRecommendations error:', error);
      });
    }
  }, [dispatch, user, fetchSliderImages]);

  // Refetch personalized recommendations when user activity changes
  useEffect(() => {
    if (user && user.token && (cartHistory.length > 0 || purchaseHistory.length > 0)) {
      dispatch(fetchPersonalizedRecommendations()).catch((error) => {
        console.error('fetchPersonalizedRecommendations error after activity change:', error);
      });
    }
  }, [cartHistory.length, purchaseHistory.length, dispatch, user]);

  // Force fetch personalized recommendations if user has activity but no recommendations
  useEffect(() => {
    if (user && user.token && (cartHistory.length > 0 || purchaseHistory.length > 0) && personalizedRecommendations.length === 0) {
      dispatch(fetchPersonalizedRecommendations()).catch((error) => {
        console.error('Force fetch error:', error);
      });
    }
  }, [cartHistory.length, purchaseHistory.length, personalizedRecommendations.length, dispatch, user]);

  // Force fetch recommendations on page load - if user has any activity
  useEffect(() => {
    if (user && user.token && (cartHistory.length > 0 || purchaseHistory.length > 0) && personalizedRecommendations.length === 0) {
      setTimeout(() => {
        dispatch(fetchPersonalizedRecommendations()).catch((error) => {
          console.error('Manual trigger error:', error);
        });
      }, 1000);
    }
  }, [cartHistory.length, purchaseHistory.length, personalizedRecommendations.length, dispatch, user]);


  useEffect(() => {
    // Auto-play slider
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      }, 5000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, sliderImages.length]);

  useEffect(() => {
    // Enhanced Hero section animations
    const tl = gsap.timeline();
    
    // Animate welcome message with bounce effect
    tl.fromTo(titleRef.current, 
      { y: 100, opacity: 0, scale: 0.8, rotation: -5 },
      { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 1.2, ease: "back.out(1.7)" }
    )
    .fromTo(subtitleRef.current,
      { y: 50, opacity: 0, x: -20 },
      { y: 0, opacity: 1, x: 0, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    )
    .fromTo(buttonRef.current,
      { scale: 0, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.3"
    );

    // Add floating animation to welcome elements
    gsap.to(".welcome-avatar", {
      y: -10,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });

    // Animate stats cards with stagger
    gsap.fromTo(".stats-card",
      { y: 50, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.2, delay: 1 }
    );

    // Slider animations
    gsap.fromTo(sliderRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }
    );

    // Parallax effect for hero image
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      // Floating animation for the image
      gsap.to(imageRef.current, {
        y: -10,
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });
    }


    // Scroll-triggered animations for features
    const featureCards = document.querySelectorAll(".feature-card");
    if (featureCards.length > 0 && featuresRef.current) {
      gsap.fromTo(".feature-card",
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
      });
    }

    // Animated background elements
    const bgElements = document.querySelectorAll(".bg-element");
    if (bgElements.length > 0) {
      gsap.to(".bg-element", {
        y: -20,
        duration: 3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.5
      });
    }

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Slider functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Button click handlers
  const handleShopNow = () => {
    navigate('/all-shoes');
  };

  const handleLearnMore = () => {
    const featuresSection = document.querySelector('#features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle slider image click navigation
  const handleSliderImageClick = (index: number) => {
    // If we have real product data, navigate to product detail
    if (sliderProducts[index]?.id) {
      const product = sliderProducts[index];
      const productId = product.id;
      const category = product.Category?.categoryName || 'shoes';
      const brand = product.brand || 'nike';
      
      console.log('🎯 Navigating to product detail:', {
        productId,
        category,
        brand,
        fullProduct: product,
        route: `/${category}/${brand}/${productId}`
      });
      
      // Use the correct route structure: /:collection/:brand/:id
      // If category or brand is missing, use fallback
      if (product.Category?.categoryName && product.brand) {
        navigate(`/${category}/${brand}/${productId}`);
      } else {
        // Fallback to all-shoes with product filter
        console.log('⚠️ Missing category/brand, using fallback route');
        navigate(`/all-shoes?product=${productId}`);
      }
    } else {
      // Fallback to collection routes
      const route = sliderRoutes[index] || '/collections';
      console.log('🎯 Navigating to collection:', route);
      navigate(route);
    }
  };

  // Function to refresh images with new random selection
  const refreshSliderImages = () => {
    console.log('🔄 Refreshing slider with new random images...');
    fetchSliderImages();
  };



  return (
    <>
      <section ref={heroRef} className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 sm:py-12 md:py-16 lg:py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-element absolute top-10 sm:top-20 left-4 sm:left-10 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="bg-element absolute top-20 sm:top-40 right-4 sm:right-20 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-indigo-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="bg-element absolute bottom-10 sm:bottom-20 left-1/4 w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 bg-purple-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="bg-element absolute top-1/2 right-1/3 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-pink-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">  
            <div className="w-full lg:w-1/2 mb-6 sm:mb-8 lg:mb-0 lg:pr-4 xl:pr-8">
              {/* Animated Welcome Message */}
              <div className="mb-6 sm:mb-8 relative">
                {/* Floating Background Elements */}
                <div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute -top-1 sm:-top-2 -right-3 sm:-right-6 w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s'}}></div>
                <div className="absolute -bottom-1 sm:-bottom-2 left-4 sm:left-8 w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1.5s'}}></div>
                
                <div className="relative z-10">
                    {/* Simple Welcome Message */}
                    <div className="text-center sm:text-left mb-6">
                      <h1 ref={titleRef} className="text-4xl sm:text-5xl md:text-6xl font-bold">
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                          Welcome
                        </span>
                        {user?.username ? (
                          <span className="bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 bg-clip-text text-transparent animate-pulse ml-2">
                            , {user.username}
                          </span>
                        ) : ''}
                      </h1>
                    </div>

                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700">4.8</span>
                </div>
                <span className="text-gray-400 hidden sm:inline">|</span>
                <span className="text-xs sm:text-sm text-gray-600">
                  <span className="font-medium text-blue-600">{review.length || 0}</span> live reviews
                </span>
                <span className="text-gray-400 hidden sm:inline">|</span>
                <span className="text-xs sm:text-sm text-green-600 font-medium">✓ Verified Store</span>
              </div>

              {/* Customer Trust Stats */}
              <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6 text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">15,000+ Happy Customers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Nationwide Delivery</span>
                </div>
              </div>
              
                <p ref={subtitleRef} className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg leading-relaxed">
                  Premium quality shoes with genuine warranty. Shop with confidence and get the best deals!
                </p>
              
              {/* Animated Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  ref={buttonRef} 
                  onClick={handleShopNow}
                  className="group relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-500 transform hover:scale-105 sm:hover:scale-110 hover:shadow-2xl flex items-center justify-center overflow-hidden"
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Button Content */}
                  <div className="relative z-10 flex items-center">
                    <span className="mr-1 sm:mr-2">🛒 Shop Now</span>
                    <span className="text-lg">→</span>
                  </div>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-pulse transform -skew-x-12"></div>
                </button>
                
                <button 
                  onClick={handleLearnMore}
                  className="group relative border-2 border-gradient-to-r from-indigo-500 to-purple-500 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 text-gray-700 hover:text-indigo-700 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-500 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
                >
                  <span className="mr-1 sm:mr-2">📚 Learn More</span>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-2 border-current rounded-full flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                    <span className="text-xs">→</span>
                  </div>
                </button>
              </div>

              {/* Realistic Feature highlights */}
              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 transition-colors">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700">2-3 Days Delivery</p>
                  <p className="text-xs text-gray-500">Across Nepal</p>
                </div>
                <div className="text-center group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700">1 Year Warranty</p>
                  <p className="text-xs text-gray-500">Genuine Products</p>
                </div>
                <div className="text-center group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-200 transition-colors">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700">100% Authentic</p>
                  <p className="text-xs text-gray-500">Authorized Dealer</p>
                </div>
              </div>

              {/* Live Review Preview */}
              {review.length > 0 && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">LIVE REVIEW</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-500">LIVE</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${
                            i < (review[0]?.rating || 5) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-xs text-gray-600">{review[0]?.rating || 5}.0</span>
                      <span className="text-xs text-gray-500 hidden sm:inline">•</span>
                      <span className="text-xs text-gray-600 italic">
                        "{review[0]?.comment?.substring(0, 25) || 'Amazing quality! Perfect fit...'}..."
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Real-time Notification */}
              {review.length > 0 && (
                <div className="mt-2 sm:mt-3 flex items-center space-x-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs">
                    Latest review from <span className="font-medium text-blue-600">{review[0]?.User?.username || 'Anonymous'}</span> 
                    {review[0]?.createdAt && (
                      <span> {new Date(review[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    )}
                  </span>
                </div>
              )}
            </div>
            
            <div className="w-full lg:w-1/2 relative mt-6 lg:mt-0">
              
              {/* Modern Dynamic Slider */}
              <div ref={sliderRef} className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200" style={{
                imageRendering: 'auto',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              } as React.CSSProperties}>
                <div className="relative h-72 sm:h-96 md:h-[28rem] lg:h-[32rem]" style={{
                  imageRendering: 'auto'
                } as React.CSSProperties}>
                  {isLoadingImages ? (
                    // Loading skeleton
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-pulse bg-gray-300 w-full h-full rounded-3xl"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-gray-500 text-lg">Loading images...</div>
                      </div>
                    </div>
                  ) : (
                    sliderImages.map((image, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out transform cursor-pointer group ${
                          index === currentSlide 
                            ? 'opacity-100 scale-100 translate-x-0' 
                            : index < currentSlide 
                              ? 'opacity-0 scale-95 -translate-x-full' 
                              : 'opacity-0 scale-95 translate-x-full'
                        }`}
                        onClick={() => handleSliderImageClick(index)}
                      >
                        <img
                          src={image}
                          alt={`Slide ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="eager"
                          decoding="async"
                          style={{
                            imageRendering: 'auto',
                            backfaceVisibility: 'hidden',
                            transform: 'translateZ(0)',
                            willChange: 'transform'
                          } as React.CSSProperties}
                          onError={(e) => {
                            // Use the same fallback logic as ProductCard
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/1920x1080/1f2937/ffffff?text=Image+Not+Available";
                          }}
                        />
                      {/* Modern Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/30"></div>
                      
                      {/* Modern Content Overlay */}
                      <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8 text-white">
                        <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                            {sliderProducts[index]?.name || sliderTitles[index]}
                          </h3>
                          <p className="text-sm sm:text-base md:text-lg opacity-90 leading-relaxed">
                            {sliderProducts[index]?.description?.substring(0, 100) || sliderDescriptions[index]}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {sliderProducts[index]?.price && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium">
                                    Rs. {sliderProducts[index].price}
                                    {sliderProducts[index].discount && (
                                      <span className="text-green-400 ml-1">
                                        ({sliderProducts[index].discount}% OFF)
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">Premium Quality</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">Free Delivery</span>
                              </div>
                            </div>
                            {/* Click indicator and image source */}
                            <div className="flex items-center space-x-2 text-white/80 group-hover:text-white transition-colors">
                              <span className="text-sm font-medium">Click to explore</span>
                              <span className="text-sm group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>

                {/* Modern Slider Controls */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 border border-white/20 group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 border border-white/20 group"
                >
                  <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>

                {/* Modern Play/Pause Button */}
                <button
                  onClick={togglePlayPause}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 p-3 rounded-full shadow-xl transition-all duration-300 border border-white/20 group"
                >
                  {isPlaying ? <Pause className="w-4 h-4 group-hover:scale-110 transition-transform" /> : <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                </button>

                {/* Refresh Images Button */}
                <button
                  onClick={refreshSliderImages}
                  className="absolute top-4 right-16 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 p-3 rounded-full shadow-xl transition-all duration-300 border border-white/20 group"
                  title="Get new random images"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                {/* Modern Slider Dots */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                  {sliderImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'bg-white scale-125 shadow-lg ring-2 ring-white/50' 
                          : 'bg-white/60 hover:bg-white/80 hover:scale-110'
                      }`}
                    />
                  ))}
                </div>

                {/* Modern Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                    style={{ width: `${((currentSlide + 1) / sliderImages.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Realistic Floating Trust Elements */}
              <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-white rounded-full p-2 sm:p-3 shadow-lg animate-bounce">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold">✓</span>
                </div>
                <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1 sm:px-2 py-1 rounded whitespace-nowrap">
                  Since 2025
                </div>
              </div>
              
              <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 bg-white rounded-full p-2 sm:p-3 shadow-lg animate-bounce" style={{animationDelay: '1s'}}>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold">★</span>
                </div>
                <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1 sm:px-2 py-1 rounded whitespace-nowrap">
                  Top Rated
                </div>
              </div>

              {/* Additional Trust Badge */}
              <div className="absolute top-1/2 -right-2 sm:-right-4 bg-white rounded-full p-2 sm:p-3 shadow-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold">🔥</span>
                </div>
                <div className="absolute -left-16 sm:-left-20 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-1 sm:px-2 py-1 rounded whitespace-nowrap">
                  Best Seller
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg className="w-full h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>




      <div ref={featuresRef} className="relative z-10">
        {/* 1. Trending Now - Always Popular First */}
        <div className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🔥 Trending Now</h2>
              <p className="text-gray-600">The most popular products everyone's talking about</p>
            </div>
            <ProductRecommendations
              title=""
              products={trendingProducts}
              type="trending"
              loading={status === 'loading'}
            />
          </div>
        </div>

        {/* 2. Personalized Recommendations */}
        {user && (cartHistory.length > 0 || purchaseHistory.length > 0) && personalizedRecommendations.length > 0 && (
          <div className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">✨ Recommended for You</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Based on your shopping activity
                </p>
              </div>
              <ProductRecommendations
                title=""
                products={personalizedRecommendations}
                type="personalized"
                loading={status === 'loading'}
              />
            </div>
          </div>
        )}


        {/* 3. New Arrivals */}
        <div className="py-8 sm:py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">🆕 New Arrivals</h2>
              <p className="text-sm sm:text-base text-gray-600">Fresh products just added to our collection</p>
            </div>
            <ProductRecommendations
              title=""
              products={newArrivals}
              type="new-arrivals"
              loading={status === 'loading'}
            />
          </div>
        </div>

        {/* 4. Best Sellers */}
        <div className="py-8 sm:py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">🏆 Best Sellers</h2>
              <p className="text-sm sm:text-base text-gray-600">Top-rated customer favorites</p>
            </div>
            <ProductRecommendations
              title=""
              products={bestSellers}
              type="best-sellers"
              loading={status === 'loading'}
            />
          </div>
        </div>

        {/* 5. On Sale */}
        <div className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">💰 On Sale</h2>
              <p className="text-sm sm:text-base text-gray-600">Limited time offers you don't want to miss</p>
            </div>
            <ProductRecommendations
              title=""
              products={onSaleProducts}
              type="on-sale"
              loading={status === 'loading'}
            />
          </div>
        </div>

        {/* 6. Our Premium Collection */}
        <section className="relative z-10 bg-white py-8 sm:py-12 md:py-16">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Our Premium Collection
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our complete selection of premium footwear for every style and occasion
              </p>
            </div>
            <ProductFilters/>
          </div>
        </section>

        <div id="features-section">
        <Features/>
        </div>
        
        {/* Live Customer Reviews */}
        <section className="bg-gray-50 py-8 sm:py-12">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Live Customer Reviews</h3>
              <p className="text-sm sm:text-base text-gray-600">Real-time feedback from our verified customers</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <RealTimeReviews />
            </div>
          </div>
        </section>
      </div>
      
      <Footer/>

      {/* Custom CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
            50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.8); }
          }
          
          .animate-fade-in {
            animation: fadeIn 1s ease-out;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
          
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          
          .welcome-avatar:hover {
            animation: pulse-glow 1s ease-in-out infinite;
          }
          
          .stats-card:hover {
            animation: float 0.6s ease-in-out;
          }
        `
      }} />

    </>
  );
}