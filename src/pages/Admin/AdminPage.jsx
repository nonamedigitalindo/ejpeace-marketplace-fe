import { useState, useEffect } from "react";
import { FaBoxOpen, FaShoppingCart } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import resolveImageSrc from "../../utils/image";
import AdminSidebar from "../../components/AdminLayout/AdminSidebar";

import { getProducts } from "../../api/product";
import { getOrders } from "../../api/order";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await getProducts();
        const formatted = Array.isArray(res)
          ? res
          : Array.isArray(res.data)
            ? res.data
            : [];

        setProducts(formatted);
      } catch (err) {
        console.error("Gagal memuat produk:", err);
      }
    };

    const loadOrders = async () => {
      try {
        const res = await getOrders();
        setOrders(res?.data || []);
      } catch (err) {
        console.error("Gagal memuat order:", err);
      }
    };

    loadProducts();
    loadOrders();
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-[#fffbeb]">

      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* BACKDROP MOBILE */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 p-4 sm:p-6 md:p-8 transition-all">

        {/* BURGER BUTTON */}
        {!mobileOpen && (
          <button
            className="md:hidden absolute top-4 left-4 text-3xl text-gray-700 z-40"
            onClick={() => setMobileOpen(true)}
          >
            <FiMenu />
          </button>
        )}

        <div className="max-w-7xl w-full mx-auto flex flex-col items-center">

          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Admin Dashboard</h1>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 w-full">
            <div className="flex justify-center items-center gap-4 p-8 rounded-3xl shadow-lg bg-gradient-to-br from-yellow-100 to-white border border-yellow-200">
              <div className="p-4 rounded-full bg-yellow-400 text-white shadow-md">
                <FaBoxOpen size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 p-8 rounded-3xl shadow-lg bg-gradient-to-br from-amber-100 to-white border border-amber-200">
              <div className="p-4 rounded-full bg-amber-500 text-white shadow-md">
                <FaShoppingCart size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-4 mb-10 justify-center flex-wrap bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === "products"
                  ? "bg-yellow-500 text-black shadow-md"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
            >
              Products
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === "orders"
                  ? "bg-yellow-500 text-black shadow-md"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
            >
              Product Orders
            </button>
          </div>

          {/* PRODUCT TABLE */}
          {activeTab === "products" && (
            <div className="rounded-3xl p-6 overflow-x-auto bg-white shadow-lg border border-gray-100 w-full mb-10">
              <h2 className="text-xl font-bold mb-6 text-center text-gray-800 border-b border-gray-100 pb-4">
                List Produk
              </h2>

              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-yellow-50 text-gray-600">
                    <th className="p-4 rounded-l-xl font-bold uppercase text-xs tracking-wider">Image</th>
                    <th className="p-4 font-bold uppercase text-xs tracking-wider">Name</th>
                    <th className="p-4 font-bold uppercase text-xs tracking-wider">Category</th>
                    <th className="p-4 rounded-r-xl font-bold uppercase text-xs tracking-wider">Price</th>
                  </tr>
                </thead>

                <tbody className="space-y-4">
                  {/* Spacer for aesthetics */}
                  <tr><td className="h-2"></td></tr>

                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-yellow-50/50 transition-colors border-b border-gray-50">
                      <td className="p-3">
                        {p.image ? (
                          <img
                            src={resolveImageSrc(p.image)}
                            alt={p.name}
                            className="w-16 h-16 object-cover rounded-xl shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                      </td>

                      <td className="p-3 font-medium text-gray-900">{p.name}</td>
                      <td className="p-3 capitalize text-gray-600">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold">{p.category}</span>
                      </td>
                      <td className="p-3 font-bold text-gray-900">
                        Rp {Number(p.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ORDERS TABLE */}
          {activeTab === "orders" && (
            <div className="rounded-3xl p-6 overflow-x-auto bg-white shadow-lg border border-gray-100 w-full">
              <h2 className="text-xl font-bold mb-6 text-center text-gray-800 border-b border-gray-100 pb-4">Orders</h2>

              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-yellow-50 text-gray-600">
                    <th className="p-4 rounded-l-xl font-bold uppercase text-xs tracking-wider">Order ID</th>
                    <th className="p-4 font-bold uppercase text-xs tracking-wider">User ID</th>
                    <th className="p-4 font-bold uppercase text-xs tracking-wider">Amount</th>
                    <th className="p-4 font-bold uppercase text-xs tracking-wider">Status</th>
                    <th className="p-4 font-bold uppercase text-xs tracking-wider">Details</th>
                    <th className="p-4 rounded-r-xl font-bold uppercase text-xs tracking-wider">Date</th>
                  </tr>
                </thead>

                <tbody className="space-y-2">
                  <tr><td className="h-2"></td></tr>

                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center p-8 text-gray-500"
                      >
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-yellow-50/50 transition-colors border-b border-gray-50">
                        <td className="p-3 font-mono text-xs text-gray-400">#{o.id}</td>
                        <td className="p-3 text-sm">{o.user_id}</td>
                        <td className="p-3 font-bold text-gray-900">
                          Rp {parseInt(o.amount).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${o.status === 'paid' ? 'bg-green-100 text-green-700' :
                              o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-50 text-red-600'
                            }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {o.details?.event_name && (
                            <div>Event: {o.details.event_name}</div>
                          )}
                          {o.details?.attendee_name && (
                            <div className="text-xs text-gray-500">{o.details.attendee_name}</div>
                          )}
                        </td>
                        <td className="p-3 text-xs text-gray-400">
                          {new Date(o.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
