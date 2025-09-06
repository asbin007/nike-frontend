
import { Link } from "react-router-dom";
import { IProduct } from "../../../globals/types/types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { addToWishlist, removeFromWishlist } from "../../../store/wishlistSlice";
import { addToComparison, removeFromComparison } from "../../../store/comparisonSlice";
import { Heart, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import { ProductCardSkeleton } from "../../../components/SkeletonLoader";

// Redefine ICardProps to override images type
interface ICardProps {
  product: Omit<IProduct, "images"> & { images: string[] }; // Override images to string[]
  showActions?: boolean; // show wishlist/comparison buttons
}
const CLOUDINARY_VERSION = "v1750340657"; 

const ProductCard: React.FC<ICardProps> = ({ product, showActions = true }) => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((store) => !!store.auth.user.token || !!localStorage.getItem("tokenauth"));
  const { items: wishlistItems } = useAppSelector((store) => store.wishlist);
  const { products: comparisonProducts, maxProducts } = useAppSelector((store) => store.comparison);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast.error("Please log in to add to wishlist");
      return;
    }

    const isInWishlist = wishlistItems.some(item => item.id === product.id);

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
      toast.success("Removed from wishlist");
    } else {
      const wishlistItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ? `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${product.images[0].replace("/uploads", "")}.jpg` : "",
        rating: 4.5, // Default rating
        reviews: 0, // Default reviews
        inStock: (product.totalStock && product.totalStock > 0) || product.isStock || false,
        totalStock: product.totalStock,
        category: product.Category?.categoryName,
        brand: product.brand,
      };
      dispatch(addToWishlist(wishlistItem));
      toast.success("Added to wishlist");
    }
  };

  const handleComparisonToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    const isInComparison = comparisonProducts.some(item => item.id === product.id);

    if (isInComparison) {
      dispatch(removeFromComparison(product.id));
      toast.success("Removed from comparison");
    } else {
      if (comparisonProducts.length >= maxProducts) {
        toast.error(`You can only compare up to ${maxProducts} products`);
        return;
      }
      
      const comparisonItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ? `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${product.images[0].replace("/uploads", "")}.jpg` : "",
        brand: product.brand,
        category: product.Category?.categoryName || "",
        description: product.description?.[0] || product.description || "Premium quality shoes designed for comfort and style",
        inStock: (product.totalStock && product.totalStock > 0) || product.isStock || false,
        totalStock: product.totalStock || 0,

        color: Array.isArray(product.colors) ? product.colors : (product.colors ? [product.colors] : []),
        size: Array.isArray(product.sizes) ? product.sizes : (product.sizes ? [product.sizes] : []),
        isNew: product.isNew,
        rating: 4.5,
        reviewCount: 0,
      };
      dispatch(addToComparison(comparisonItem));
      toast.success("Added to comparison");
    }
  };
  const imageUrl =
  product.images && product.images[1]
    ? `https://res.cloudinary.com/dxpe7jikz/image/upload/${CLOUDINARY_VERSION}${product.images[0].replace(
        "/uploads",
        ""
      )}.jpg`
    : "https://via.placeholder.com/300x300?text=No+Image";

  // Show skeleton while loading
  if (!product || !product.name) {
    return <ProductCardSkeleton />;
  }

  // Determine the image URL
  const brandSlug = (product.brand || '').toLowerCase();
  return (
    <Link to={`/men/${brandSlug}/${product.id}`}>
      <div className="group relative bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300 h-full flex flex-col">
        {/* Badges */}
        <div className="absolute top-3 left-3 flex space-x-2 z-10">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              New
            </span>
          )}
          {product.discount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2">
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full transition-all duration-200 ${
                wishlistItems.some(item => item.id === product.id)
                  ? 'bg-red-100 text-red-500 hover:bg-red-200'
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
              }`}
              title={wishlistItems.some(item => item.id === product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart 
                className="w-4 h-4" 
                fill={wishlistItems.some(item => item.id === product.id) ? 'currentColor' : 'none'}
              />
            </button>
            
            {/* Comparison Button */}
            <button
              onClick={handleComparisonToggle}
              className={`p-2 rounded-full transition-all duration-200 ${
                comparisonProducts.some(item => item.id === product.id)
                  ? 'bg-blue-100 text-blue-500 hover:bg-blue-200'
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:text-blue-500'
              }`}
              title={comparisonProducts.some(item => item.id === product.id) ? 'Remove from comparison' : 'Add to comparison'}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Product Image */}
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={product?.name}
            className="w-full h-full object-cover rounded"
          />
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg line-clamp-2 leading-tight">{product.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{product.brand}</p>
            </div>
            <span className="text-sm bg-gray-200 px-2 py-1 rounded flex-shrink-0 ml-2">
              {product.Category?.categoryName}
            </span>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="font-bold text-indigo-600">
                Rs{product.price.toFixed(2)}
              </span>
              {product.discount && (
                <span className="text-gray-400 text-sm line-through ml-2">
                  Rs{((product.price * 100) / (100 - product.discount)).toFixed(2)}
                </span>
              )}
            </div>
            <button className="text-indigo-600 hover:text-indigo-800 font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
