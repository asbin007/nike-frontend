import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { CheckCircle, Truck, Clock, MapPin } from 'lucide-react';

const CODSuccess: React.FC = () => {
  const { items } = useAppSelector((store) => store.orders);
  const [orderData, setOrderData] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get the most recent order from the store
    if (items && items.length > 0) {
      const latestOrder = items[items.length - 1];
      setOrderData(latestOrder);
      console.log('🎉 COD Success Page - Order data:', latestOrder);
    }

    // Start countdown for redirect
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          window.location.href = '/my-orders';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [items]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Placed Successfully! 🎉
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. Pay when your items arrive.
          </p>
        </div>

        {/* Order Details */}
        {orderData && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4 text-left">
            <h3 className="font-semibold text-blue-800 mb-2">Order Details:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Order ID:</strong> {orderData.id}</p>
              <p><strong>Total Amount:</strong> Rs. {orderData.totalPrice?.toLocaleString('en-IN') || 'N/A'}</p>
              <p><strong>Payment Method:</strong> Cash on Delivery</p>
              <p><strong>Status:</strong> {orderData.orderStatus || 'Pending'}</p>
            </div>
          </div>
        )}

        {/* COD Information */}
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Truck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h4 className="font-semibold text-green-800 mb-2">Cash on Delivery</h4>
              <div className="text-sm text-green-700 space-y-1">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Delivery within 3-5 business days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Payment collected at delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            Redirecting to your orders page in <strong>{countdown}</strong> seconds...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.href = '/my-orders'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Orders
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        {/* Additional Information */}
        <div className="mt-6 text-xs text-gray-500">
          <p>You will receive an email confirmation shortly.</p>
          <p>Track your order in the "My Orders" section.</p>
        </div>
      </div>
    </div>
  );
};

export default CODSuccess;
