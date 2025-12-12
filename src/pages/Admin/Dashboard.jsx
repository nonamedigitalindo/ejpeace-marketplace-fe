import { useState, useEffect } from "react";
import { getProducts } from "../../api/product";
import { getOrders } from "../../api/order";
import { FaBox, FaTicketAlt, FaCalendarAlt, FaMoneyBillWave, FaArrowUp, FaArrowDown, FaChartLine, FaShoppingCart, FaClock, FaWallet, FaStar } from "react-icons/fa";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: null,
    paidOrders: null,
    activeEvents: null,
    activeVouchers: null,
    revenue: null
  });
  const [periodStats, setPeriodStats] = useState({
    weekly: { orders: null, revenue: null },
    monthly: { orders: null, revenue: null },
    yearly: { orders: null, revenue: null }
  });
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // --- GET PRODUCTS ---
      const productRes = await getProducts();
      const products = Array.isArray(productRes)
        ? productRes
        : Array.isArray(productRes.data)
          ? productRes.data
          : [];

      // --- GET ORDERS ---
      const orderRes = await getOrders();
      const orders = orderRes?.data || [];

      // Filter paid orders
      const paidOrders = orders.filter(
        o => o.status?.toLowerCase() === "paid" || o.status?.toLowerCase() === "completed"
      );

      // Calculate total revenue
      const totalRevenue = paidOrders.reduce(
        (acc, o) => acc + parseFloat(o.amount || 0),
        0
      );

      // Calculate period-based stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

      const weeklyOrders = paidOrders.filter(o => new Date(o.created_at) >= weekAgo);
      const monthlyOrders = paidOrders.filter(o => new Date(o.created_at) >= monthAgo);
      const yearlyOrders = paidOrders.filter(o => new Date(o.created_at) >= yearAgo);

      const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
      const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);
      const yearlyRevenue = yearlyOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);

      setPeriodStats({
        weekly: { orders: weeklyOrders.length, revenue: weeklyRevenue },
        monthly: { orders: monthlyOrders.length, revenue: monthlyRevenue },
        yearly: { orders: yearlyOrders.length, revenue: yearlyRevenue }
      });

      // Count active events and vouchers
      const activeEvents = products.filter(p =>
        p.type?.toLowerCase() === 'event' &&
        p.status?.toLowerCase() === 'active'
      ).length;

      const activeVouchers = products.filter(p =>
        p.type?.toLowerCase() === 'voucher' &&
        p.status?.toLowerCase() === 'active'
      ).length;

      setStats({
        totalProducts: products.length,
        paidOrders: paidOrders.length,
        activeEvents: activeEvents,
        activeVouchers: activeVouchers,
        revenue: totalRevenue
      });

      // --- GENERATE CHART DATA based on selected period ---
      generateChartData(paidOrders, selectedPeriod);

      // --- TOP SELLING PRODUCTS ---
      const productSales = {};
      paidOrders.forEach(order => {
        const productName = order.details?.product_name || order.product_name || 'Unknown Product';
        if (!productSales[productName]) {
          productSales[productName] = { name: productName, count: 0, revenue: 0 };
        }
        productSales[productName].count += 1;
        productSales[productName].revenue += parseFloat(order.amount || 0);
      });

      const topProductsList = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      setTopProducts(topProductsList);

      // --- ORDER STATUS DISTRIBUTION ---
      const statusCount = {};
      orders.forEach(order => {
        const status = order.status || 'Unknown';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });

      const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
        status,
        count,
        percentage: ((count / orders.length) * 100).toFixed(1)
      }));
      setOrderStatusDistribution(statusDistribution);

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (paidOrders, period) => {
    let chartData = [];

    if (period === 'weekly') {
      // Last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('en-CA'));
      }

      chartData = last7Days.map(date => {
        const dayOrders = paidOrders.filter(o => {
          const orderDate = new Date(o.created_at).toLocaleDateString('en-CA');
          return orderDate === date;
        });

        const dayRevenue = dayOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);

        return {
          label: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          revenue: dayRevenue,
          orders: dayOrders.length
        };
      });
    } else if (period === 'monthly') {
      // Last 4 weeks
      chartData = [];
      for (let i = 3; i >= 0; i--) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - (i * 7));
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);

        const weekOrders = paidOrders.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate >= startDate && orderDate <= endDate;
        });

        const weekRevenue = weekOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);

        chartData.push({
          label: `Week ${4 - i}`,
          revenue: weekRevenue,
          orders: weekOrders.length
        });
      }
    } else {
      // Last 12 months
      chartData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth();
        const year = date.getFullYear();

        const monthOrders = paidOrders.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate.getMonth() === month && orderDate.getFullYear() === year;
        });

        const monthRevenue = monthOrders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);

        chartData.push({
          label: date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
          revenue: monthRevenue,
          orders: monthOrders.length
        });
      }
    }

    setChartData(chartData);
  };

  useEffect(() => {
    if (!loading) {
      const fetchOrders = async () => {
        const orderRes = await getOrders();
        const orders = orderRes?.data || [];
        const paidOrders = orders.filter(
          o => o.status?.toLowerCase() === "paid" || o.status?.toLowerCase() === "completed"
        );
        generateChartData(paidOrders, selectedPeriod);
      };
      fetchOrders();
    }
  }, [selectedPeriod]);

  const calculateTrend = () => {
    if (chartData.length < 2) return { isUp: true, percentage: 0 };

    const latest = chartData[chartData.length - 1]?.revenue || 0;
    const previous = chartData[chartData.length - 2]?.revenue || 0;

    if (previous === 0) return { isUp: true, percentage: 0 };

    const percentage = ((latest - previous) / previous * 100).toFixed(1);
    return { isUp: latest >= previous, percentage: Math.abs(percentage) };
  };

  const trend = calculateTrend();
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
  const maxOrders = Math.max(...chartData.map(d => d.orders), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing dashboard...</p>
        </div>
      </div>
    );
  }

  const currentPeriodData = periodStats[selectedPeriod];

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Hello Admin, here's what's happening today.</p>
        </div>

        {/* Period Selector - Pill Style */}
        <div className="flex bg-white p-1 rounded-full shadow-sm border border-gray-200">
          {['weekly', 'monthly', 'yearly'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${selectedPeriod === period
                ? 'bg-yellow-500 text-black shadow-md transform scale-105'
                : 'bg-transparent text-gray-500 hover:text-gray-900'
                }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">

        {/* Large Revenue Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-yellow-400 to-amber-500 p-8 rounded-3xl shadow-xl text-black relative overflow-hidden group">
          {/* Decor */}
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500">
            <FaWallet size={200} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
              <FaMoneyBillWave className="text-sm" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            </div>
            {currentPeriodData?.revenue === null || currentPeriodData?.revenue === undefined ? (
              <p className="text-xl font-bold mb-1 opacity-70">Not already implemented</p>
            ) : (
              <p className="text-5xl font-black mb-1 tracking-tight">Rp {currentPeriodData.revenue.toLocaleString()}</p>
            )}

            <div className="flex items-center gap-2 mt-4 bg-black/10 w-fit px-4 py-2 rounded-xl">
              <span className={`flex items-center gap-1 font-bold ${trend.isUp ? 'text-green-800' : 'text-red-800'}`}>
                {trend.isUp ? <FaArrowUp /> : <FaArrowDown />}
                {trend.percentage}%
              </span>
              <span className="text-sm opacity-70">vs previous {selectedPeriod}</span>
            </div>
          </div>
        </div>

        {/* Large Orders Card */}
        <div className="md:col-span-1 bg-white p-8 rounded-3xl shadow-lg border border-yellow-100 flex flex-col justify-between group hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5 text-yellow-500 transform group-hover:rotate-12 transition-transform duration-500">
            <FaShoppingCart size={150} />
          </div>
          <div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600 mb-4 group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-300">
              <FaShoppingCart size={24} />
            </div>
            <p className="text-gray-500 font-medium">Paid Orders</p>
            {currentPeriodData?.orders === null || currentPeriodData?.orders === undefined ? (
              <p className="text-lg font-bold text-gray-400">Not already implemented</p>
            ) : (
              <p className="text-4xl font-bold text-gray-900">{currentPeriodData.orders}</p>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-4 font-mono bg-gray-50 p-2 rounded-lg text-center">
            Avg: Rp {currentPeriodData?.orders > 0 ? Math.round((currentPeriodData.revenue || 0) / currentPeriodData.orders).toLocaleString() : 0}
          </p>
        </div>

        {/* Quick Stats Column */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Active Events */}
          <div className="flex-1 bg-white p-6 rounded-3xl shadow-md border-l-8 border-yellow-400 hover:scale-105 transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase">Events</p>
                {stats.activeEvents === null ? (
                  <p className="text-sm font-bold text-gray-400 mt-1">Not already implemented</p>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stats.activeEvents}</p>
                )}
              </div>
              <FaCalendarAlt className="text-2xl text-yellow-400" />
            </div>
          </div>

          {/* Active Vouchers */}
          <div className="flex-1 bg-white p-6 rounded-3xl shadow-md border-l-8 border-amber-400 hover:scale-105 transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase">Vouchers</p>
                {stats.activeVouchers === null ? (
                  <p className="text-sm font-bold text-gray-400 mt-1">Not already implemented</p>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stats.activeVouchers}</p>
                )}
              </div>
              <FaTicketAlt className="text-2xl text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-yellow-500 rounded-full"></span>
              Revenue Trend
            </h2>
            <span className="text-sm text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full">
              {selectedPeriod} view
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 px-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full bg-gray-100 rounded-2xl relative flex items-end overflow-hidden group" style={{ height: '200px' }}>
                  <div
                    className="w-full bg-yellow-400 rounded-t-2xl transition-all duration-500 ease-out group-hover:bg-yellow-500 relative"
                    style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1 rounded-lg shadow-xl whitespace-nowrap z-20 transition-opacity duration-200">
                      Rp {item.revenue.toLocaleString()}
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
              Order Volume
            </h2>
            <span className="text-sm text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full">
              {selectedPeriod} view
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 px-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-3">
                <div className="w-full bg-gray-100 rounded-2xl relative flex items-end overflow-hidden group" style={{ height: '200px' }}>
                  <div
                    className="w-full bg-amber-400 rounded-t-2xl transition-all duration-500 ease-out group-hover:bg-amber-500 relative"
                    style={{ height: `${(item.orders / maxOrders) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1 rounded-lg shadow-xl whitespace-nowrap z-20 transition-opacity duration-200">
                      {item.orders} orders
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Top Products */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
            <FaStar className="text-yellow-400" />
          </div>

          {topProducts.length === 0 ? (
            <p className="text-center text-gray-400 py-10 italic">No sales data recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-yellow-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold shadow-sm ${index === 0 ? 'bg-yellow-400 text-black' : 'bg-white text-gray-500 border'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-yellow-700 transition-colors">{product.name}</p>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{product.count} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">Rp {product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status Distribution</h2>

          {orderStatusDistribution.length === 0 ? (
            <p className="text-center text-gray-400 py-10 italic">No orders to analyze.</p>
          ) : (
            <div className="space-y-6">
              {orderStatusDistribution.map((status, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-700 capitalize flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${status.status?.toLowerCase() === 'paid' || status.status?.toLowerCase() === 'completed' ? 'bg-green-500' :
                        status.status?.toLowerCase() === 'pending' ? 'bg-yellow-500' :
                          status.status?.toLowerCase() === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'
                        }`}></span>
                      {status.status}
                    </span>
                    <span className="font-bold text-gray-900">{status.count} <span className="text-gray-400 text-xs font-normal ml-1">({status.percentage}%)</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${status.status?.toLowerCase() === 'paid' || status.status?.toLowerCase() === 'completed'
                        ? 'bg-green-500'
                        : status.status?.toLowerCase() === 'pending'
                          ? 'bg-yellow-400'
                          : status.status?.toLowerCase() === 'cancelled'
                            ? 'bg-red-400'
                            : 'bg-gray-300'
                        }`}
                      style={{ width: `${status.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}