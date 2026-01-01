import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSpinner, FaPlus, FaSearch, FaBoxOpen } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import AdminSidebar from "../../components/AdminLayout/AdminSidebar";
import { getProducts, deleteProduct } from "../../api/product";
import resolveImageSrc from "../../utils/image";
import { Link, useNavigate } from "react-router-dom";

export default function AdminProducts() {
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

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

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      fetchData(); // reload
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete product");
    }
  };

  const filteredProducts = productList.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen font-sans">
      {/* (Sidebar is handled by Layout, but if this is standalone page we might need it. 
           However based on App.jsx routes, this is INSIDE AdminLayout. 
           So we DON'T need AdminSidebar here properly if using <Outlet>.
           Checking App.jsx... Yes, it is inside AdminLayout.
           But the original code had AdminSidebar. I will remove it to avoid duplication if it is redundant, 
           OR assume the user wants it standalone. 
           Wait, App.jsx shows:
             <AdminLayout>
               <Routes> ... <Route path="/admin-products" element={<AdminProducts />} /> ...
           So removing AdminSidebar from here is correct as AdminLayout already renders it.
       */}

      <div className="p-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-500 mt-1">Manage your catalogue, prices, and stock.</p>
          </div>

          <div className="relative group flex-1 md:flex-none">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-yellow-500 transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 h-12 rounded-xl border border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none w-full md:w-80 transition-all font-medium"
            />
          </div>
          <Link to="/ejpeace/internal/create-product" className="h-12 flex items-center gap-2 bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold px-6 rounded-xl shadow-lg hover:shadow-yellow-500/30 hover:-translate-y-0.5 transition-all whitespace-nowrap">
            <FaPlus /> Add Product
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading products...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table Header - for desktop */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-yellow-50/80 rounded-2xl text-xs font-bold text-gray-500 uppercase tracking-wider border border-yellow-100 mb-2">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-1 text-center">Image</div>
            <div className="col-span-3">Product Details</div>
            <div className="col-span-1 text-center">Category</div>
            <div className="col-span-1 text-center">Stock</div>
            <div className="col-span-1 text-center">Sold</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
              <FaBoxOpen className="mx-auto text-6xl text-gray-200 mb-4" />
              <p className="text-gray-500 text-lg">No products found.</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or add a new one.</p>
            </div>
          ) : (
            filteredProducts.map((p, index) => {
              // Safely extract first image - handle various formats including nested arrays
              let firstImage = null;

              // Helper to unwrap nested arrays and get first string
              const unwrapImage = (img) => {
                if (!img) return null;
                if (typeof img === 'string') return img;
                if (Array.isArray(img) && img.length > 0) return unwrapImage(img[0]);
                if (typeof img === 'object' && img !== null) {
                  return img.image_url || img.url || null;
                }
                return null;
              };

              // Check p.images first (could be nested array like [["url"]])
              if (p.images) {
                firstImage = unwrapImage(p.images);
              }
              // Fallback to single image field
              else if (p.image) {
                firstImage = unwrapImage(p.image);
              }

              // Final safety: ensure it's a string
              if (firstImage && typeof firstImage !== 'string') {
                firstImage = unwrapImage(firstImage);
              }

              return (
                <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 group">
                  {/* Mobile Label */}
                  <div className="block md:hidden text-xs font-bold text-gray-400 uppercase mb-1">ID</div>
                  <div className="col-span-1 text-center font-mono text-gray-400 text-sm">#{p.id}</div>

                  <div className="col-span-1 flex justify-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
                      {firstImage ? (
                        <img
                          src={resolveImageSrc(firstImage)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'block'; }}
                        />
                      ) : null}
                      {/* Fallback Icon */}
                      <FaBoxOpen className={`text-gray-300 text-2xl ${firstImage ? 'hidden' : 'block'}`} />
                    </div>
                  </div>

                  <div className="col-span-3">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-yellow-600 transition-colors">{p.name}</h3>
                    <p className="text-sm text-gray-500 truncate mt-1 max-w-xs">{p.description && p.description !== 'undefined' ? p.description.replace(/<[^>]+>/g, '') : "No description"}</p>
                  </div>

                  <div className="col-span-1 text-center">
                    <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wide border border-yellow-100">
                      {p.category || '-'}
                    </span>
                  </div>

                  <div className="col-span-1 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${(p.quantity || p.stock || 0) > 10 ? 'bg-green-100 text-green-700 border border-green-200' : (p.quantity || p.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>
                      {p.quantity || p.stock || 0}
                    </span>
                  </div>

                  <div className="col-span-1 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                      {p.sold_count || p.sold || 0}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <p className="font-bold text-gray-900">Rp {Number(p.price).toLocaleString()}</p>
                  </div>

                  <div className="col-span-2 flex justify-center gap-2">
                    <button
                      onClick={() => navigate(`/ejpeace/internal/edit-product/${p.id}`)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

