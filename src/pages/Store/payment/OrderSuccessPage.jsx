import { Link, useLocation } from "react-router-dom";
import { QRCode } from "react-qrcode-logo";
import { useRef, useEffect } from "react";
import useAppStore from "../../../stores/useAppStore";

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const { loadCartFromDatabase } = useAppStore();

  // Ref untuk QR Code container
  const qrRef = useRef([]);

  // 🚀 CRITICAL: Refresh cart and invalidate product cache after successful payment
  useEffect(() => {
    console.log("💰 Payment Success - Refreshing data...");

    // 1. Reload cart from database (will be empty after purchase)
    loadCartFromDatabase().catch((err) => {
      console.error("Failed to reload cart:", err);
    });

    // 2. Force product data refresh by updating timestamp
    // This will trigger any product list components to refetch
    window.dispatchEvent(new Event("productDataInvalidated"));

    // 3. Clear any cached product data from sessionStorage/localStorage
    try {
      // Clear product cache if you're using it
      sessionStorage.removeItem("productCache");
      sessionStorage.removeItem("productListCache");
    } catch (e) {
      console.error("Failed to clear cache:", e);
    }

    console.log("✅ Data refresh completed");
  }, [loadCartFromDatabase]);

  // Handle case where there's no state, but don't return early
  // if (!state) return <p className="p-6">Tidak ada data pembayaran.</p>;

  const {
    form = {},
    cartItems = [],
    // Removed unused paymentMethod
    purchaseId,
    total,
    discount,
    subtotal,
  } = state || {};

  // Ensure cartItems is an array
  const items = Array.isArray(cartItems) ? cartItems : [];

  const ticketItems = items.filter(
    (item) => (item.category ?? item.Category)?.toLowerCase() === "ticket"
  );

  const productItems = items.filter(
    (item) => (item.category ?? item.Category)?.toLowerCase() !== "ticket"
  );

  const handleDownloadQR = (index, ticketName) => {
    if (!qrRef.current[index]) return;
    const canvas = qrRef.current[index].querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ticketName}_ticket.png`;
    link.click();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f7f7f7]">
      <div
        className="relative w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/bg-texture.png')" }}
      >
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 text-center">
          <div className="flex justify-center mb-6">
            <div className="checkmark-container">
              <div className="checkmark"></div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Pembelian Berhasil!
          </h1>
          <p className="text-gray-600 mb-8">
            Terima kasih telah melakukan pembelian.{" "}
            {ticketItems.length > 0 &&
              "Silakan tunjukkan QR Code berikut saat masuk acara."}
          </p>

          {/* Order Summary - Only show if we have data */}
          {state && (
            <div className="bg-white rounded-lg p-6 mb-8 text-left">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              {purchaseId && (
                <p className="mb-2">
                  <strong>Order ID:</strong> {purchaseId}
                </p>
              )}

              <p className="mb-2">
                <strong>Nama:</strong> {form.name}
              </p>
              <p className="mb-2">
                <strong>Email:</strong> {form.email}
              </p>
              <p className="mb-2">
                <strong>Telepon:</strong> {form.phone}
              </p>

              {productItems.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Produk:</h3>
                  {productItems.map((item) => (
                    <div key={item.id} className="flex justify-between mb-1">
                      <span>
                        {item.name} x{item.qty}
                      </span>
                      <span>Rp {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {ticketItems.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Tiket:</h3>
                  {ticketItems.map((item) => (
                    <div key={item.id} className="flex justify-between mb-1">
                      <span>
                        {item.name} x{item.qty}
                      </span>
                      <span>Rp {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between mb-1">
                  <span>Subtotal:</span>
                  <span>Rp {subtotal?.toLocaleString() || "0"}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between mb-1 text-green-600">
                    <span>Discount:</span>
                    <span>-Rp {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>Rp {total?.toLocaleString() || "0"}</span>
                </div>
              </div>
            </div>
          )}

          {/* QR Codes for tickets */}
          {ticketItems.map((ticket, index) => {
            // Create URL for QR scan page
            const qrScanUrl = `${window.location.origin}/ejpeace/qr-scan?purchaseId=${purchaseId}`;

            return (
              <div
                key={ticket.id}
                className="flex flex-col items-center mb-8"
                ref={(el) => (qrRef.current[index] = el)}
              >
                <div className="mb-4 text-center">
                  <h3 className="text-xl font-bold mb-2">
                    {ticket.title || ticket.name}
                  </h3>
                  <p className="text-gray-600">
                    Scan this QR code for verification
                  </p>
                </div>
                <QRCode value={qrScanUrl} size={200} />
                <button
                  onClick={() =>
                    handleDownloadQR(index, ticket.title || ticket.name)
                  }
                  className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                >
                  Download QR Code
                </button>
              </div>
            );
          })}

          {/* QR Code for products */}
          {productItems.length > 0 && purchaseId && (
            <div className="flex flex-col items-center mb-8">
              <div className="mb-4 text-center">
                <h3 className="text-xl font-bold mb-2">Order Verification</h3>
                <p className="text-gray-600">
                  Scan this QR code for order verification
                </p>
              </div>
              <QRCode
                value={`${window.location.origin}/ejpeace/qr-scan?purchaseId=${purchaseId}`}
                size={200}
              />
              <button
                onClick={() => handleDownloadQR(0, "Order")}
                className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                Download QR Code
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Link
              to="/ejpeace/store"
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition"
            >
              Kembali ke Store
            </Link>

            <Link
              to="/ejpeace/profile"
              className="px-6 py-3 border border-black text-black rounded-md hover:bg-black hover:text-white transition"
            >
              Order History
            </Link>
          </div>
        </div>
      </div>

      <footer className="w-full py-6 bg-black text-center text-white">
        <p className="text-sm">
          © {new Date().getFullYear()} Peacetival. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
