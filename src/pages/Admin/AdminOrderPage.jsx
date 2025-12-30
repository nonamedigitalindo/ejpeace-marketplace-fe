import { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaMoneyBillWave, FaClock, FaCheckCircle, FaTimesCircle, FaBoxOpen, FaSpinner, FaEnvelope, FaFileExcel } from "react-icons/fa";
import { getOrders, exportOrdersXLSX } from "../../api/order";


export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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

      // Backend now provides user_email and username directly
      setOrders(safeData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchFilter = filter === "all" || o.status?.toLowerCase() === filter;
    const matchSearch =
      (o.id && o.id.toString().includes(searchTerm)) ||
      (o.user_email && o.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.status && o.status.toLowerCase().includes(searchTerm.toLowerCase()));

    // Date Filter
    let matchDate = true;
    if (startDate) {
      matchDate = matchDate && new Date(o.created_at) >= new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchDate = matchDate && new Date(o.created_at) <= end;
    }

    return matchFilter && matchSearch && matchDate;
  });

  // Calculate stats
  const totalPaid = orders
    .filter(o => o.status?.toLowerCase() === 'paid' || o.status?.toLowerCase() === 'completed')
    .reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);

  const totalUnpaid = orders
    .filter(o => o.status?.toLowerCase() === 'pending')
    .reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);

  const pendingCount = orders.filter(o => o.status?.toLowerCase() === 'pending').length;

  // Calculate Trend (This Month vs Last Month)
  const calculateTrend = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthOrders = orders.filter(o => {
      const d = new Date(o.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const lastMonthOrders = orders.filter(o => {
      const d = new Date(o.created_at);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    }).length;

    if (lastMonthOrders === 0) return { percent: 100, isUp: true };
    const diff = currentMonthOrders - lastMonthOrders;
    const percent = ((diff / lastMonthOrders) * 100).toFixed(0);
    return { percent: Math.abs(percent), isUp: diff >= 0 };
  };

  const trend = calculateTrend();


  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    let styles = "bg-gray-100 text-gray-600 border-gray-200";
    let icon = null;

    if (s === 'paid' || s === 'completed') {
      styles = "bg-green-100 text-green-700 border-green-200";
      icon = <FaCheckCircle className="mr-1" />;
    } else if (s === 'pending') {
      styles = "bg-yellow-100 text-yellow-700 border-yellow-200";
      icon = <FaClock className="mr-1" />;
    } else if (s === 'cancelled' || s === 'failed') {
      styles = "bg-red-50 text-red-600 border-red-100";
      icon = <FaTimesCircle className="mr-1" />;
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${styles}`}>
        {icon} {status}
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen font-sans pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 mt-1">Track and manage customer orders.</p>
        </div>
        <button
          onClick={async () => {
            try {
              setExporting(true);
              // Pass current filter status to export (use null for 'all')
              const statusFilter = filter === 'all' ? null : filter;
              await exportOrdersXLSX(startDate || null, endDate || null, statusFilter);
            } catch (error) {
              console.error("Export failed:", error);
              alert("Failed to export orders. Please try again.");
            } finally {
              setExporting(false);
            }
          }}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {exporting ? (
            <>
              <FaSpinner className="animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FaFileExcel />
              Export XLSX
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Orders & Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <FaBoxOpen size={18} />
            </div>
          </div>
          <div className={`text-xs font-bold flex items-center gap-1 ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isUp ? '↑' : '↓'} {trend.percent}% {trend.isUp ? 'increase' : 'decrease'} (vs last month)
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center">
              <FaClock size={18} />
            </div>
          </div>
          <div className="h-4"></div>
        </div>

        {/* Total Paid */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-1">Rp {totalPaid.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
              <FaCheckCircle size={18} />
            </div>
          </div>
        </div>

        {/* Total Unpaid */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Unpaid</p>
              <p className="text-2xl font-bold text-red-500 mt-1">Rp {totalUnpaid.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <FaTimesCircle size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">

        {/* Dates & Tabs */}
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="flex gap-2 bg-gray-50 p-1 rounded-xl w-fit">
            {['all', 'pending', 'paid', 'cancelled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${filter === f
                  ? "bg-white text-black shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-900"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 outline-none"
            />
          </div>
        </div>

        <div className="relative w-full lg:w-64">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 h-11 rounded-1xl border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 outline-none w-full transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-yellow-50/80 rounded-2xl text-xs font-bold text-gray-500 uppercase tracking-wider border border-yellow-100 mb-2">
            <div className="col-span-1">ID</div>
            <div className="col-span-3">Customer Info</div>
            <div className="col-span-3">Products</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-center">Date</div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
              <FaBoxOpen className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg">No orders found.</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters or search.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              return (
                <div key={order.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 group">
                  <div className="col-span-1 font-mono text-xs text-gray-400">#{order.id}</div>

                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold shadow-sm border border-yellow-100">
                      <FaEnvelope />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">{order.user_email || "Guest"}</p>
                      <p className="text-xs text-gray-500">
                        {order.username || "Guest"}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <p className="text-sm text-gray-700 line-clamp-2" title={order.product_name || '-'}>
                      {order.product_name || '-'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {order.type === 'ticket' ? '🎫 Ticket' : '📦 Product'}
                    </p>
                  </div>

                  <div className="col-span-2 text-right">
                    <p className="font-bold text-gray-900">Rp {Number(order.amount).toLocaleString()}</p>
                  </div>

                  <div className="col-span-2 text-center">
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="col-span-1 text-center text-xs text-gray-500">
                    <p className="font-bold">{new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                    <p>{new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )
      }
    </div >
  );
}