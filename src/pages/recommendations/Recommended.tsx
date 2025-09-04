import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchRecommendations } from '../../store/recommendationsSlice';
import ProductRecommendations from '../../components/ProductRecommendations';

const Recommended: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    personalizedRecommendations, 
    trendingProducts, 
    status 
  } = useAppSelector((store) => store.recommendations);

  useEffect(() => {
    if (status === 'idle') {
    dispatch(fetchRecommendations());
    }
  }, [dispatch, status]);

  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Recommended for You
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover shoes tailored to your preferences. Our AI-powered recommendations 
            help you find the perfect pair based on your style and needs.
          </p>
        </div>

        {/* Personalized Recommendations */}
        <div className="mb-16">
          <ProductRecommendations
            title="Personalized Recommendations"
            products={personalizedRecommendations}
            type="personalized"
            loading={isLoading}
            className="mb-8"
          />
          </div>

        {/* Trending Products */}
        <div className="mb-16">
          <ProductRecommendations
            title="Trending Now"
            products={trendingProducts}
            type="trending"
            loading={isLoading}
            className="mb-8"
          />
        </div>

        {/* Why These Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Why These Recommendations?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Algorithm</h3>
              <p className="text-gray-600">
                Our recommendation engine analyzes your preferences, browsing history, 
                and popular trends to suggest the best shoes for you.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                  </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Recommendations are updated in real-time based on new arrivals, 
                trending styles, and seasonal preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Experience</h3>
              <p className="text-gray-600">
                Each recommendation is tailored to your unique style preferences, 
                size, and budget to ensure the perfect fit.
              </p>
            </div>
          </div>
                </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Browse our complete collection or use our advanced filters to find exactly what you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Browse All Products
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommended;