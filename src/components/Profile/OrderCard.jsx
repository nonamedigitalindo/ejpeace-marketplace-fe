import { useNavigate } from "react-router-dom";

export default function OrderCard({ order }) {
  const navigate = useNavigate();

  // Safely extract order properties
  const orderId = order?.id || "N/A";
  const orderStatus = order?.status || "unknown";
  const orderAmount = order?.total_amount || 0;
  const orderDate = order?.created_at || new Date().toISOString();
  const paymentId = order?.payment_id || "N/A";

  // Determine order type based on product category
  const orderType =
    order?.product?.category?.toLowerCase() === "ticket" ? "ticket" : "product";

  // Format date
  const formattedDate = new Date(orderDate).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Get total amount
  const total = parseFloat(orderAmount);

  // Status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format status text
  const formatStatus = (status) => {
    return status?.replace(/_/g, " ").toUpperCase() || "UNKNOWN";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-lg">PEACE-ORDER-#{orderId}</h3>
            {orderType === "ticket" && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                EVENT TICKET
              </span>
            )}
            {orderType === "product" && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                PRODUCT
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
            orderStatus
          )}`}
        >
          {formatStatus(orderStatus)}
        </span>
      </div>

      {/* Items - TICKET */}
      {orderType === "ticket" && (
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium">
                {order?.product?.name || "Event Name"}
              </p>
              <div className="flex gap-3 text-sm text-gray-500 mt-1">
                <span>
                  Product Type: {order?.product?.category || "General"}
                </span>
                {/* <span>Qty: {order?.product?.quantity || 1}</span> */}
              </div>
            </div>
            <p className="font-semibold text-right">{formatCurrency(total)}</p>
          </div>
        </div>
      )}

      {/* Items - PRODUCT */}
      {orderType === "product" && (
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium">
                {order?.product?.name || "Product Name"}
              </p>
              <div className="flex gap-3 text-sm text-gray-500 mt-1">
                {order?.product?.size && order.product.size !== "null" && (
                  <span>Size: {order.product.size}</span>
                )}
                {order?.product?.category && (
                  <span>Category: {order.product.category}</span>
                )}
                {/* <span>Qty: {order?.product?.quantity || 1}</span> */}
              </div>
            </div>
            {/* <p className="font-semibold text-right">
              {formatCurrency(
                Number(order?.product?.price || 0) *
                  (order?.product?.quantity || 1)
              )}
            </p> */}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t flex justify-between items-center">
        <div className="text-sm text-gray-500">Payment ID: {paymentId}</div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/ejpeace/purchase/${orderId}`)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            View Details
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
            <p className="text-xl font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
