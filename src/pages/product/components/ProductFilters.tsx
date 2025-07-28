import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchProducts } from "../../../store/productSlice";
import ProductCard from "./ProductCard";

const ProductFilters = () => {
  const [activeBrand, setActiveBrand] = useState<string>("All");
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((store) => store.products);
  const { brand, collection } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    setActiveBrand(brand || "All");
  }, [brand]);

  const brands = ["All", ...new Set(products.map((product) => product.brand))];
  const filtered = products.filter((product) => {
    const matchBrand = brand
      ? product.brand.toLowerCase() === brand.toLowerCase()
      : true;

    const matchCollection = collection
      ? product.Collection?.collectionName.toLowerCase() ===
        collection.toLowerCase()
      : true;

    return matchBrand && matchCollection;
  });

 const handleBrandClick = (selectedBrand: string) => {
  if (!collection) return; 
  if (selectedBrand === "All") navigate(`/${collection}`);
  else navigate(`/${collection}/${selectedBrand}`);
};


  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Bestsellers Products</h2>

        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-2 min-w-max">
            {brands.map((brand) => (
              <button
                onClick={() => handleBrandClick(brand)}
                key={brand}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  activeBrand === brand
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="py-12 bg-white flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.length > 0 &&
            filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  images: Array.isArray(product.images)
                    ? product.images
                    : ([product.images].filter(Boolean) as string[]),
                }}
              />
            ))}
        </div>
      </section>

      <div className="mt-12 text-center">
        <button className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-md font-medium transition duration-300">
          View More Products
        </button>
      </div>
    </section>
  );
};

export default ProductFilters;
