import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPurchaseDetail, downloadInvoice } from "../../api/purchase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faDownload,
  faQrcode,
  faSpinner,
  faReceipt,
  faShoppingBag,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../container/Layouts/Navbar";
import Footer from "../../container/Layouts/Footer";
import resolveImageSrc from "../../utils/image";

const PurchaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await getPurchaseDetail(id);
        setPurchase(response.data);
      } catch (err) {
        setError("Failed to load purchase details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleDownloadInvoice = async () => {
    try {
      setDownloading(true);
      // Pass buyer name and purchase date for proper filename
      const buyerName =
        purchase?.address?.full_name || purchase?.user?.username || "customer";
      const purchaseDate = purchase?.created_at || new Date();
      await downloadInvoice(id, buyerName, purchaseDate);
    } catch (err) {
      alert("Gagal mengunduh invoice. Silakan coba lagi.");
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

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
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="text-3xl text-blue-600"
        />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <p className="text-red-600 mb-4">{error || "Purchase not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
        >
          Kembali
        </button>
      </div>
    );
  }

  const isPaid = ["paid", "settled", "success"].includes(
    purchase.status?.toLowerCase()
  );

  console.log("purchases", purchase);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 mt-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    PEACE-ORDER-#{purchase.id}
                  </h1>
                  <p className="text-gray-500">
                    {new Date(purchase.created_at).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    purchase.status
                  )}`}
                >
                  {purchase.status?.toUpperCase()}
                </span>
              </div>

              {isPaid && (
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={handleDownloadInvoice}
                    disabled={downloading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {downloading ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          className="mr-2"
                        />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Download Receipt
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Items Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <FontAwesomeIcon
                  icon={faShoppingBag}
                  className="mr-2 text-gray-400"
                />
                Daftar Barang
              </h2>
              {purchase.product && (
                <div key={purchase.product.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{purchase.product.name}</p>
                    {/* <p className="text-sm text-gray-500">
                      Qty: {purchase.product.quantity}
                    </p> */}
                  </div>
                  <p className="font-medium">{purchase.product.category}</p>
                </div>
              )}
              <div className="divide-y divide-gray-100">
                {purchase.items?.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.product_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatCurrency(item.product_price)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(item.quantity * item.product_price)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-xl text-blue-600">
                  {formatCurrency(purchase.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* QR Code Card */}
            {isPaid && purchase.qr_url && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <FontAwesomeIcon
                    icon={faQrcode}
                    className="mr-2 text-gray-400"
                  />
                  QR Code Verifikasi
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg inline-block mb-4 w-full">
                  <img
                    src={resolveImageSrc(purchase.qr_url)}
                    alt="Purchase QR Code"
                    className="w-full h-48 object-contain mx-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/200?text=QR+Not+Found";
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Tunjukkan QR Code ini kepada petugas untuk verifikasi
                  pembelian Anda.{" "}
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faInfoCircle}
                      className="text-blue-500 mt-0.5 mr-2"
                    />
                    <p className="text-sm text-blue-800">
                      Petugas dapat memindai QR code ini untuk melihat detail
                      pembelian Anda. Mohon jaga QR code Anda dan jangan
                      membagikannya kepada siapa pun, kecuali petugas dari
                      eJPeace Entertainment atau event yang bersangkutan.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Simple share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: `Order #${purchase.id}`,
                        text: `Scan QR Code untuk order #${purchase.id}`,
                        url: `${window.location.origin}/ejpeace/qr-scan?purchaseId=${purchase.id}`,
                      });
                    } else {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(
                        `${window.location.origin}/ejpeace/qr-scan?purchaseId=${purchase.id}`
                      );
                      alert("QR Code URL copied to clipboard!");
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Bagikan QR Code
                </button>
              </div>
            )}

            {/* Shipping Address */}
            {purchase.address && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-bold mb-4">Alamat Pengiriman</h2>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{purchase.address.full_name}</p>
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
                  <p className="text-gray-600 mt-2">
                    Telepon: {purchase.address.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <FontAwesomeIcon
                  icon={faReceipt}
                  className="mr-2 text-gray-400"
                />
                Info Pembayaran
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Metode</span>
                  <span className="font-medium">Xendit Payment</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`font-medium ${
                      isPaid ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {purchase.status?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Waktu</span>
                  <span className="font-medium">
                    {new Date(purchase.created_at).toLocaleTimeString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="font-medium">
                    {purchase.payment_id || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetail;
