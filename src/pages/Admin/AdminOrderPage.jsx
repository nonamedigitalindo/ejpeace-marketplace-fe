import { useState, useEffect } from "react";
import { FaSpinner, FaBox, FaEnvelope, FaClock, FaMoneyBillWave, FaHourglassHalf } from "react-icons/fa";
import { getOrders } from "../../api/order";
import { getUserById } from "../../api/user";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      
      const safeData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.orders)
        ? response.orders
        : Array.isArray(response?.results)
        ? response.results
        : [];
      
      // Fetch user emails for each order
      const ordersWithEmails = await Promise.all(
        safeData.map(async (order) => {
          try {
            if (order.user_id) {
              const userRes = await getUserById(order.user_id);
              const user = userRes?.data ?? userRes;
              return {
                ...order,
                user_email: user?.email || 'No email'
              };
            }
            return { ...order, user_email: 'No email' };
          } catch (err) {
            console.error(`Error fetching user ${order.user_id}:`, err);
            return { ...order, user_email: 'No email' };
          }
        })
      );
      
      setOrders(ordersWithEmails);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      paid: "bg-blue-100 text-blue-800 border-blue-300",
      completed: "bg-blue-100 text-blue-800 border-blue-300",
      cancelled: "bg-red-100 text-red-800 border-red-300"
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const filteredOrders = orders.filter(o => 
    filter === "all" || o.status?.toLowerCase() === filter
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status?.toLowerCase() === "pending").length,
    paid: orders.filter(o => o.status?.toLowerCase() === "paid" || o.status?.toLowerCase() === "completed").length,
    // Revenue hanya dari order yang paid/completed
    revenue: orders
      .filter(o => o.status?.toLowerCase() === "paid" || o.status?.toLowerCase() === "completed")
      .reduce((sum, o) => sum + parseFloat(o.amount || 0), 0),
    // Pending amount - total uang yang belum dibayar
    pendingAmount: orders
      .filter(o => o.status?.toLowerCase() === "pending")
      .reduce((sum, o) => sum + parseFloat(o.amount || 0), 0)
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Management</h1>
        <p className="text-gray-600">Monitor and manage customer orders</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <FaBox className="text-3xl text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <FaClock className="text-3xl text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Paid Orders</p>
              <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
            </div>
            <FaEnvelope className="text-3xl text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Amount</p>
              <p className="text-xl font-bold text-yellow-600">
                Rp {stats.pendingAmount.toLocaleString()}
              </p>
            </div>
            <FaHourglassHalf className="text-3xl text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-xl font-bold text-blue-600">
                Rp {stats.revenue.toLocaleString()}
              </p>
            </div>
            <FaMoneyBillWave className="text-3xl text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Orders
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
              {orders.length}
            </span>
          </button>
          
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "pending"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
              {stats.pending}
            </span>
          </button>
          
          <button
            onClick={() => setFilter("paid")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "paid"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Paid
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
              {stats.paid}
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-lg shadow">
          <FaSpinner className="animate-spin mr-2 text-blue-600" size={24} />
          <span className="text-gray-700">Loading orders...</span>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4 text-left font-semibold">Order Info</th>
                  <th className="p-4 text-left font-semibold">Customer Email</th>
                  <th className="p-4 text-left font-semibold">Amount</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Order Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8">
                      <div className="flex flex-col items-center text-gray-500">
                        <FaBox className="text-5xl mb-3 text-gray-300" />
                        <p className="text-lg">No orders found</p>
                        <p className="text-sm">
                          {filter !== "all" 
                            ? `No ${filter} orders at the moment` 
                            : "Orders will appear here once customers make purchases"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-800">#{order.id}</p>
                          <p className="text-sm text-gray-500">Order ID</p>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-full p-2 mr-3">
                            <FaEnvelope className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {order.user_email || 'No email'}
                            </p>
                            <p className="text-sm text-gray-500">Customer</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <p className="font-bold text-lg text-blue-600">
                          Rp {parseFloat(order.amount || 0).toLocaleString()}
                        </p>
                      </td>
                      
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                          {order.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div>
                          <p className="text-gray-800">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}