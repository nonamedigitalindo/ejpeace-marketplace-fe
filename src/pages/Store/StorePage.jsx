// ------------------ STORE PAGE FIXED ------------------

import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import StoreSidebar from "../../container/Layouts/StoreSidebar.jsx";
import resolveImageSrc from "../../utils/image";
import NoDataMessage from "../../components/NoDataMessage";
import { getProducts } from "../../api/product.js";
import AlertBadge from "../../components/Product/AlertBadge";

export default function StorePage() {
  const location = useLocation();
  const searchFromEvent = location.state?.searchFromEvent || "";

  const [filter, setFilter] = useState("all"); // Always default to all products
  const [searchText, setSearchText] = useState(searchFromEvent);
  const [debouncedSearchText, setDebouncedSearchText] = useState(searchFromEvent);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const debounceTimerRef = useRef(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      const productData = Array.isArray(res) ? res : (res.data || res.products || []);
      setProducts(productData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🚀 CRITICAL: Listen for product data invalidation event
  // This triggers when payment is successful to refresh stock quantities
  useEffect(() => {
    const handleProductDataInvalidated = () => {
      console.log("📦 Product data invalidated - refetching products...");
      fetchProducts();
    };

    window.addEventListener(
      "productDataInvalidated",
      handleProductDataInvalidated
    );

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener(
        "productDataInvalidated",
        handleProductDataInvalidated
      );
    };
  }, []);

  // Implement debounced search with 500ms delay
  useEffect(() => {
    // Clear the previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    // Cleanup function to clear timer on unmount or when searchText changes
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchText]);

  // ⭐ FILTER (Category + Search) with debounce
  const filtered = products.filter((p) => {
    const matchCategory = filter === "all" || p.category === filter;

    // kalau search kosong → tampilkan semua produk (hanya filter kategori)
    if (!debouncedSearchText.trim()) return matchCategory;

    const name = (p.name || "").toLowerCase();
    const q = debouncedSearchText.toLowerCase();
    const matchSearch = name.includes(q);

    return matchCategory && matchSearch;
  });

  // DEBUG: Log filter state
  console.log("DEBUG - Filter state:", { filter, debouncedSearchText, productsCount: products.length, filteredCount: filtered.length });
  if (products.length > 0 && filtered.length === 0) {
    console.log("DEBUG - Products categories:", products.map(p => p.category));
  }

  if (loading) {
    return <p className="p-6 text-center">Loading products...</p>;
  }

  return (
    <div
      className="pt-24 min-h-screen bg-cover bg-center bg-repeat"
    // style={{ backgroundImage: `url(${bgStore})` }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 px-4 sm:px-6 lg:px-8">
        {/* SIDEBAR → tampil di atas saat mobile */}
        <div className="order-1 lg:col-span-3">
          <StoreSidebar
            key={searchText}
            filter={filter}
            setFilter={setFilter}
            products={products}
            onSearch={(txt) => setSearchText(txt)}
            initialSearch={searchText}
          />
        </div>
        {/* PRODUCT LIST */}
        <main className="order-2 lg:col-span-9">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => {
                // Determine displayed quantity
                const displayQty = (p.fake_quantity !== null && p.fake_quantity !== undefined) ? p.fake_quantity : p.quantity;

                // Filter alerts based on quantity threshold
                // If threshold is 0, always show? No, user said "shows if qty <= threshold".
                // But typically threshold 0 means "always show" or "show when 0".
                // Let's assume threshold is a number like 10, 50, 100.
                // If threshold is 0, let's assume it means "always show" if we treat 0 as default?
                // Wait, logic: "assign alerts with threshold_count".
                // If I set threshold 10, it shows when qty <= 10.
                // If I set threshold 1000, it shows when qty <= 1000.
                const activeAlerts = (p.alerts || [])
                  .filter(a => displayQty <= (a.threshold_count || 0))
                  .sort((a, b) => (a.threshold_count || 0) - (b.threshold_count || 0))
                  .slice(0, 1);

                return (
                  <div
                    key={p.id}
                    className="bg-white/80 backdrop-blur-sm border rounded-lg shadow-sm hover:shadow-md transition flex flex-col relative"
                  >
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={resolveImageSrc(p.images[0])}
                        alt={p.name}
                        className="w-full h-56 sm:h-64 object-cover border-b rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-56 sm:h-64 bg-gray-200 flex items-center justify-center border-b rounded-t-lg">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}

                    {/* Overlay Alerts */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                      {activeAlerts.map(alert => (
                        <AlertBadge key={alert.id} {...alert} />
                      ))}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h2 className="font-semibold text-sm mb-1">{p.name}</h2>
                      <p className="text-xs text-gray-600 mb-2">{p.category}</p>

                      {/* Price Display with Discount */}
                      {p.discount_percentage > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 line-through">
                            {Number(p.price).toLocaleString("id-ID", {
                              currency: "IDR",
                              style: "currency",
                            })}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-red-600">
                              {Number(p.price * (1 - p.discount_percentage / 100)).toLocaleString("id-ID", {
                                currency: "IDR",
                                style: "currency",
                              })}
                            </span>
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                              -{p.discount_percentage}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600">
                          {Number(p.price).toLocaleString("id-ID", {
                            currency: "IDR",
                            style: "currency",
                          })}
                        </p>
                      )}

                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-600">
                          STOCK {displayQty}
                        </p>
                        <Link
                          to={`product/${p.id}`}
                          className="px-4 py-1 border rounded-full text-xs hover:bg-black hover:text-white transition"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <NoDataMessage
              title="No Products Found"
              message="There are no products matching your current filters."
              actionText="View All Products"
              onAction={() => {
                setFilter("all");
                setSearchText("");
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

