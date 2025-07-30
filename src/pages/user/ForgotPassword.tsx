import { ChangeEvent, FormEvent, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { forgotPassword } from "../../store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Lock, CheckCircle } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries! Enter your email address and we'll send you a reset OTP.
          </p>
        </div>

        {otpSent ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              OTP Sent Successfully!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Redirecting to reset password page...
            </p>
            <button
              onClick={() => navigate("/reset-password", { 
                state: { email },
                replace: true 
              })}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Continue to Reset Password
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  'Send Reset OTP'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* Instructions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">How it works</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              Enter your registered email address
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              We'll send a 6-digit OTP to your email
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              Use the OTP to reset your password
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              OTP expires in 10 minutes for security
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
