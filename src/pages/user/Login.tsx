import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginUser } from "../../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { Status } from "../../globals/types/types";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Zap, Shield, Truck } from "lucide-react";

const Login = () => {
  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((store) => store.auth);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await dispatch(loginUser(data));
    } catch {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful login
  useEffect(() => {
    if (status === Status.SUCCESS && user?.token && data.email && data.password) {
      toast.success("Login successful! Welcome back!");
      navigate("/");
    }
  }, [status, user, navigate, data.email, data.password]);

  return (
         <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10"></div>
                 <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center"></div>
        <div className="relative z-20 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
                             <h1 className="text-3xl font-bold">SHOEMART</h1>
            </div>
                         <h2 className="text-5xl font-bold mb-6 leading-tight">
               Step Into Style.
               <br />
               <span className="text-yellow-400">Sign In.</span>
             </h2>
             <p className="text-lg text-gray-300 mb-8">
               Access your exclusive shoe collection. Get personalized recommendations, track your orders, and enjoy premium shopping experience.
             </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-gray-300">Secure & Fast Checkout</span>
              </div>
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-blue-400 mr-3" />
                <span className="text-gray-300">Free Shipping on Orders</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-yellow-400 mr-3" />
                <span className="text-gray-300">Exclusive Member Benefits</span>
              </div>
            </div>
          </div>
        </div>
      </div>

             {/* Right Side - Login Form */}
       <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
                     {/* Mobile Logo */}
           <div className="lg:hidden text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
                             <h1 className="text-2xl font-bold text-white">SHOEMART</h1>
            </div>
          </div>

                     {/* Login Form */}
           <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h2>
                             <p className="text-gray-300">
                 Sign in to your ShoeMart account
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    value={data.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    value={data.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !data.email || !data.password}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold py-4 px-6 rounded-xl hover:from-yellow-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                )}
              </button>
            </form>

            

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-300">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-200"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
