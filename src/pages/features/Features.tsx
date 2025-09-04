// components/Features.jsx
import { Truck, RotateCcw, Shield, Headphones, Zap, Gift, Globe, Heart } from 'lucide-react';

export default function Features() {
    const features = [
      {
        icon: <Truck className="h-8 w-8" />,
        title: "Free Shipping",
        description: "Free delivery on orders over रु 2000",
        color: "from-blue-500 to-blue-600"
      },
      {
        icon: <RotateCcw className="h-8 w-8" />,
        title: "Easy Returns",
        description: "30-day return policy for all items",
        color: "from-green-500 to-green-600"
      },
      {
        icon: <Shield className="h-8 w-8" />,
        title: "Secure Payment",
        description: "100% secure payment with Khalti",
        color: "from-purple-500 to-purple-600"
      },
      {
        icon: <Headphones className="h-8 w-8" />,
        title: "24/7 Support",
        description: "Get help anytime via chat or call",
        color: "from-orange-500 to-orange-600"
      },
      {
        icon: <Zap className="h-8 w-8" />,
        title: "Fast Delivery",
        description: "Same day delivery in Pokhara",
        color: "from-red-500 to-red-600"
      },
      {
        icon: <Gift className="h-8 w-8" />,
        title: "Free Gifts",
        description: "Free accessories with every order",
        color: "from-pink-500 to-pink-600"
      },
      {
        icon: <Globe className="h-8 w-8" />,
        title: "Nationwide",
        description: "Delivery across all Nepal",
        color: "from-indigo-500 to-indigo-600"
      },
      {
        icon: <Heart className="h-8 w-8" />,
        title: "Quality Guarantee",
        description: "Premium quality footwear guarantee",
        color: "from-teal-500 to-teal-600"
      }
    ];
  
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ShoeMart?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We provide the best shopping experience with premium quality footwear and excellent customer service
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 p-6 border border-gray-100">
                <div className={`text-white mb-4 flex justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <div className="flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-900 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center text-sm leading-relaxed">{feature.description}</p>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
          
          {/* Additional Info */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                🎉 Special Offers for Our Customers
              </h3>
              <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                Join our loyalty program and get exclusive discounts, early access to new collections, and personalized recommendations.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="bg-white/25 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                  🎁 Free Gifts
                </span>
                <span className="bg-white/25 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                  💰 Loyalty Points
                </span>
                <span className="bg-white/25 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                  🚀 Early Access
                </span>
                <span className="bg-white/25 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                  📧 Exclusive Deals
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }