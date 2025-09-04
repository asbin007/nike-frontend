import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { checkKhaltiPaymentStatus } from "../../store/orderSlice";
import { fetchAllReviews } from "../../store/reviewSlice";
import { fetchRecommendations } from "../../store/recommendationsSlice";

import Footer from "../../globals/components/Footer";
import Features from "../features/Features";
import ProductFilters from "../product/components/ProductFilters";
import PromoBanners from "../promoBanner/PromoBanner";
import ProductRecommendations from "../../components/ProductRecommendations";
import RealTimeReviews from "../../components/RealTimeReviews";
import { ArrowRight, Star, Zap, Shield, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

export default function Hero() {
  const dispatch = useAppDispatch();
  const { review } = useAppSelector((state) => state.reviews);
  const { personalizedRecommendations, trendingProducts, status } = useAppSelector((state) => state.recommendations);
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const imageRef = useRef(null);
  const featuresRef = useRef(null);
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);


  // Slider images from your local folder
  const sliderImages = [
    "/images/hero-banner.png",
    "/images/special-banner.jpg",
    "/images/cta-1.jpg",
    "/images/cta-2.jpg",
    "/images/collection-1.jpg",
    "/images/collection-2.jpg",
    "/images/collection-3.jpg"
  ];

  const sliderTitles = [
    "New Summer Collection",
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



  // Check for Khalti payment verification on page load
  useEffect(() => {
    const pidx = localStorage.getItem('khalti_pidx');
    if (pidx) {
      console.log('Found pidx in localStorage (Home):', pidx);
      dispatch(checkKhaltiPaymentStatus(pidx));
      localStorage.removeItem('khalti_pidx');
    }
  }, [dispatch]);

  // Fetch all reviews for real-time display
  useEffect(() => {
    dispatch(fetchAllReviews());
    if (status === 'idle') {
      dispatch(fetchRecommendations());
    }
  }, [dispatch, status]);

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
    // Hero section animations
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    )
    .fromTo(subtitleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    )
    .fromTo(buttonRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.3"
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

    // Text typing effect
    if (titleRef.current) {
      gsap.to(titleRef.current, {
        duration: 2,
        text: "New Summer Shoes Collection",
        ease: "none",
        delay: 0.5
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



  return (
    <>
      <section ref={heroRef} className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 md:py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-element absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="bg-element absolute top-40 right-20 w-32 h-32 bg-indigo-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="bg-element absolute bottom-20 left-1/4 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="bg-element absolute top-1/2 right-1/3 w-24 h-24 bg-pink-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">  
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              {/* Realistic Rating and Trust Indicators */}
              <div className="flex items-center mb-6 space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-700">4.8</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">{review.length || 0}</span> live reviews
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-sm text-green-600 font-medium">✓ Verified Store</span>
              </div>

              {/* Customer Trust Stats */}
              <div className="flex items-center space-x-6 mb-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">15,000+ Happy Customers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Nationwide Delivery</span>
                </div>
              </div>
              
              <h1 ref={titleRef} className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-indigo-600 bg-clip-text text-transparent">
                Premium Footwear for Every Style
              </h1>
              
              <p ref={subtitleRef} className="text-gray-600 mb-6 text-lg leading-relaxed">
                Discover authentic Nike, Adidas, Puma & more. Premium quality shoes with genuine warranty. 
                Free shipping across Nepal. Shop with confidence!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button ref={buttonRef} className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center">
                  <span>Shop Now</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button className="border-2 border-gray-300 hover:border-indigo-600 text-gray-700 hover:text-indigo-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                  <span>Learn More</span>
                </button>
              </div>

              {/* Realistic Feature highlights */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center group">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 transition-colors">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">2-3 Days Delivery</p>
                  <p className="text-xs text-gray-500">Across Nepal</p>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">1 Year Warranty</p>
                  <p className="text-xs text-gray-500">Genuine Products</p>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-200 transition-colors">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">100% Authentic</p>
                  <p className="text-xs text-gray-500">Authorized Dealer</p>
                </div>
              </div>

              {/* Live Review Preview */}
              {review.length > 0 && (
                <div className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">LIVE REVIEW</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-500">LIVE</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
                    <span className="text-xs text-gray-600">{review[0]?.rating || 5}.0</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-600 italic">
                      "{review[0]?.comment?.substring(0, 30) || 'Amazing quality! Perfect fit...'}..."
                    </span>
                  </div>
                </div>
              )}

              {/* Real-time Notification */}
              {review.length > 0 && (
                <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span>
                    Latest review from <span className="font-medium text-blue-600">{review[0]?.User?.username || 'Anonymous'}</span> 
                    {review[0]?.createdAt && (
                      <span> {new Date(review[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    )}
                  </span>
                </div>
              )}
            </div>
            
            <div className="md:w-1/2 relative">
              {/* Dynamic Slider */}
              <div ref={sliderRef} className="relative overflow-hidden rounded-2xl shadow-2xl">
                <div className="relative h-96 md:h-[500px]">
                  {sliderImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                        index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">{sliderTitles[index]}</h3>
                        <p className="text-sm md:text-base opacity-90">{sliderDescriptions[index]}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Slider Controls */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Play/Pause Button */}
                <button
                  onClick={togglePlayPause}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-all duration-300 border border-gray-200"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                {/* Slider Dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {sliderImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 border border-white/30 ${
                        index === currentSlide 
                          ? 'bg-white scale-125 shadow-lg' 
                          : 'bg-white/60 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Realistic Floating Trust Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-bounce">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Since 2025
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg animate-bounce" style={{animationDelay: '1s'}}>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">★</span>
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Top Rated
                </div>
              </div>

              {/* Additional Trust Badge */}
              <div className="absolute top-1/2 -right-4 bg-white rounded-full p-3 shadow-lg">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🔥</span>
                </div>
                <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
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

      {/* Real-Time Customer Reviews Section */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Live Customer Reviews</h3>
            <p className="text-gray-600">Real-time feedback from our verified customers</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <RealTimeReviews />
          </div>
        </div>
      </section>



      {/* Products Section - Now prominently displayed */}
      <section className="relative z-10 bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Premium Collection
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover our handpicked selection of premium footwear for every style and occasion
            </p>
          </div>
          <ProductFilters/>
        </div>
      </section>

      {/* Removed recommendation sections - using realistic data instead */}

      {/* Other sections */}
      <div ref={featuresRef} className="relative z-10">
        <PromoBanners/>
        
        {/* Personalized Recommendations */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductRecommendations
              title="Recommended for You"
              products={personalizedRecommendations}
              type="personalized"
              loading={status === 'loading'}
            />
          </div>
        </div>

        {/* Trending Products */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProductRecommendations
              title="Trending Now"
              products={trendingProducts}
              type="trending"
              loading={status === 'loading'}
            />
          </div>
        </div>

        <Features/>
      </div>
      
      <Footer/>


    </>
  );
}