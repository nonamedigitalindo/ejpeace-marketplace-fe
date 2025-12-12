import { useState, useEffect } from "react";
import { getProducts } from "../../api/product";
import { getOrders } from "../../api/order";
import { FaBox, FaTicketAlt, FaCalendarAlt, FaMoneyBillWave, FaArrowUp, FaArrowDown, FaChartLine, FaShoppingCart, FaClock } from "react-icons/fa";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    paidOrders: 0,
    activeEvents: 0,
    activeVouchers: 0,
    revenue: 0
  });
  const [periodStats, setPeriodStats] = useState({
    weekly: { orders: 0, revenue: 0 },
    monthly: { orders: 0, revenue: 0 },
    yearly: { orders: 0, revenue: 0 }
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentPeriodData = periodStats[selectedPeriod];

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your business performance and key metrics</p>
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setSelectedPeriod('weekly')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            selectedPeriod === 'weekly'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Mingguan
        </button>
        <button
          onClick={() => setSelectedPeriod('monthly')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            selectedPeriod === 'monthly'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Bulanan
        </button>
        <button
          onClick={() => setSelectedPeriod('yearly')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            selectedPeriod === 'yearly'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Tahunan
        </button>
      </div>

      {/* Period Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">
                Revenue ({selectedPeriod === 'weekly' ? '7 Hari' : selectedPeriod === 'monthly' ? '30 Hari' : '12 Bulan'})
              </p>
              <p className="text-4xl font-bold">Rp {currentPeriodData.revenue.toLocaleString()}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <FaMoneyBillWave className="text-4xl" />
            </div>
          </div>
          <div className={`flex items-center gap-2 mt-4 ${trend.isUp ? 'text-green-200' : 'text-red-200'}`}>
            {trend.isUp ? <FaArrowUp /> : <FaArrowDown />}
            <span className="font-semibold">{trend.percentage}% vs periode sebelumnya</span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 p-8 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">
                Paid Orders ({selectedPeriod === 'weekly' ? '7 Hari' : selectedPeriod === 'monthly' ? '30 Hari' : '12 Bulan'})
              </p>
              <p className="text-4xl font-bold">{currentPeriodData.orders}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-4 rounded-lg">
              <FaShoppingCart className="text-4xl" />
            </div>
          </div>
          <p className="text-green-100 text-sm">
            Rata-rata: Rp {currentPeriodData.orders > 0 ? Math.round(currentPeriodData.revenue / currentPeriodData.orders).toLocaleString() : 0} per order
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaChartLine className="text-2xl text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-800">Rp {stats.revenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">Semua transaksi paid</p>
        </div>

        {/* Total Paid Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaClock className="text-2xl text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Paid Orders</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.paidOrders}</p>
          <p className="text-sm text-gray-500 mt-2">Transaksi selesai</p>
        </div>

        {/* Active Events */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaCalendarAlt className="text-2xl text-purple-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Active Events</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.activeEvents}</p>
          <p className="text-sm text-gray-500 mt-2">Event yang aktif</p>
        </div>

        {/* Active Vouchers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FaTicketAlt className="text-2xl text-yellow-600" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Active Vouchers</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.activeVouchers}</p>
          <p className="text-sm text-gray-500 mt-2">Voucher tersedia</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Grafik Revenue {selectedPeriod === 'weekly' ? '(7 Hari)' : selectedPeriod === 'monthly' ? '(4 Minggu)' : '(12 Bulan)'}
          </h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700 group"
                    style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      Rp {item.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Grafik Orders {selectedPeriod === 'weekly' ? '(7 Hari)' : selectedPeriod === 'monthly' ? '(4 Minggu)' : '(12 Bulan)'}
          </h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-green-600 rounded-t-lg transition-all hover:bg-green-700 group"
                    style={{ height: `${(item.orders / maxOrders) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {item.orders} orders
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section - Top Products & Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Top 5 Produk Terlaris</h2>
          
          {topProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada data penjualan produk</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.count} terjual</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">Rp {product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Distribusi Status Order</h2>
          
          {orderStatusDistribution.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Belum ada data order</p>
          ) : (
            <div className="space-y-4">
              {orderStatusDistribution.map((status, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 capitalize">{status.status}</span>
                    <span className="font-bold text-gray-800">{status.count} ({status.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        status.status?.toLowerCase() === 'paid' || status.status?.toLowerCase() === 'completed'
                          ? 'bg-blue-600'
                          : status.status?.toLowerCase() === 'pending'
                          ? 'bg-yellow-500'
                          : status.status?.toLowerCase() === 'cancelled'
                          ? 'bg-red-500'
                          : 'bg-gray-400'
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