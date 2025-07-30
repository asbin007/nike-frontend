
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { registerUser, verifyOtp, resendOtp } from "../../store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, User, ArrowLeft, RefreshCw } from "lucide-react";

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
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
    setIsLoading(true);
    
    try {
      await dispatch(registerUser(registerData));
      setOtpData({ ...otpData, email: registerData.email });
      setStep('otp');
      setCountdown(60); // Start 60 second countdown
      toast.success("Registration successful! Please check your email for OTP.");
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await dispatch(verifyOtp(otpData));
      toast.success("OTP verified successfully! You can now login.");
      navigate("/login");
    } catch {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    try {
      await dispatch(resendOtp({ email: otpData.email }));
      setCountdown(60);
      toast.success("New OTP sent to your email!");
    } catch {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verify Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a verification code to <strong>{otpData.email}</strong>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter 6-digit OTP"
                    value={otpData.otp}
                    onChange={handleOtpChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('register')}
                className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Register
              </button>
              
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || isLoading}
                className={`flex items-center text-sm ${
                  countdown > 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-indigo-600 hover:text-indigo-500'
                }`}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || otpData.otp.length !== 6}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join ShoeMart and start shopping for amazing shoes!
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password (min 6 characters)"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>

        {/* Instructions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Registration Instructions</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              All fields are required for account creation
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              Password must be at least 6 characters long
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              You'll receive an OTP via email to verify your account
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">•</span>
              Please use appropriate language in your username
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;
