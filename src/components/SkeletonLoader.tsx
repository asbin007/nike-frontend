import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

// Basic skeleton element
const Skeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  width = "w-full", 
  height = "h-4", 
  rounded = "rounded" 
}) => (
  <div className={`animate-pulse bg-gray-200 ${width} ${height} ${rounded} ${className}`}></div>
);

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden">
    {/* Image Skeleton */}
    <div className="relative h-48 overflow-hidden">
      <Skeleton className="w-full h-full" rounded="rounded-none" />
      {/* Badge Skeletons */}
      <div className="absolute top-3 left-3 flex space-x-2">
        <Skeleton width="w-12" height="h-6" rounded="rounded-md" />
        <Skeleton width="w-16" height="h-6" rounded="rounded-md" />
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="p-6">
      {/* Title Skeleton */}
      <div className="mb-3">
        <Skeleton width="w-3/4" height="h-5" className="mb-2" />
        <Skeleton width="w-1/2" height="h-4" />
      </div>

      {/* Rating Skeleton */}
      <div className="flex items-center mb-3">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} width="w-4" height="h-4" rounded="rounded" />
          ))}
        </div>
        <Skeleton width="w-8" height="h-4" className="ml-2" />
      </div>

      {/* Price Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton width="w-20" height="h-6" />
        <Skeleton width="w-16" height="h-4" />
      </div>

      {/* Button Skeleton */}
      <div className="flex space-x-2">
        <Skeleton width="w-full" height="h-10" rounded="rounded-lg" />
        <Skeleton width="w-10" height="h-10" rounded="rounded-lg" />
      </div>
    </div>
  </div>
);

// Product Grid Skeleton
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(count)].map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// Hero Section Skeleton
export const HeroSkeleton: React.FC = () => (
  <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Content Skeleton */}
        <div className="text-center lg:text-left">
          <Skeleton width="w-64" height="h-12" className="mx-auto lg:mx-0 mb-4" />
          <Skeleton width="w-96" height="h-6" className="mx-auto lg:mx-0 mb-6" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Skeleton width="w-48" height="h-12" rounded="rounded-lg" />
            <Skeleton width="w-40" height="h-12" rounded="rounded-lg" />
          </div>
        </div>
        
        {/* Image Skeleton */}
        <div className="relative">
          <Skeleton width="w-full" height="h-96" rounded="rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

// Product Detail Skeleton
export const ProductDetailSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Images Skeleton */}
      <div className="space-y-4">
        <Skeleton width="w-full" height="h-96" rounded="rounded-lg" />
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} width="w-16" height="h-16" rounded="rounded-md" />
          ))}
        </div>
      </div>

      {/* Details Skeleton */}
      <div className="space-y-6">
        <Skeleton width="w-20" height="h-6" rounded="rounded-full" />
        <Skeleton width="w-3/4" height="h-8" />
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} width="w-5" height="h-5" rounded="rounded" />
          ))}
        </div>
        <Skeleton width="w-32" height="h-8" />
        <Skeleton width="w-24" height="h-4" />
        
        {/* Size Selection */}
        <div>
          <Skeleton width="w-24" height="h-5" className="mb-2" />
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} width="w-16" height="h-10" rounded="rounded-md" />
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <Skeleton width="w-24" height="h-5" className="mb-2" />
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} width="w-16" height="h-10" rounded="rounded-md" />
            ))}
          </div>
        </div>

        <Skeleton width="w-full" height="h-12" rounded="rounded-md" />
        <Skeleton width="w-full" height="h-20" />
      </div>
    </div>
  </div>
);

// Cart Item Skeleton
export const CartItemSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
    <Skeleton width="w-20" height="h-20" rounded="rounded-lg" />
    <div className="flex-1">
      <Skeleton width="w-3/4" height="h-5" className="mb-2" />
      <Skeleton width="w-1/2" height="h-4" className="mb-2" />
      <Skeleton width="w-24" height="h-6" />
    </div>
    <div className="flex items-center space-x-2">
      <Skeleton width="w-8" height="h-8" rounded="rounded" />
      <Skeleton width="w-12" height="h-8" />
      <Skeleton width="w-8" height="h-8" rounded="rounded" />
    </div>
    <Skeleton width="w-20" height="h-6" />
    <Skeleton width="w-6" height="h-6" rounded="rounded" />
  </div>
);

// Cart Skeleton
export const CartSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <Skeleton width="w-48" height="h-8" className="mb-8" />
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <CartItemSkeleton key={i} />
      ))}
    </div>
    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
      <Skeleton width="w-32" height="h-6" className="mb-4" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton width="w-24" height="h-4" />
          <Skeleton width="w-20" height="h-4" />
        </div>
        <div className="flex justify-between">
          <Skeleton width="w-20" height="h-4" />
          <Skeleton width="w-16" height="h-4" />
        </div>
        <div className="flex justify-between">
          <Skeleton width="w-16" height="h-4" />
          <Skeleton width="w-12" height="h-4" />
        </div>
      </div>
      <Skeleton width="w-full" height="h-12" rounded="rounded-lg" className="mt-6" />
    </div>
  </div>
);

// Order Skeleton
export const OrderSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <Skeleton width="w-48" height="h-8" className="mb-8" />
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <Skeleton width="w-32" height="h-6" />
            <Skeleton width="w-20" height="h-6" rounded="rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton width="w-48" height="h-4" />
            <Skeleton width="w-40" height="h-4" />
            <Skeleton width="w-36" height="h-4" />
          </div>
          <div className="flex justify-between items-center mt-4">
            <Skeleton width="w-24" height="h-6" />
            <Skeleton width="w-20" height="h-8" rounded="rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Wishlist Skeleton
export const WishlistSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <Skeleton width="w-48" height="h-8" className="mb-8" />
    <ProductGridSkeleton count={8} />
  </div>
);

// Comparison Skeleton
export const ComparisonSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="container mx-auto px-4">
      <Skeleton width="w-64" height="h-8" className="mx-auto mb-4" />
      <Skeleton width="w-96" height="h-6" className="mx-auto mb-12" />
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left w-48">
                  <Skeleton width="w-32" height="h-6" />
                </th>
                {[...Array(4)].map((_, i) => (
                  <th key={i} className="px-6 py-4 text-center w-64">
                    <div className="relative">
                      <Skeleton width="w-32" height="h-32" rounded="rounded-lg" className="mx-auto mb-4" />
                      <Skeleton width="w-48" height="h-5" className="mb-2" />
                      <div className="flex justify-center space-x-2">
                        <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
                        <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
                        <Skeleton width="w-8" height="h-8" rounded="rounded-full" />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(8)].map((_, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4">
                    <Skeleton width="w-32" height="h-5" />
                  </td>
                  {[...Array(4)].map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-center">
                      <Skeleton width="w-24" height="h-4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

// Search Results Skeleton
export const SearchResultsSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Skeleton */}
      <div className="lg:w-1/4">
        <Skeleton width="w-32" height="h-6" className="mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <Skeleton width="w-24" height="h-5" className="mb-2" />
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} width="w-full" height="h-4" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="lg:w-3/4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton width="w-32" height="h-6" />
          <Skeleton width="w-24" height="h-8" rounded="rounded-lg" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  </div>
);

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton width="w-16" height="h-16" rounded="rounded-full" />
        <div>
          <Skeleton width="w-32" height="h-6" className="mb-2" />
          <Skeleton width="w-48" height="h-4" />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i}>
            <Skeleton width="w-24" height="h-5" className="mb-2" />
            <Skeleton width="w-full" height="h-10" rounded="rounded-md" />
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <Skeleton width="w-32" height="h-10" rounded="rounded-lg" />
      </div>
    </div>
  </div>
);

// Generic Loading Spinner
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600`}></div>
    </div>
  );
};

// Page Loading Skeleton
export const PageLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header Skeleton */}
    <div className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Skeleton width="w-32" height="h-8" />
          <div className="flex items-center space-x-4">
            <Skeleton width="w-64" height="h-10" rounded="rounded-lg" />
            <Skeleton width="w-10" height="h-10" rounded="rounded-full" />
            <Skeleton width="w-10" height="h-10" rounded="rounded-full" />
            <Skeleton width="w-10" height="h-10" rounded="rounded-full" />
          </div>
        </div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="container mx-auto px-4 py-8">
      <Skeleton width="w-48" height="h-8" className="mb-8" />
      <ProductGridSkeleton count={8} />
    </div>
  </div>
);

export default Skeleton; 