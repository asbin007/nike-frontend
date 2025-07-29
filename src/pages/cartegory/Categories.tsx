import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function Categories() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const allShoesCardRef = useRef(null);
  const menCardRef = useRef(null);
  const womenCardRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    // Animate title
    gsap.fromTo(titleRef.current,
      { 
        y: 50, 
        opacity: 0 
      },
      { 
        y: 0, 
        opacity: 1, 
        duration: 1,
        ease: "power2.out"
      }
    );

    // Animate cards with stagger
    gsap.fromTo([allShoesCardRef.current, menCardRef.current, womenCardRef.current],
      { 
        y: 100, 
        opacity: 0,
        scale: 0.9
      },
      { 
        y: 0, 
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Animate stats
    gsap.fromTo(statsRef.current,
      { 
        y: 30, 
        opacity: 0 
      },
      { 
        y: 0, 
        opacity: 1,
        duration: 0.8,
        delay: 0.5,
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Floating animation for cards
    gsap.to([allShoesCardRef.current, menCardRef.current, womenCardRef.current], {
      y: -10,
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.5
    });

  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-gray-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-red-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-10 blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        {/* Header */}
        <div ref={titleRef} className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Explore</span>
            <Sparkles className="h-6 w-6 text-indigo-500" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated collections designed for every style and occasion
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {/* All Shoes Category */}
          <div ref={allShoesCardRef} className="group relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              {/* Background Image */}
              <div className="relative h-96 lg:h-[500px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1552346154-21d32810aba3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="All Shoes Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-6 left-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
                    Complete Collection
                  </div>
                </div>
                
                <div className="absolute top-6 right-6">
                  <div className="bg-green-500 text-white rounded-full px-3 py-1 text-xs font-bold">
                    View All
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="text-white">
                  <h3 className="text-3xl lg:text-4xl font-bold mb-3 group-hover:text-green-200 transition-colors duration-300">
                    All Shoes
                  </h3>
                  <p className="text-gray-200 mb-6 text-lg">
                    Browse our complete collection of premium footwear
                  </p>
                  
                  <Link
                    to="/all-shoes"
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-green-100 transition-all duration-300 group-hover:scale-105"
                  >
                    Browse All
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Men's Category */}
          <div ref={menCardRef} className="group relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              {/* Background Image */}
              <div className="relative h-96 lg:h-[500px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Men's Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-6 left-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
                    New Arrivals
                  </div>
                </div>
                
                <div className="absolute top-6 right-6">
                  <div className="bg-red-500 text-white rounded-full px-3 py-1 text-xs font-bold">
                    -20% OFF
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="text-white">
                  <h3 className="text-3xl lg:text-4xl font-bold mb-3 group-hover:text-indigo-200 transition-colors duration-300">
                    Men's Collection
                  </h3>
                  <p className="text-gray-200 mb-6 text-lg">
                    Elevate your style with our premium men's footwear collection
                  </p>
                  
                  <Link
                    to="/men"
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-indigo-100 transition-all duration-300 group-hover:scale-105"
                  >
                    Explore Collection
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Women's Category */}
          <div ref={womenCardRef} className="group relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              {/* Background Image */}
              <div className="relative h-96 lg:h-[500px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Women's Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-6 left-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
                    Trending Now
                  </div>
                </div>
                
                <div className="absolute top-6 right-6">
                  <div className="bg-pink-500 text-white rounded-full px-3 py-1 text-xs font-bold">
                    -30% OFF
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="text-white">
                  <h3 className="text-3xl lg:text-4xl font-bold mb-3 group-hover:text-pink-200 transition-colors duration-300">
                    Women's Collection
                  </h3>
                  <p className="text-gray-200 mb-6 text-lg">
                    Step into elegance with our stunning women's footwear range
                  </p>
                  
                  <Link
                    to="/women"
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-pink-100 transition-all duration-300 group-hover:scale-105"
                  >
                    Explore Collection
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">500+</h4>
              <p className="text-gray-600">Products Available</p>
            </div>
          </div>

          <div className="text-center group">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">10K+</h4>
              <p className="text-gray-600">Happy Customers</p>
            </div>
          </div>

          <div className="text-center group">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">50+</h4>
              <p className="text-gray-600">Brands</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
