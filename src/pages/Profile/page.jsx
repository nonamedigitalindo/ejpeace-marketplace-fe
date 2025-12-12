import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrders } from "../../api/order"; // ➜ sesuaikan dengan path kamu

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Ambil data user dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/ejpeace/login"); // jika belum login, langsung suruh login
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Ambil order dari API
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data || []); // API kamu formatnya {success, message, data}
    } catch (err) {
      console.error("Gagal mengambil order:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/ejpeace/home"); // kembali ke login
  };

  if (!user) {
    return (
      <div className="pt-24 px-6 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {/* Card Profile */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>

        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Name:</span> {user.username || "—"}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user.email || "—"}
          </p>
          <p>
            <span className="font-semibold">Address:</span>{" "}
            {user.address || "—"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-black text-white hover:bg-white hover:text-black border transition p-2 rounded text-sm"
        >
          Logout
        </button>
      </div>

      {/* Order History */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-3">Order History</h2>

        {loadingOrders ? (
          <p className="text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">Belum ada transaksi.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 border rounded-lg shadow-sm bg-gray-50"
              >
                <p>
                  <span className="font-semibold">Order ID:</span> {order.id}
                </p>
                <p>
                  <span className="font-semibold">Total:</span> Rp{" "}
                  {order.total_price?.toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span className="text-blue-600">{order.status}</span>
                </p>
                <p>
                  <span className="font-semibold">Created:</span>{" "}
                  {new Date(order.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
