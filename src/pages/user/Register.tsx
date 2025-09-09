
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { registerUser, verifyOtp, resendOtp } from "../../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, User, ArrowLeft, RefreshCw, ArrowRight, Zap, Shield, Truck, Eye, EyeOff } from "lucide-react";
import SimpleCountdown from "../../components/SimpleCountdown";

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [otpData, setOtpData] = useState({
    email: "",
    otp: "",
  });

  const handleRegisterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value,
    });
  };

  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOtpData({
      ...otpData,
      [name]: value,
    });
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!registerData.username.trim()) {
      toast.error("Please enter your username", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    if (!registerData.email.trim()) {
      toast.error("Please enter your email address", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    if (!registerData.password.trim()) {
      toast.error("Please enter your password", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    // Username validation
    if (registerData.username.length < 3) {
      toast.error("Username must be at least 3 characters long", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      toast.error("Please enter a valid email address", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    // Password validation
    if (registerData.password.length < 6) {
      toast.error("Password must be at least 6 characters long", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await dispatch(registerUser(registerData));
      setOtpData({ ...otpData, email: registerData.email });
      setStep('otp');
      setCountdown(60);
      toast.success("Registration successful! Please check your email for OTP.", {
        duration: 5000,
        position: "top-center",
        style: {
          background: "#10b981",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
    } catch {
      toast.error("Registration failed. Please try again.", {
        duration: 5000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!otpData.otp.trim()) {
      toast.error("Please enter the OTP", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    if (otpData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    // Check if OTP contains only numbers
    if (!/^\d{6}$/.test(otpData.otp)) {
      toast.error("OTP must contain only numbers", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await dispatch(verifyOtp(otpData));
      
      // Check if verification was successful
      if (result.type === 'auth/verifyOtp/fulfilled') {
        toast.success("Email verified successfully! You can now login.", {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#10b981",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: "8px",
          },
        });
        
        // Clear any pending registration data
        localStorage.removeItem("pendingRegistration");
        
        // Navigate to login page after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      
      // Handle specific error cases
      if (error?.message?.includes('Invalid OTP') || error?.message?.includes('OTP expired')) {
        toast.error("Invalid or expired OTP. Please try again or request a new one.", {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#dc2626",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: "8px",
          },
        });
      } else {
        toast.error("OTP verification failed. Please try again.", {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#dc2626",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: "8px",
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) {
      toast.error(`Please wait ${countdown} seconds before requesting a new OTP`, {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#f59e0b",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }
    
    if (!otpData.email.trim()) {
      toast.error("Email address is required to resend OTP", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await dispatch(resendOtp({ email: otpData.email }));
      
      if (result.type === 'auth/resendOtp/fulfilled') {
        setCountdown(60);
        toast.success("New OTP sent to your email!", {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#10b981",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: "8px",
          },
        });
      } else {
        throw new Error("Failed to resend OTP");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      toast.error(error?.message || "Failed to resend OTP. Please try again.", {
        duration: 5000,
        position: "top-center",
        style: {
          background: "#dc2626",
          color: "#ffffff",
          padding: "12px 16px",
          borderRadius: "8px",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown completion handler
  const handleCountdownComplete = () => {
    setCountdown(0);
  };

  // Check for pending registration on component mount
  useEffect(() => {
    const pendingRegistration = localStorage.getItem("pendingRegistration");
    if (pendingRegistration) {
      const data = JSON.parse(pendingRegistration);
      setOtpData({ email: data.email, otp: "" });
      setStep('otp');
      setCountdown(60);
    }
  }, []);

  if (step === 'otp') {
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
                Verify Your Email.
                <br />
                <span className="text-yellow-400">Complete Setup.</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                We've sent a verification code to your email. Enter it below to complete your account setup and start shopping.
              </p>
              
              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-gray-300">Secure Email Verification</span>
                </div>
                <div className="flex items-center">
                  <Truck className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-gray-300">Quick Account Setup</span>
                </div>
                <div className="flex items-center">
                  <Zap className="w-5 h-5 text-yellow-400 mr-3" />
                  <span className="text-gray-300">Instant Access to Shopping</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - OTP Form */}
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

            {/* OTP Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Verify Your Email
                </h2>
                <p className="text-gray-300">
                  We've sent a verification code to <strong className="text-yellow-400">{otpData.email}</strong>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                    Enter OTP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      maxLength={6}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                      placeholder="Enter 6-digit OTP"
                      value={otpData.otp}
                      onChange={handleOtpChange}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('register')}
                    className="flex items-center text-sm text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Register
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || isLoading}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      countdown > 0 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300 hover:border-yellow-400'
                    }`}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {countdown > 0 ? (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                        <span>Resend in</span>
                        <SimpleCountdown
                          initialSeconds={countdown}
                          onComplete={handleCountdownComplete}
                          className="text-gray-400"
                        />
                      </span>
                    ) : (
                      'Resend OTP'
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpData.otp.length !== 6}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold py-4 px-6 rounded-xl hover:from-yellow-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Verify OTP
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </div>
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-300">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-200"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Join the Style.
              <br />
              <span className="text-yellow-400">Sign Up.</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Create your ShoeMart account and unlock exclusive access to premium shoes, personalized recommendations, and member-only benefits.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-gray-300">Secure & Fast Registration</span>
              </div>
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-blue-400 mr-3" />
                <span className="text-gray-300">Exclusive Member Benefits</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-yellow-400 mr-3" />
                <span className="text-gray-300">Personalized Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
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

          {/* Register Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Create Account
              </h2>
              <p className="text-gray-300">
                Join ShoeMart and start shopping for amazing shoes!
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                  />
                </div>
              </div>

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
                    value={registerData.email}
                    onChange={handleRegisterChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password (min 6 characters)"
                    value={registerData.password}
                    onChange={handleRegisterChange}
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold py-4 px-6 rounded-xl hover:from-yellow-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </div>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-300">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-3 text-sm">Registration Instructions</h3>
            <ul className="text-xs text-gray-300 space-y-1">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                All fields are required for account creation
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                Password must be at least 6 characters long
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                You'll receive an OTP via email to verify your account
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
