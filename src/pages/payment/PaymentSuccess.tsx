import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { checkKhaltiPaymentStatus } from '../../store/orderSlice';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const dispatch = useAppDispatch();
  const [paymentData, setPaymentData] = useState<{
    pidx: string | null;
    status: string | null;
    amount: number;
    transactionId: string | null;
    orderId: string | null;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Check URL parameters for payment details
    const urlParams = new URLSearchParams(window.location.search);
    const pidx = urlParams.get('pidx');
    const status = urlParams.get('status');
    const amount = urlParams.get('amount');
    const transactionId = urlParams.get('transaction_id');
    const orderId = urlParams.get('purchase_order_id');

    console.log('🎉 Payment Success Page - URL parameters detected:', {
      pidx,
      status,
      amount: amount ? (parseInt(amount) / 100) : 0,
      transactionId,
      orderId,
      fullUrl: window.location.href
    });

    if (pidx && status === 'Completed') {
      const paymentInfo = {
        pidx,
        status,
        amount: amount ? (parseInt(amount) / 100) : 0,
        transactionId,
        orderId
      };
      
      setPaymentData(paymentInfo);

      // Clean up URL parameters immediately
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      console.log('🧹 URL cleaned:', cleanUrl);

      // Store pidx in localStorage for verification
      localStorage.setItem('khalti_pidx', pidx);

      // Verify payment status
      console.log('🔍 Verifying payment with pidx:', pidx);
      dispatch(checkKhaltiPaymentStatus(pidx));

      // Start countdown for redirect
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setIsProcessing(false);
            console.log('🚀 Redirecting to orders page...');
            window.location.href = '/my-orders';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    } else {
      console.log('❌ Invalid payment data, redirecting to home');
      setIsProcessing(false);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {paymentData ? (
          <>
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful! 🎉
              </h1>
              <p className="text-gray-600 mb-4">
                Thank you for your purchase. We're verifying your payment...
              </p>
              
              {/* Payment Details */}
              <div className="bg-green-50 rounded-lg p-4 mb-4 text-left">
                <h3 className="font-semibold text-green-800 mb-2">Payment Details:</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Amount:</strong> Rs. {paymentData.amount.toLocaleString('en-IN')}</p>
                  <p><strong>Transaction ID:</strong> {paymentData.transactionId}</p>
                  <p><strong>Order ID:</strong> {paymentData.orderId}</p>
                </div>
              </div>
            </div>

            {isProcessing ? (
              <>
                <div className="flex items-center justify-center mb-6">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin mr-2" />
                  <span className="text-gray-700">Verifying payment...</span>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-700">
                    Redirecting to your orders page in <strong>{countdown}</strong> seconds...
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700">
                  ✅ Payment verified! Redirecting now...
                </p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.href = '/my-orders'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Orders Now
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Payment Data
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't process your payment information. Redirecting to home page...
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-gray-500 animate-spin mr-2" />
              <span className="text-gray-700">Redirecting...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
