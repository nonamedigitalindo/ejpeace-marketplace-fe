import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../../api/product";
import resolveImageSrc from "../../../utils/image";

export default function ProductSection() {
  const [products, setProducts] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0); // posisi slide
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProducts();
        const all = res.data || res;

        // 🔥 Ambil produk terbaru → descending → ambil 4 saja
        const latest = [...all]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);

        setProducts(latest);
      } catch (error) {
        console.error("Error fetching latest products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const nextSlide = () => {
    setVisibleIndex((prev) =>
      prev + 1 < products.length ? prev + 1 : 0
    );
  };

  const prevSlide = () => {
    setVisibleIndex((prev) =>
      prev === 0 ? products.length - 1 : prev - 1
    );
  };

  if (loading)
    return <p className="text-center py-10">Loading latest products...</p>;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* TITLE */}
        <h2 className="text-2xl font-bold mb-6 text-center">
          Latest Products
        </h2>

        {products.length === 0 ? (
          <p className="text-center text-gray-500">No latest products found.</p>
        ) : (
          <div className="relative flex items-center">

            {/* BUTTON LEFT */}
            <button
              onClick={prevSlide}
              className="absolute left-0 z-10 bg-black/60 text-white px-3 py-2 rounded-full hover:bg-black transition"
            >
              ❮
            </button>

            {/* PRODUCTS */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mx-auto">
              {products.map((p, index) => (
                <div
                  key={p.id}
                  className={`transition-opacity duration-300 ${
                    index === visibleIndex ? "opacity-100" : "hidden lg:block lg:opacity-40"
                  }`}
                >
                  <Link
                    to={`/ejpeace/store/product/${p.id}`}
                    className="bg-white/80 rounded-lg shadow hover:shadow-md transition flex flex-col"
                  >
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={resolveImageSrc(p.images[0])}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 border rounded-t-lg flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}

                    <div className="p-3">
                      <h3 className="text-sm font-semibold truncate">{p.name}</h3>
                      <p className="text-xs text-gray-600">
                        {Number(p.price).toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* BUTTON RIGHT */}
            <button
              onClick={nextSlide}
              className="absolute right-0 z-10 bg-black/60 text-white px-3 py-2 rounded-full hover:bg-black transition"
            >
              ❯
            </button>

          </div>
        )}
      </div>
    </section>
  );
}
