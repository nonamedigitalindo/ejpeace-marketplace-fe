import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPurchaseDetail, downloadInvoice } from "../../../api/purchase";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Use the correct API endpoint to get purchase details with items
      const response = await getPurchaseDetail(id);
      const orderData = response?.data || response;
      console.log("Order detail data:", orderData);
      setOrder(orderData);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      // Pass buyer name and purchase date for proper filename
      const buyerName =
        order?.address?.full_name || order?.user?.username || "customer";
      const purchaseDate = order?.created_at || new Date();
      await downloadInvoice(id, buyerName, purchaseDate);
    } catch (err) {
      alert("Gagal mengunduh invoice. Silakan coba lagi.");
      console.error("Error downloading invoice:", err);
    } finally {
      setDownloading(false);
    }
  };

  // Safely extract order properties
  const orderId = order?.id || order?.order_id || "N/A";
  const orderStatus = order?.status || order?.order_status || "unknown";
  const orderPaymentId = order?.payment_id || order?.transaction_id || "N/A";

  // Format date
  const formattedDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // Get total amount
  const total = order?.total_amount ? parseFloat(order.total_amount) : 0;

  // Status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "settled":
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status?.replace(/_/g, " ").toUpperCase() || "";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-xl">Order not found</div>
      </div>
    );
  }

  // Check if order is paid
  const isPaid = ["paid", "settled", "success"].includes(
    order.status?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl px-4 py-8">
        {/* Back Button */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 flex items-center p-3 justify-between">
          <button
            onClick={() => navigate(`/ejpeace/checkout-form`)}
            className="flex items-center text-white hover:bg-blue-900 bg-blue-700 rounded-xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Store
          </button>
        </section>

        {/* Page Title */}
        <h1 className="text-3xl font-bold mb-2">Order Details</h1>
        <p className="text-gray-600 mb-8">Order #{orderId}</p>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b">
            <div>
              <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
              <p className="text-gray-600">{formattedDate}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                orderStatus
              )}`}
            >
              {formatStatus(orderStatus)}
            </span>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Items</h3>
            {order.items?.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-lg">
                          {item.product_name}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {item.quantity} x {formatCurrency(item.product_price)}
                        </p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(item.quantity * item.product_price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No items found</div>
            )}
          </div>

          {/* Payment Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Payment ID</p>
                <p className="font-medium">{orderPaymentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {isPaid && (
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={handleDownloadInvoice}
                  disabled={downloading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {downloading ? (
                    <span className="mr-2">Downloading...</span>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Download Invoice
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* QR Code Section (for paid orders) */}
          {isPaid && order.qr_url && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">QR Code</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="bg-white p-2 rounded inline-block mb-4">
                  <img
                    src={`http://212.85.27.163:3000${order.qr_url}`}
                    alt="Purchase QR Code"
                    className="w-48 h-48 object-contain mx-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/200?text=QR+Not+Found";
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Tunjukkan QR Code ini kepada petugas saat pengambilan barang
                </p>
                <button
                  onClick={() => {
                    // Simple share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: `Order #${orderId}`,
                        text: `Scan QR Code untuk order #${orderId}`,
                        url: window.location.href,
                      });
                    } else {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(
                        `http://212.85.27.163:3000${order.qr_url}`
                      );
                      alert("QR Code URL copied to clipboard!");
                    }
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Share QR Code
                </button>
              </div>
            </div>
          )}

          {/* Shipping Address (if available) */}
          {order.address && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">{order.address.full_name}</p>
                <p className="text-gray-600">{order.address.address_line1}</p>
                {order.address.address_line2 && (
                  <p className="text-gray-600">{order.address.address_line2}</p>
                )}
                <p className="text-gray-600">
                  {order.address.city}, {order.address.state}{" "}
                  {order.address.postal_code}
                </p>
                <p className="text-gray-600">{order.address.country}</p>
                <p className="text-gray-600 mt-2">
                  Phone: {order.address.phone}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
