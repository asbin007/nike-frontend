
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchProduct, fetchProducts } from "../../store/productSlice";
import { addToCart } from "../../store/cartSlice";
import Review from "./Review";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { product } = useAppSelector((store) => store.products);
  const { review } = useAppSelector((store) => store.reviews);

  const isLoggedIn = useAppSelector(
    (store) => !!store.auth.user.token || !!localStorage.getItem("tokenauth")
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      dispatch(fetchProducts());
      dispatch(fetchProduct(id));
    }
  }, [dispatch, id]);

  // Set initial selected image when product loads
  useEffect(() => {
    if (product?.images && Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === "string") {
      setSelectedImage(
        `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${product.images[0].replace(
          "/uploads",
          ""
        )}.jpg`
      );
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      alert("Please log in to add to cart");
      return;
    }

    if (!product?.id || !selectedSize || !selectedColor) {
      alert("Please select a size and color before adding to cart.");
      return;
    } else {
      await dispatch(addToCart(product.id, selectedSize, selectedColor));
      navigate("/");
    }
  };

  // Calculate average rating from reviews
  const averageRating = review.length > 0
    ? review.reduce((sum, r) => sum + (r.rating ?? 0), 0) / review.length
    : 0;
  const roundedRating = Math.round(averageRating);

  const availableSizes =
    product?.sizes && product.sizes.length > 0
      ? product.sizes
      : ["No sizes available"];
  const availableColors =
    product && (product.colors ?? []).length > 0
      ? product.colors
      : ["No colors available"];

  // Create array of images for multiple image functionality (show 3 images)
  const productImages: string[] = Array.isArray(product?.images) 
    ? product.images.slice(0, 3).filter((img): img is string => typeof img === 'string')
    : [];

  // Navigation functions
  const nextImage = () => {
    if (productImages.length > 1) {
      const nextIndex = (currentImageIndex + 1) % productImages.length;
      setCurrentImageIndex(nextIndex);
      setSelectedImage(
        `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${productImages[nextIndex].replace(
          "/uploads",
          ""
        )}.jpg`
      );
    }
  };

  const prevImage = () => {
    if (productImages.length > 1) {
      const prevIndex = currentImageIndex === 0 ? productImages.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setSelectedImage(
        `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${productImages[prevIndex].replace(
          "/uploads",
          ""
        )}.jpg`
      );
    }
  };

  const handleImageClick = (image: string, index: number) => {
    setSelectedImage(
      `https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${image.replace(
        "/uploads",
        ""
      )}.jpg`
    );
    setCurrentImageIndex(index);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    setZoomLevel(isZoomed ? 1 : 2);
  };

  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(zoomLevel + 0.5);
      setIsZoomed(true);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(zoomLevel - 0.5);
      if (zoomLevel <= 1.5) {
        setIsZoomed(false);
      }
    }
  };

  return (
    <>
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-indigo-600">
              Home
            </Link>{" "}
            /{" "}
            <Link to="/men" className="hover:text-indigo-600">
              Men
            </Link>{" "}
            /
            <Link to="/men/sneakers" className="hover:text-indigo-600">
              Sneakers
            </Link>{" "}
            / <span className="text-gray-800 font-medium">{product?.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              {/* Main Image with Zoom and Slider */}
              <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100">
                <img
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
                  }`}
                  src={selectedImage}
                  alt="Product Image"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center',
                  }}
                  onClick={toggleZoom}
                />
                
                {/* Zoom Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={handleZoomIn}
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Slider Navigation */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                      title="Previous Image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                      title="Next Image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {productImages.length}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {productImages.length > 0 && (
                <div className="flex gap-4 justify-center">
                  {productImages.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleImageClick(image, idx)}
                      className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                        currentImageIndex === idx
                          ? "border-indigo-600 shadow-lg"
                          : "border-gray-300 hover:border-indigo-400"
                      }`}
                      type="button"
                    >
                      <img
                        src={`https://res.cloudinary.com/dxpe7jikz/image/upload/v1750340657${image.replace(
                          "/uploads",
                          ""
                        )}.jpg`}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {product?.name}
                  </h1>
                  <p className="text-gray-600 font-bold">{product?.brand}</p>
                  <p className="text-gray-600">
                    {product?.Collection?.collectionName}
                  </p>
                </div>
                {product?.isNew && (
                  <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    New
                  </span>
                )}
              </div>

              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < roundedRating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-gray-600 text-sm">
                  {averageRating.toFixed(1)} ({review.length} {review.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-indigo-600 mr-3">
                    Rs{product?.price?.toFixed(2)}
                  </span>
                  {(product?.discount ?? 0) > 0 && (
                    <>
                      <span className="text-gray-400 line-through mr-2">
                        ${product?.originalPrice?.toFixed(2)}
                      </span>
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded">
                        Save {product?.discount ?? 0}%
                      </span>
                    </>
                  )}
                </div>
                {(product?.totalStock ?? 0) > 0 ? (
                  <span className="text-green-600 text-sm">In Stock</span>
                ) : (
                  <span className="text-red-600 text-sm">Out of Stock</span>
                )}
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-2">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        size !== "No sizes available" && setSelectedSize(size)
                      }
                      className={`px-4 py-2 border rounded-md ${
                        selectedSize === size
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white border-gray-300 hover:border-indigo-600"
                      } ${
                        size === "No sizes available"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={size === "No sizes available"}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-2">Select Color</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        color !== "No colors available" &&
                        setSelectedColor(color)
                      }
                      className={`px-4 py-2 border rounded-md ${
                        selectedColor === color
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white border-gray-300 hover:border-indigo-600"
                      } ${
                        color === "No colors available"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      disabled={color === "No colors available"}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700"
                >
                  Add to Cart
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-2">Description</h3>
                <p className="text-gray-600">{product?.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        {product?.id &&  <Review key={product?.id} productId={product?.id} />}
           
      </section>
    </>
  );
};

export default ProductDetail;
