import { useAppSelector } from "@/store/hooks";
import { useLocation } from "react-router-dom";
import ProductCard from "./components/ProductCard";

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchProducts = () => {
  const query = useQuery();
  const keyword = query.get('query')?.toLowerCase() || "";
  const { products } = useAppSelector((store) => store.products);

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(keyword) ||
    p.brand?.toLowerCase().includes(keyword) ||
    p.Collection?.collectionName?.toLowerCase().includes(keyword) ||
    p.Category?.categoryName?.toLowerCase().includes(keyword) ||
    p.price?.toString().includes(keyword)
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Search Results for: <span className="text-blue-600">"{query.get('query')}"</span>
      </h2>
      {filtered.length === 0 ? (
        <p className="text-gray-600">No matching products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
            
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchProducts;