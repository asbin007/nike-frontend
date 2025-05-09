import { Link } from "react-router-dom";
import { IProduct } from "../../../globals/types/types";

interface ICardProps {
  product: IProduct;
}

const ProductCard: React.FC<ICardProps> = ({ product }) => {
  // Determine the image URL
  const imageUrl =
    product.images.includes('cloudinary.com')
      ? product.images
      : `http://localhost:5001/${product.images}`;

  return (
    <Link to={`/men/${product.brand}/${product.id}`}>
      <div className="group relative bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-300">
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

        {/* Product Image */}
        <div className="h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-gray-500 text-sm">{product.brand}</p>
            </div>
            <span className="text-sm bg-gray-200 px-2 py-1 rounded">
              {product.Category?.categoryName}
            </span>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>
              <span className="font-bold text-indigo-600">
                ${product.price.toFixed(2)}
              </span>
              {product.discount && (
                <span className="text-gray-400 text-sm line-through ml-2">
                  ${((product.price * 100) / (100 - product.discount)).toFixed(2)}
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
