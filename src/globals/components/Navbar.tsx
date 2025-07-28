import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { fetchCartItems } from "../../store/cartSlice";
import toast from "react-hot-toast";
import { Search, Menu } from "lucide-react";
import { gsap } from "gsap";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const reduxToken = useAppSelector((store) => store.auth.user.token);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const logoRef = useRef(null);
  const logoTextRef = useRef(null);

  const { data: cartItems } = useAppSelector((store) => store.cart);

  useEffect(() => {
    const localToken = localStorage.getItem("tokenauth");
    const loggedIn = !!reduxToken || !!localToken;
    setIsLogin(loggedIn);
  }, [reduxToken]);

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
    if (isLogin && cartItems.length > 0) {
      dispatch(fetchCartItems());
    } else {
      e.preventDefault();
      toast.error("No items in the cart", {
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
    dispatch(logout());
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            ref={logoRef}
            onMouseEnter={handleLogoHover}
            onMouseLeave={handleLogoLeave}
            className="relative group cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              {/* Animated logo icon */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                {/* Floating particles */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>
              
              {/* Animated text */}
              <span 
                ref={logoTextRef}
                className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-300"
              >
                ShoeMart
              </span>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10"></div>
          </Link>

          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="font-medium hover:text-indigo-600 transition-colors duration-200">
              Home
            </Link>
            <Link to="/man" className="font-medium hover:text-indigo-600 transition-colors duration-200">
              Men
            </Link>
            <Link to="/women" className="font-medium hover:text-indigo-600 transition-colors duration-200">
              Women
            </Link>
            <Link to="/collections" className="font-medium hover:text-indigo-600 transition-colors duration-200">
              Collections
            </Link>
            <Link to="/my-orders" className="font-medium hover:text-indigo-600 transition-colors duration-200">
              My Orders
            </Link>

            <div className="ml-4">
              {isLogin ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-sm"
                >
                  Login
                </Link>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center gap-2 bg-gray-50 rounded-xl px-3 sm:px-4 py-2 w-48 sm:w-64 lg:w-80 border"
            >
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search for shoe, brands..."
                className="border-0 bg-transparent focus:outline-none placeholder:text-gray-400 text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="relative">
              <Link to="/my-cart" onClick={handleCartClick}>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </button>
              </Link>

              {isLogin && cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </div>

            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {/* Mobile Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 w-[90%] max-w-md mx-auto border"
            >
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search for shoe, brands..."
                className="border-0 bg-transparent focus:outline-none placeholder:text-gray-400 text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col space-y-3 text-center">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-medium hover:text-indigo-600 py-2">
                Home
              </Link>
              <Link to="/man" onClick={() => setMobileMenuOpen(false)} className="font-medium hover:text-indigo-600 py-2">
                Men
              </Link>
              <Link to="/women" onClick={() => setMobileMenuOpen(false)} className="font-medium hover:text-indigo-600 py-2">
                Women
              </Link>
              <Link
                to="/collections"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium hover:text-indigo-600 py-2"
              >
                Collections
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium hover:text-indigo-600 py-2"
              >
                Contact
              </Link>

              <div className="pt-2">
                {isLogin ? (
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
