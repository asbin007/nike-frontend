import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { fetchCartItems } from "../../store/cartSlice";
import toast from "react-hot-toast";
import { Search, Menu, X, ShoppingBag, User, Heart, ChevronDown, Settings, LogOut, BarChart3, Lock } from "lucide-react";
import { gsap } from "gsap";
import { fetchRecommendations } from "../../store/recommendationsSlice";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const reduxToken = useAppSelector((store) => store.auth.user.token);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDrop, setShowSearchDrop] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const logoRef = useRef(null);
  const logoTextRef = useRef(null);
  const userMenuRef = useRef(null);

  const { data: cartItems } = useAppSelector((store) => store.cart);
  const user = useAppSelector((store) => store.auth.user);
  
  // Debug cart state
  console.log('🛒 Navbar Cart Debug:', {
    cartItemsLength: cartItems?.length || 0,
    cartItems: cartItems,
    isLogin: isLogin,
    shouldShowCartCount: isLogin && cartItems?.length > 0
  });
  const wishlistItems = useAppSelector((store) => store.wishlist.items);
  const { products: comparisonProducts } = useAppSelector((store) => store.comparison);
  const { personalizedRecommendations, trendingProducts } = useAppSelector((store) => store.recommendations);

  useEffect(() => {
    const localToken = localStorage.getItem("tokenauth");
    const loggedIn = !!reduxToken || !!localToken;
    setIsLogin(loggedIn);
  }, [reduxToken]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {
      console.log(e);
    }
  }, []);


  // Handle search focus - removed recommendation preloading
  const handleSearchFocus = () => {
    setShowSearchDrop(true);
    // Preload recommendations if not already loaded
    if (personalizedRecommendations.length === 0 && trendingProducts.length === 0) {
      dispatch(fetchRecommendations());
    }
  };

  const handleSearchBlur = () => {
    // small delay to allow click
    setTimeout(() => setShowSearchDrop(false), 150);
  };

  // Removed recommendation filtering - using realistic data instead

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !(userMenuRef.current as HTMLElement).contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logo animations
  useEffect(() => {
    // Initial logo animation
    gsap.fromTo(logoRef.current,
      { 
        y: -50, 
        opacity: 0, 
        scale: 0.8,
        rotation: -10 
      },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        rotation: 0,
        duration: 1,
        ease: "back.out(1.7)"
      }
    );

    // Text animation
    gsap.fromTo(logoTextRef.current,
      { 
        opacity: 0,
        x: -20,
        skewX: 15
      },
      { 
        opacity: 1,
        x: 0,
        skewX: 0,
        duration: 0.8,
        delay: 0.3,
        ease: "power2.out"
      }
    );

    // Continuous floating animation
    gsap.to(logoRef.current, {
      y: -3,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
      delay: 1
    });

  }, []);

  const handleLogoHover = () => {
    // Hover animation
    gsap.to(logoRef.current, {
      scale: 1.1,
      rotation: 5,
      duration: 0.3,
      ease: "power2.out"
    });

    // Text color animation
    gsap.to(logoTextRef.current, {
      color: "#4f46e5",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleLogoLeave = () => {
    // Reset animation
    gsap.to(logoRef.current, {
      scale: 1,
      rotation: 0,
      duration: 0.3,
      ease: "power2.out"
    });

    // Reset text color
    gsap.to(logoTextRef.current, {
      color: "#4f46e5",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleCartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    console.log('🛒 Cart clicked:', { isLogin, cartItemsLength: cartItems?.length });
    
    if (isLogin) {
      // Always fetch fresh cart data when clicking cart
      dispatch(fetchCartItems());
      // Don't prevent navigation, let it go to cart page
    } else {
      e.preventDefault();
      toast.error("Please login to view your cart", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tokenauth");
    setIsLogin(false);
    setMobileMenuOpen(false);
    setShowUserMenu(false);
    dispatch(logout());
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      // save to recent
      try {
        const q = searchQuery.trim();
        const updated = [q, ...recentSearches.filter(r => r !== q)].slice(0, 8);
        setRecentSearches(updated);
        localStorage.setItem("recent_searches", JSON.stringify(updated));
      } catch (e) {
        console.log(e);
      }
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/98 backdrop-blur-lg shadow-xl border-b border-gray-100' 
        : 'bg-white shadow-sm'
    }`}>
      <div className="w-screen px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            ref={logoRef}
            onMouseEnter={handleLogoHover}
            onMouseLeave={handleLogoLeave}
            className="relative group cursor-pointer flex-shrink-0 mr-8"
          >
            <div className="flex items-center space-x-3">
              {/* Professional logo icon */}
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-white font-bold text-lg lg:text-xl">S</span>
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-blue-400 rounded-xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
              </div>
              
              {/* Professional text */}
              <span 
                ref={logoTextRef}
                className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-all duration-300 tracking-tight"
              >
                ShoeMart
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 ml-8">
            <Link 
              to="/all-shoes" 
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-all duration-200 relative group bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg"
            >
              All Shoes
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-indigo-600"></span>
            </Link>
            
            <Link 
              to="/men" 
              className="font-medium text-gray-700 hover:text-indigo-600 transition-all duration-200 relative group px-3 py-2 rounded-lg hover:bg-indigo-50"
            >
              Man
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <Link 
              to="/women" 
              className="font-medium text-gray-700 hover:text-indigo-600 transition-all duration-200 relative group px-3 py-2 rounded-lg hover:bg-indigo-50"
            >
              Women
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <Link 
              to="/collections" 
              className="font-medium text-gray-700 hover:text-indigo-600 transition-all duration-200 relative group px-3 py-2 rounded-lg hover:bg-indigo-50"
            >
              Collections
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Desktop Search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center gap-3 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2.5 w-64 lg:w-80 border border-gray-200 focus-within:border-indigo-300 focus-within:bg-white transition-all duration-200 shadow-sm"
            >
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search for shoes, brands..."
                className="border-0 bg-transparent focus:outline-none placeholder:text-gray-400 text-sm w-full font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
            </form>

            {/* Search Dropdown */}
            {showSearchDrop && (
              <div className="absolute top-16 right-40 w-[28rem] bg-white border border-gray-200 rounded-xl shadow-xl p-4 hidden md:block">

                {/* Trending Products */}
                {trendingProducts.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">Trending now</div>
                    <ul className="divide-y divide-gray-100">
                      {trendingProducts.slice(0, 3).map(item => (
                        <li 
                          key={item.id} 
                          className="py-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            navigate(`/product/${item.id}`);
                            setShowSearchDrop(false);
                          }}
                        >
                          <img 
                            src={
                              item.images?.[0]?.startsWith('http') 
                                ? item.images[0]
                                : item.images?.[0]?.startsWith('/images/') 
                                  ? item.images[0]
                                  : item.images?.[0] 
                                    ? `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${item.images[0].replace('/uploads','')}.jpg`
                                    : '/images/product-1.jpg'
                            }
                            alt={item.name} 
                            className="w-10 h-10 rounded-md object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/product-1.jpg'; }}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.brand}</div>
                          </div>
                          <span className="text-xs text-indigo-600 font-semibold">Rs {item.price?.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Personalized Recommendations */}
                {personalizedRecommendations.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">Recommended for you</div>
                    <ul className="divide-y divide-gray-100">
                      {personalizedRecommendations.slice(0, 3).map(item => (
                        <li 
                          key={item.id} 
                          className="py-2 flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            navigate(`/product/${item.id}`);
                            setShowSearchDrop(false);
                          }}
                        >
                          <img 
                            src={
                              item.images?.[0]?.startsWith('http') 
                                ? item.images[0]
                                : item.images?.[0]?.startsWith('/images/') 
                                  ? item.images[0]
                                  : item.images?.[0] 
                                    ? `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${item.images[0].replace('/uploads','')}.jpg`
                                    : '/images/product-1.jpg'
                            }
                            alt={item.name} 
                            className="w-10 h-10 rounded-md object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/product-1.jpg'; }}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.brand}</div>
                          </div>
                          <span className="text-xs text-indigo-600 font-semibold">Rs {item.price?.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">Recent searches</div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.slice(0, 8).map(r => (
                        <button
                          key={r}
                          onMouseDown={(e) => { e.preventDefault(); navigate(`/search?query=${encodeURIComponent(r)}`); setShowSearchDrop(false); }}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 lg:gap-4">
              
              {/* Wishlist */}
                                <Link to="/wishlist" className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative group">
                    <Heart className="h-5 w-5 text-gray-600 group-hover:text-red-500 transition-colors duration-200" />
                    {wishlistItems?.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium min-w-[18px] text-center">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>

                  {/* Comparison */}
                  <Link to="/comparison" className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative group">
                    <BarChart3 className="h-5 w-5 text-gray-600 group-hover:text-indigo-500 transition-colors duration-200" />
                    {comparisonProducts?.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium min-w-[18px] text-center">
                        {comparisonProducts.length}
                      </span>
                    )}
                  </Link>

                  {/* Cart */}
                  <div className="relative">
                    <Link to="/my-cart" onClick={handleCartClick}>
                      <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors duration-200 relative group">
                        <ShoppingBag className="h-5 w-5 text-gray-600 group-hover:text-indigo-600 transition-colors duration-200" />
                      </button>
                    </Link>

                    {isLogin && cartItems?.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium min-w-[18px] text-center animate-pulse">
                        {cartItems.length}
                      </span>
                    )}
                  </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                {isLogin ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={toggleUserMenu}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">Welcome back!</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        
                        <Link 
                          to="/profile" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors duration-200"
                        >
                          <User className="h-4 w-4" />
                          My Profile
                        </Link>
                        
                        <Link 
                          to="/my-orders" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors duration-200"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          My Orders
                        </Link>
                        
                        <Link 
                          to="/forgot-password" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors duration-200"
                        >
                          <Lock className="h-4 w-4" />
                          Forgot Password
                        </Link>
                        
                        <Link 
                          to="/settings" 
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 transition-colors duration-200"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                        
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                  >
                    <User className="h-4 w-4" />
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white/98 backdrop-blur-lg">
            <div className="py-4 space-y-4">
              {/* Mobile Search */}
                              <form
                  onSubmit={handleSearch}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 mx-auto w-11/12 max-w-md border border-gray-200 focus-within:border-indigo-300 focus-within:bg-white transition-all duration-200 justify-center"
                >
                  <Search className="h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search for shoes, brands..."
                    className="border-0 bg-transparent focus:outline-none placeholder:text-gray-400 text-sm w-full font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col space-y-1 px-4">
                  <Link 
                    to="/all-shoes" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 py-3 px-4 rounded-xl transition-all duration-200"
                  >
                    All Shoes
                  </Link>
                  
                  <Link 
                    to="/man" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 py-3 px-4 rounded-xl transition-all duration-200"
                  >
                    Men
                  </Link>
                  
                  <Link 
                    to="/women" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 py-3 px-4 rounded-xl transition-all duration-200"
                  >
                    Women
                  </Link>
                  
                  <Link 
                    to="/collections" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 py-3 px-4 rounded-xl transition-all duration-200"
                  >
                    Collections
                  </Link>
                  
                  <Link 
                    to="/wishlist" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-between"
                  >
                    <span>Wishlist</span>
                    {wishlistItems?.length > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>
                  
                  <Link 
                    to="/comparison" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-between"
                  >
                    <span>Compare Products</span>
                    {comparisonProducts?.length > 0 && (
                      <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                        {comparisonProducts.length}
                      </span>
                    )}
                  </Link>
                  
                  {isLogin && (
                    <Link 
                      to="/my-orders" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 py-3 px-4 rounded-xl transition-all duration-200"
                    >
                      My Orders
                    </Link>
                  )}
                </nav>

                {/* Mobile Auth Buttons */}
                <div className="px-4 pt-4 border-t border-gray-200">
                  {isLogin ? (
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="block w-full text-center bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  )}
                </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
