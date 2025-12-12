import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPurchaseDetail } from "../../../api/purchase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

export default function QRScanPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("pending"); // pending, valid, invalid

  // Get purchase ID from URL parameters
  const purchaseId = searchParams.get("purchaseId");

  useEffect(() => {
    if (purchaseId) {
      fetchPurchaseDetails();
    } else {
      setError("Invalid QR code. Purchase ID not found.");
      setLoading(false);
    }
  }, [purchaseId]);

  const fetchPurchaseDetails = async () => {
    try {
      setLoading(true);
      const response = await getPurchaseDetail(purchaseId);
      const purchaseData = response?.data || response;

      if (purchaseData) {
        setPurchase(purchaseData);
        setVerificationStatus("valid");
      } else {
        setVerificationStatus("invalid");
        setError("Purchase not found.");
      }
    } catch (err) {
      console.error("Error fetching purchase details:", err);
      setVerificationStatus("invalid");
      setError("Failed to verify purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-4xl text-blue-600 mb-4"
          />
          <p className="text-xl">Verifying QR Code...</p>
        </div>
      </div>
    );
  }

  console.log("Purchase Data:", purchase);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <FontAwesomeIcon
            icon={faTimesCircle}
            className="text-5xl text-red-500 mb-4"
          />
          <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/ejpeace/home")}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">QR Code Verification</h1>
          <p className="text-gray-600">
            Scan result for purchase #{purchase?.id}
          </p>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-center">
          {verificationStatus === "valid" ? (
            <>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-5xl text-green-500 mb-4"
              />
              <h2 className="text-2xl font-bold mb-2 text-green-600">
                Valid QR Code
              </h2>
              <p className="text-gray-600">
                This QR code has been successfully verified
              </p>
            </>
          ) : (
            <>
              <FontAwesomeIcon
                icon={faTimesCircle}
                className="text-5xl text-red-500 mb-4"
              />
              <h2 className="text-2xl font-bold mb-2 text-red-600">
                Invalid QR Code
              </h2>
              <p className="text-gray-600">
                This QR code could not be verified
              </p>
            </>
          )}
        </div>

        {/* Purchase Details */}
        {purchase && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Customer Information */}
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">
                    {purchase.customer_name ||
                      purchase.address?.full_name ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">
                    {purchase.customer_email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">
                    {purchase.address?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchase Date</p>
                  <p className="font-medium">
                    {formatDate(purchase.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold mb-4">Purchase Summary</h3>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-medium">Order #{purchase.id}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(purchase.created_at)}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {purchase.status?.toUpperCase() || "N/A"}
                </span>
              </div>

              <div className="space-y-3">
                {/* Display all purchased items */}
                {purchase.items && purchase.items.length > 0 ? (
                  purchase.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start py-2 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.product_price * item.quantity)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(item.product_price)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))
                ) : purchase.product ? (
                  // Fallback for single product (old format or missing items)
                  <div className="flex justify-between items-start py-2">
                    <div className="flex-1">
                      <p className="font-medium">{purchase.product.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty:{" "}
                        {purchase.quantity ||
                          (purchase.product.price
                            ? Math.round(
                                purchase.total_amount / purchase.product.price
                              )
                            : 1)}
                      </p>
                    </div>
                    <p className="font-medium">{purchase.product.category}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No items found</p>
                )}
              </div>

              <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(purchase.total_amount)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            {purchase.address && (
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Shipping Address</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">
                    {purchase.address.address_line1}
                  </p>
                  {purchase.address.address_line2 && (
                    <p className="text-gray-600">
                      {purchase.address.address_line2}
                    </p>
                  )}
                  <p className="text-gray-600">
                    {purchase.address.city}, {purchase.address.state}{" "}
                    {purchase.address.postal_code}
                  </p>
                  <p className="text-gray-600">{purchase.address.country}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
