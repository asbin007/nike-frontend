import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { useLocation } from "react-router-dom";
import ProductCard from "./components/ProductCard";

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchProducts = () => {
  const query = useQuery();
  const keyword = query.get("query")?.toLowerCase() || "";
  const { products } = useAppSelector((store) => store.products);

  // ✅ Save keyword in localStorage
  useEffect(() => {
    if (keyword) {
      let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      if (!history.includes(keyword)) {
        history.unshift(keyword);
        if (history.length > 5) history.pop(); // keep only last 5 searches
        localStorage.setItem("searchHistory", JSON.stringify(history));
      }
    }
  }, [keyword]);

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(keyword) ||
      p.brand?.toLowerCase().includes(keyword) ||
      p.Collection?.collectionName?.toLowerCase().includes(keyword) ||
      p.Category?.categoryName?.toLowerCase().includes(keyword) ||
      p.price?.toString().includes(keyword)
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Search Results for:{" "}
        <span className="text-blue-600">"{query.get("query")}"</span>
      </h2>

      {/* ✅ Show Recommended Searches */}
      <RecentSearches />

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

const RecentSearches = () => {
  const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");

  if (history.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">Recent Searches</h3>
      <div className="flex gap-2 flex-wrap">
        {history.map((item, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-gray-200 rounded-full text-sm cursor-pointer hover:bg-gray-300"
            onClick={() => (window.location.href = `/search?query=${item}`)}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SearchProducts;
