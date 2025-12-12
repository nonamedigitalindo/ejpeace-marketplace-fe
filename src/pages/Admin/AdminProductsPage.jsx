import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import AdminSidebar from "../../components/AdminLayout/AdminSidebar";
import { getProducts } from "../../api/product";
import resolveImageSrc from "../../utils/image";

export default function AdminProducts() {
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      const formatted = Array.isArray(data)
        ? data
        : data.products || data.data || [];
      setProductList(formatted);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex">

      {/* SIDEBAR */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* BACKDROP MOBILE */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 relative">

        {/* BURGER BUTTON */}
        {!mobileOpen && (
          <button
            className="md:hidden absolute top-4 left-4 text-3xl text-gray-700 z-40"
            onClick={() => setMobileOpen(true)}
          >
            <FiMenu />
          </button>
        )}

        <h1 className="text-2xl font-bold mb-6 text-center">
          Product Management
        </h1>

        {loading ? (
          <div className="flex items-center justify-center mt-10">
            <FaSpinner className="animate-spin mr-2" /> Loading data...
          </div>
        ) : (
          <div
            className="overflow-x-auto rounded-lg shadow-md p-4 bg-white"
          >
            <table className="min-w-full border-collapse rounded text-sm">
              <thead className="bg-[#E1F4F3]">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                </tr>
              </thead>

              <tbody>
                {productList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-3 text-center text-gray-500">
                      No products available
                    </td>
                  </tr>
                ) : (
                  productList.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-[#E1F4F3]">
                      <td className="p-2 text-center">{p.id}</td>
                      <td className="p-2 text-center">
                          <img
                            src={
                              // prefer images array if available, otherwise single image field
                              resolveImageSrc(
                                Array.isArray(p.images) && p.images.length > 0
                                  ? p.images[0]
                                  : p.image
                              )
                            }
                            alt={p.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                      </td>
                      <td className="p-2">{p.name}</td>
                      <td className="p-2 text-center">{p.category}</td>
                      <td className="p-2 text-center">
                        Rp {Number(p.price).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

