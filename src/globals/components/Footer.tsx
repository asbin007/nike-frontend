// components/Footer.jsx
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart, ArrowUp } from 'lucide-react';

export default function Footer() {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Get current day


    return (
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-300">
        {/* Main Footer */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <h3 className="text-2xl font-bold text-white">ShoeMart</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Nepal's premier destination for premium footwear. We offer the best quality shoes with excellent customer service and nationwide delivery.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-all duration-300 group">
                  <Facebook className="w-5 h-5 group-hover:scale-110" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 group">
                  <Twitter className="w-5 h-5 group-hover:scale-110" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-300 group">
                  <Instagram className="w-5 h-5 group-hover:scale-110" />
                </a>
                <a href="mailto:shoemart@help.com" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 group">
                  <Mail className="w-5 h-5 group-hover:scale-110" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-white text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/all-shoes" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/collections" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Collections
                  </Link>
                </li>
                <li>
                  <Link to="/my-cart" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Shopping Cart
                  </Link>
                </li>
                <li>
                  <Link to="/wishlist" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link to="/my-orders" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                    My Orders
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-white text-xl font-semibold mb-4">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400">Bagar-1, Pokhara</p>
                    <p className="text-gray-400">Gandaki Province, Nepal</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400">+977 9800000000</p>
                    <p className="text-gray-400">+977 9800000001</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <a href="mailto:shoemart@help.com" className="text-gray-400 hover:text-white transition-colors">
                    shoemart@help.com
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <p className="text-gray-400">
                  © 2025 <span className="text-white font-medium">SHOEMART</span>. All Rights Reserved
                </p>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </footer>
    );
  }