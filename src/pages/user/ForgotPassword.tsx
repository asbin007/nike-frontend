import { ChangeEvent, FormEvent, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { forgotPassword } from "../../store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Lock, CheckCircle, ArrowRight, Zap, Shield, Truck } from "lucide-react";

const ForgotPassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    try {
      await dispatch(forgotPassword({ email: email.trim() }));
      setOtpSent(true);
      toast.success("Password reset OTP sent to your email!");
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate("/reset-password", { 
          state: { email },
          replace: true // Replace current history entry
        });
      }, 1500);
    } catch {
      toast.error("Failed to send reset OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
              Reset Your Password.
              <br />
              <span className="text-yellow-400">Stay Secure.</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Don't worry! We'll help you reset your password securely. Enter your email and we'll send you a verification code.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-gray-300">Secure Password Reset</span>
              </div>
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-blue-400 mr-3" />
                <span className="text-gray-300">Quick Email Verification</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-yellow-400 mr-3" />
                <span className="text-gray-300">Instant Access Recovery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
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

          {/* Forgot Password Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-300">
                No worries! Enter your email address and we'll send you a reset OTP.
              </p>
            </div>

            {otpSent ? (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 text-center">
                <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  OTP Sent Successfully!
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  We've sent a 6-digit OTP to <strong className="text-yellow-400">{email}</strong>
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Redirecting to reset password page...
                </p>
                <button
                  onClick={() => navigate("/reset-password", { 
                    state: { email },
                    replace: true 
                  })}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold py-3 px-4 rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all duration-200 transform hover:scale-105"
                >
                  Continue to Reset Password
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold py-4 px-6 rounded-xl hover:from-yellow-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Send Reset OTP
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </div>
                  )}
                </button>
              </form>
            )}

            {/* Back to Login Link */}
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-3 text-sm">How it works</h3>
            <ul className="text-xs text-gray-300 space-y-1">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                Enter your registered email address
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                We'll send a 6-digit OTP to your email
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                Use the OTP to reset your password
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                OTP expires in 10 minutes for security
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
