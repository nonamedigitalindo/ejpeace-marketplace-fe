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
    <div className="flex min-h-screen w-full bg-[#E1F4F3]">

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

          <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 w-full">
            <div className="flex justify-center items-center gap-4 p-5 rounded-lg shadow bg-white">
              <FaBoxOpen size={32} />
              <div>
                <p className="text-sm text-gray-600">Total Product</p>
                <p className="text-xl font-bold">{products.length}</p>
              </div>
            </div>

            <div className="flex justify-center items-center gap-4 p-5 rounded-lg shadow bg-white">
              <FaShoppingCart size={32} />
              <div>
                <p className="text-sm text-gray-600">Total Product Orders</p>
                <p className="text-xl font-bold">{orders.length}</p>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-4 mb-10 justify-center flex-wrap">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 rounded-lg font-semibold ${
                activeTab === "products"
                  ? "bg-gray-800 text-white"
                  : "bg-teal-200 text-gray-800"
              }`}
            >
              Products
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 rounded-lg font-semibold ${
                activeTab === "orders"
                  ? "bg-gray-800 text-white"
                  : "bg-teal-200 text-gray-800"
              }`}
            >
              Product Orders
            </button>
          </div>

          {/* PRODUCT TABLE */}
          {activeTab === "products" && (
            <div className="rounded-lg p-6 overflow-x-auto bg-white shadow w-full mb-10">
              <h2 className="text-xl font-semibold mb-4 text-center">
                List Produk
              </h2>

              <table className="min-w-full text-left border-collapse">
                <thead className="bg-teal-100">
                  <tr>
                    <th className="p-3 border-b">Image</th>
                    <th className="p-3 border-b">Name</th>
                    <th className="p-3 border-b">Category</th>
                    <th className="p-3 border-b">Price</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-teal-50 border-b">
                      <td className="p-3">
                        {p.image ? (
                          <img
                            src={resolveImageSrc(p.image)}
                            alt={p.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">No Image</span>
                        )}
                      </td>

                      <td className="p-3">{p.name}</td>
                      <td className="p-3 capitalize">{p.category}</td>
                      <td className="p-3">
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
            <div className="rounded-lg p-6 overflow-x-auto bg-white shadow w-full">
              <h2 className="text-xl font-semibold mb-4 text-center">Orders</h2>

              <table className="min-w-full text-left border-collapse">
                <thead className="bg-teal-100">
                  <tr>
                    <th className="p-3 border-b">Order ID</th>
                    <th className="p-3 border-b">User ID</th>
                    <th className="p-3 border-b">Amount</th>
                    <th className="p-3 border-b">Status</th>
                    <th className="p-3 border-b">Event Name</th>
                    <th className="p-3 border-b">Ticket Type</th>
                    <th className="p-3 border-b">Attendee</th>
                    <th className="p-3 border-b">Email</th>
                    <th className="p-3 border-b">Created At</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center p-3 text-gray-500"
                      >
                        There are no orders yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-teal-50 border-b">
                        <td className="p-3">{o.id}</td>
                        <td className="p-3">{o.user_id}</td>
                        <td className="p-3">
                          Rp {parseInt(o.amount).toLocaleString()}
                        </td>
                        <td className="p-3 capitalize">{o.status}</td>
                        <td className="p-3">{o.details?.event_name}</td>
                        <td className="p-3 capitalize">
                          {o.details?.ticket_type}
                        </td>
                        <td className="p-3">{o.details?.attendee_name}</td>
                        <td className="p-3">{o.details?.attendee_email}</td>
                        <td className="p-3">
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
