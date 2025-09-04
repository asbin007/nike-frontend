import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAllReviews } from '../store/reviewSlice';
import { Star } from 'lucide-react';

export default function RealTimeReviews() {
  const dispatch = useAppDispatch();
  const { review, status } = useAppSelector((state) => state.reviews);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    // Fetch all reviews when component mounts
    dispatch(fetchAllReviews());
  }, [dispatch]);

  useEffect(() => {
    // Update total reviews count when reviews are fetched
    if (review.length > 0) {
      setTotalReviews(review.length);
    }
  }, [review]);

  useEffect(() => {
    // Auto-rotate reviews every 4 seconds if we have multiple reviews
    if (review.length > 1) {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % review.length);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [review.length]);

  // If no reviews yet, show loading
  if (status === 'loading' && review.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="flex items-center mb-4">
          <div className="flex space-x-1 mr-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex items-center mt-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  // If no reviews found
  if (review.length === 0 && status === 'success') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <div className="text-gray-500 mb-4">
          <Star className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-lg font-medium">No reviews yet</p>
          <p className="text-sm">Be the first to leave a review!</p>
        </div>
      </div>
    );
  }

  const currentReview = review[currentReviewIndex];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative overflow-hidden">
      {/* Live indicator */}
      <div className="absolute top-3 right-3 flex items-center space-x-1">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-red-500 font-medium">LIVE</span>
        <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Real-time counter */}
      <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md border border-blue-700">
        {totalReviews} reviews
      </div>

      {/* Review content with fade transition */}
      <div className="transition-all duration-500 ease-in-out">
        <div className="flex items-center mb-4">
          <div className="flex space-x-1 mr-3">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < (currentReview?.rating || 5) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">{currentReview?.rating || 5}.0</span>
        </div>
        
        <p className="text-gray-700 mb-4 italic">"{currentReview?.comment || 'Loading review...'}"</p>
        
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">
              {currentReview?.User?.username?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {currentReview?.User?.username || 'Anonymous'}
            </p>
            <p className="text-sm text-gray-500">
              {currentReview?.createdAt 
                ? new Date(currentReview.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'Just now'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Review navigation dots */}
      {review.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {review.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentReviewIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentReviewIndex 
                  ? 'bg-blue-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Refresh button */}
      <button
        onClick={() => dispatch(fetchAllReviews())}
        className="absolute bottom-3 right-3 text-xs text-gray-400 hover:text-blue-500 transition-colors"
        title="Refresh reviews"
      >
        ↻ Refresh
      </button>
    </div>
  );
}
