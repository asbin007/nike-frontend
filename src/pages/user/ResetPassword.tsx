
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useAppDispatch } from "../../store/hooks";
import { resetPassword } from "../../store/authSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Mail, Eye, EyeOff, ArrowLeft, CheckCircle, ArrowRight, Zap, Shield, Truck } from "lucide-react";

const ResetPassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  
  const [data, setData] = useState({
    email: location.state?.email || "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });

  // Check if user came from forgot password page
  useEffect(() => {
    if (!location.state?.email) {
      toast.error("Please request password reset from the forgot password page");
      navigate("/forgot-password");
    }
  }, [location.state?.email, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For OTP field, only allow numbers and max 6 digits
    if (name === "otp") {
      const numericValue = value.replace(/\D/g, "").slice(0, 6);
      setData({
        ...data,
        [name]: numericValue,
      });
    } else {
      setData({
        ...data,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!data.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!data.otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    if (data.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!data.newPassword.trim()) {
      toast.error("Please enter a new password");
      return;
    }

    if (data.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      await dispatch(resetPassword(data));
      setPasswordReset(true);
      toast.success("Password reset successfully! You can now login.");
      // Navigate after showing success message
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch {
      toast.error("Failed to reset password. Please try again.");
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
              Set New Password.
              <br />
              <span className="text-yellow-400">Stay Secure.</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Enter your new password and the OTP sent to your email. Choose a strong password to keep your account secure.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-gray-300">Secure Password Reset</span>
              </div>
              <div className="flex items-center">
                <Truck className="w-5 h-5 text-blue-400 mr-3" />
                <span className="text-gray-300">Quick Account Recovery</span>
              </div>
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-yellow-400 mr-3" />
                <span className="text-gray-300">Instant Access Restoration</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
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

          {/* Reset Password Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Reset Password
              </h2>
              <p className="text-gray-300">
                Enter your new password and the OTP sent to your email
              </p>
            </div>

            {passwordReset ? (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 text-center">
                <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Password Reset Successful!
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  Your password has been updated successfully.
                </p>
                <p className="text-xs text-gray-400">
                  Redirecting to login page...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {/* Email - Read Only */}
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
                        readOnly
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 cursor-not-allowed"
                        placeholder="Enter your email address"
                        value={data.email}
                      />
                    </div>
                  </div>

                  {/* OTP */}
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                      OTP Code
                    </label>
                    <div className="relative">
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        maxLength={6}
                        required
                        disabled={isLoading}
                        className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 text-center tracking-widest font-mono text-lg"
                        placeholder="Enter 6-digit OTP"
                        value={data.otp}
                        onChange={handleChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Enter the 6-digit code sent to your email
                    </p>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        disabled={isLoading}
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                        placeholder="Enter new password (min 6 characters)"
                        value={data.newPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        disabled={isLoading}
                        className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
                        placeholder="Confirm new password"
                        value={data.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !data.email || !data.otp || !data.newPassword || !data.confirmPassword}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold py-4 px-6 rounded-xl hover:from-yellow-300 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Resetting Password...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Reset Password
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
            <h3 className="font-semibold text-white mb-3 text-sm">Password Requirements</h3>
            <ul className="text-xs text-gray-300 space-y-1">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                Password must be at least 6 characters long
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                Both passwords must match exactly
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                OTP must be exactly 6 digits
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                OTP expires in 10 minutes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
