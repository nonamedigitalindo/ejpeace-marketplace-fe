import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function StoreSidebar({
  filter,
  setFilter,
  products = [],
  onSearch,
  initialSearch,
}) {
  const [search, setSearch] = useState(initialSearch || "");
  const location = useLocation();

  /* ----------------------------------------
     1. AUTO APPLY SEARCH DARI URL
  ----------------------------------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search");

    if (q) {
      setSearch(q);
      onSearch && onSearch(q);
    }
  }, [location.search]);

  /* ----------------------------------------
     2. AUTO APPLY SEARCH dari Parent (Event)
  ----------------------------------------- */
  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
      onSearch && onSearch(initialSearch);
    }
  }, [initialSearch]);

  /* ----------------------------------------
     3. Ambil Kategori Unik
  ----------------------------------------- */
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  /* ----------------------------------------
     4. SEARCH debounce 250ms
  ----------------------------------------- */
  useEffect(() => {
    if (!products || products.length === 0) return;

    const q = search.trim();

    if (q === "") {
      onSearch && onSearch("");
      return;
    }

    const t = setTimeout(() => {
      onSearch && onSearch(q);
    }, 250);

    return () => clearTimeout(t);
  }, [search, products, onSearch]);

  return (
    <aside className="w-full md:w-[220px] bg-white p-5 border text-[13px] leading-relaxed rounded-md shadow-sm">
      <h3 className="font-semibold mb-4 uppercase text-[12px] tracking-widest text-gray-700 underline underline-offset-8">
        Shop
      </h3>

      {/* SEARCH */}
      <div className="relative">
        <input
          type="text"
          className="w-full pl-8 pr-3 py-2 border rounded-md text-[12px] focus:outline-none focus:ring-1 focus:ring-black transition"
          placeholder="Search Products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CATEGORY LIST */}
      <div className="space-y-2 mt-4">
        <button
          onClick={() => setFilter("all")}
          className={`block w-full text-left py-1 px-1 rounded-sm transition ${
            filter === "all"
              ? "font-semibold text-black"
              : "text-gray-700 hover:text-black"
          }`}
        >
          All Products
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`block w-full text-left py-1 px-1 rounded-sm capitalize transition ${
              filter === cat
                ? "font-semibold text-black"
                : "text-gray-700 hover:text-black"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </aside>
  );
}
