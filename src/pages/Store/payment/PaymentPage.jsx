import { useLocation } from "react-router-dom";
import { useRef } from "react";
import {
  createPurchase,
  createPurchaseDirect,
  initiatePayment,
} from "../../../api/purchase";
import { createTicket, initiateTicketPayment } from "../../../api/ticket";
import { getAllVouchers } from "../../../api/voucher";
import { useNavigate } from "react-router-dom";
import OrderSummary from "../../../components/Payment/OrderSummary";
import ProductList from "../../../components/Payment/ProductList";
import VoucherSection from "../../../components/Payment/VoucherSection";
import useAppStore from "../../../stores/useAppStore";

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  // Zustand store
  const {
    loading,
    voucherLoading,
    selectedVoucher,
    voucherCode,
    voucherError,
    setLoading,
    setVoucherLoading,
    setSelectedVoucher,
    setVoucherCode,
    setVoucherError,
  } = useAppStore();

  // Note: Removed automatic voucher fetching
  // Users now manually enter voucher codes for validation

  // Handle case where there's no state
  if (!location.state) return <p className="p-6">Tidak ada data checkout.</p>;

  const {
    form,
    cartItems = [],
    isTicket = false,
    buyNowItem,
    selectedCartItems,
    purchaseId, // Get purchaseId from CheckoutFormPage
  } = location.state;

  // Ensure we have items to process - either from cart, selectedCartItems or buyNowItem
  const items = buyNowItem
    ? [buyNowItem]
    : Array.isArray(selectedCartItems)
    ? selectedCartItems
    : Array.isArray(cartItems)
    ? cartItems
    : [];

  // Check if there are items to process
  const hasItems = items && items.length > 0;

  if (!hasItems && !isTicket) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No items to process</h1>
          <p className="mb-6">
            Please add items to your cart or select a product to buy.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Calculate original total
  const originalTotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );

  // Calculate discount amount based on selected voucher
  const calculateDiscount = () => {
    if (!selectedVoucher || !originalTotal) return 0;

    const minOrderValue = parseFloat(selectedVoucher.min_order_value) || 0;
    if (originalTotal < minOrderValue) return 0;

    // if (selectedVoucher.discount_type === "percentage") {
    //   const discountPercent = parseFloat(selectedVoucher.discount_value) || 0;
    //   return (originalTotal * discountPercent) / 100;
    // } else 
      if (selectedVoucher.discount_type === "fixed") {
      const discountAmount = parseFloat(selectedVoucher.discount_value) || 0;
      return Math.min(discountAmount, originalTotal);
    }

    return 0;
  };

  // Calculate final total after discount
  const discountAmount = calculateDiscount();
  const finalTotal = originalTotal - discountAmount;

  const handlePayment = async () => {
    console.log("🚀 handlePayment CALLED");
    console.log("Selected Voucher at start:", selectedVoucher);
    console.log("Original Total:", originalTotal);
    console.log("Discount Amount:", discountAmount);
    console.log("Final Total:", finalTotal);

    // Prevent double click
    if (loading) return;

    setLoading(true);

    try {
      if (isTicket) {
        // Handle ticket purchase
        const ticketData = {
          event_id: form.event_id,
          attendee_name: form.full_name,
          attendee_email: form.email,
          attendee_phone: form.phone,
        };

        const ticketResponse = await createTicket(ticketData);
        const ticketId = ticketResponse.data?.id || ticketResponse.id;

        if (selectedVoucher) {
          console.warn("Voucher application for tickets not yet implemented");
        }

        const paymentResponse = await initiateTicketPayment({
          ticket_id: ticketId,
        });

        const invoiceUrl =
          paymentResponse.data?.invoice_url || paymentResponse.invoice_url;

        if (invoiceUrl) {
          window.location.href = invoiceUrl;
        } else {
          console.error("No invoice_url found in response:", paymentResponse);
          alert("Gagal mendapatkan link pembayaran. Silakan coba lagi.");
        }
      } else {
        // Handle product purchase
        if (buyNowItem) {
          // ✅ FIX: Gunakan finalTotal (harga setelah diskon)
          const amountToPay = Math.round(finalTotal);

          const directPurchaseData = {
            purchase_data: {
              product_id: buyNowItem.id,
              total_amount: amountToPay, // ✅ Harga sudah dipotong diskon
              description: `Direct purchase of ${buyNowItem.name}`,
              // ✅ Kirim informasi voucher untuk validasi backend
              ...(selectedVoucher && {
                voucher_code: selectedVoucher.code.trim(),
                voucher_id: selectedVoucher.id,
                discount_amount: Math.round(discountAmount),
                original_amount: Math.round(originalTotal),
              }),
            },
            shipping_address: {
              full_name: form.full_name,
              phone: form.phone,
              address_line1: form.address_line1,
              city: form.city,
              postal_code: form.postal_code,
            }
            // ,
            // ✅ Root level voucher info
            // ...(selectedVoucher && {
            //   voucher_code: selectedVoucher.code.trim(),
            //   voucher_id: selectedVoucher.id,
            //   discount_amount: Math.round(discountAmount),
            //   original_amount: Math.round(originalTotal),
            // }),
          };

          // DEBUG: Log what we're sending
          console.log("=== DIRECT PURCHASE DEBUG ===");
          console.log("Original Total:", originalTotal);
          console.log("Discount Amount:", discountAmount);
          console.log("Final Total (Amount To Pay):", amountToPay);
          console.log("Selected Voucher:", selectedVoucher);
          console.log("Payload:", JSON.stringify(directPurchaseData, null, 2));
          console.log("============================");

          const purchaseResponse = await createPurchaseDirect(
            directPurchaseData
          );
          const purchaseId = purchaseResponse.data?.id || purchaseResponse.id;

          console.log("✅ Direct Purchase Created:", purchaseId);
          console.log("Full Response:", purchaseResponse);

          // Initiate payment dengan amount yang sudah benar
          const paymentResponse = await initiatePayment(purchaseId);

          console.log("📱 Payment initiated for purchase:", purchaseId);
          console.log("Payment Response:", paymentResponse);

          const invoiceUrl =
            paymentResponse.data?.invoice_url || paymentResponse.invoice_url;

          if (invoiceUrl) {
            window.location.href = invoiceUrl;
          } else {
            console.error("No invoice_url found in response:", paymentResponse);
            alert("Gagal mendapatkan link pembayaran. Silakan coba lagi.");
          }
        } else {
          // ✅ FIX: Regular cart purchase
          // If purchaseId exists (from CheckoutFormPage), use it directly
          // Otherwise, create new purchase (for backward compatibility)

          let finalPurchaseId = purchaseId;

          if (!purchaseId) {
            // Fallback: Create purchase if not already created
            console.log("⚠️ No purchaseId found, creating new purchase...");
            const amountToPay = Math.round(finalTotal);

            const purchasePayload = {
              full_name: form.full_name,
              phone: form.phone,
              address_line1: form.address_line1,
              city: form.city,
              postal_code: form.postal_code,
              country: "Indonesia",
              total_amount: amountToPay,
              ...(selectedVoucher && {
                voucher_code: selectedVoucher.code.trim(),
                voucher_id: selectedVoucher.id,
                discount_amount: Math.round(discountAmount),
                original_amount: Math.round(originalTotal),
              }),
            };

            // Include items for cart purchases when creating the order here
            if (Array.isArray(cartItems) && cartItems.length > 0) {
              purchasePayload.items = cartItems.map((it) => ({
                product_id: it.product_id || it.id,
                quantity: it.qty || it.quantity || 1,
                price: Number(it.price) || 0,
              }));
            }

            console.log("=== CART PURCHASE DEBUG ===");
            console.log("Original Total:", originalTotal);
            console.log("Discount Amount:", discountAmount);
            console.log("Final Total (Amount To Pay):", amountToPay);
            console.log("Selected Voucher:", selectedVoucher);
            console.log("Payload:", JSON.stringify(purchasePayload, null, 2));
            console.log("============================");

            const purchaseResponse = await createPurchase(purchasePayload);
            finalPurchaseId = purchaseResponse.data?.id || purchaseResponse.id;

            console.log("✅ Cart Purchase Created:", finalPurchaseId);
            console.log("Full Response:", purchaseResponse);
          } else {
            console.log(
              "✅ Using existing purchaseId from CheckoutFormPage:",
              purchaseId
            );
          }

          // Initiate payment with the purchase ID
          const paymentResponse = await initiatePayment(finalPurchaseId);

          console.log("📱 Payment initiated for purchase:", finalPurchaseId);
          console.log("Payment Response:", paymentResponse);

          const invoiceUrl =
            paymentResponse.data?.invoice_url || paymentResponse.invoice_url;

          if (invoiceUrl) {
            window.location.href = invoiceUrl;
          } else {
            console.error("No invoice_url found in response:", paymentResponse);
            alert("Gagal mendapatkan link pembayaran. Silakan coba lagi.");
          }
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      console.error("Error response:", err.response?.data);
      if (err.response?.data?.errors) {
        alert(`Payment failed: ${err.response.data.errors.join(", ")}`);
      } else if (err.response?.data?.message) {
        alert(`Payment failed: ${err.response.data.message}`);
      } else {
        alert("Pembayaran gagal. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle voucher code input - just update the value
  const handleVoucherCodeChange = (e) => {
    const code = e.target.value;
    setVoucherCode(code);
    setVoucherError(""); // Clear error saat user ketik
  };

  // Apply button - validate AND apply in one action
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Please enter a voucher code");
      return;
    }

    setVoucherLoading(true);
    setVoucherError("");

    try {
      const response = await getAllVouchers();
      const vouchersData = response.data || response || [];

      const foundVoucher = vouchersData.find(
        (v) => v.code.toUpperCase() === voucherCode.trim().toUpperCase()
      );

      if (!foundVoucher) {
        setVoucherError("Voucher code not found");
        setVoucherLoading(false);
        return;
      }

      // Check if voucher is active
      if (foundVoucher.is_active === 0) {
        setVoucherError("This voucher is no longer active");
        setVoucherLoading(false);
        return;
      }

      // Check date validity
      const now = new Date();
      const validFrom = new Date(foundVoucher.valid_from);
      const validUntil = new Date(foundVoucher.valid_until);

      if (validFrom > now) {
        setVoucherError("This voucher is not yet valid");
        setVoucherLoading(false);
        return;
      }

      if (validUntil < now) {
        setVoucherError("This voucher has expired");
        setVoucherLoading(false);
        return;
      }

      // Check minimum order value
      const minOrderValue = parseFloat(foundVoucher.min_order_value) || 0;
      if (minOrderValue > 0 && originalTotal < minOrderValue) {
        setVoucherError(
          `Minimum order: Rp ${minOrderValue.toLocaleString()} (Current: Rp ${originalTotal.toLocaleString()})`
        );
        setVoucherLoading(false);
        return;
      }

      // All validations passed - apply the voucher
      setSelectedVoucher(foundVoucher);
      setVoucherError("");
    } catch (err) {
      console.error("Error applying voucher:", err);
      setVoucherError("Error validating voucher code");
    } finally {
      setVoucherLoading(false);
    }
  };

  // Remove selected voucher
  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-20 flex flex-col gap-y-3">
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="relative flex items-center justify-start">
          {/* Tombol kiri */}
          <button
            onClick={() => navigate("/ejpeace/store")}
            className="flex items-center text-white hover:bg-blue-900 bg-blue-700 rounded-xl px-4 py-2 z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a 1 1 0 011.414 1.414L5.414 9H17a 1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Store
          </button>

          {/* Judul Tengah */}
          <h1 className="absolute left-3/4  text-xl font-bold mt-6">
            YOUR ORDER
          </h1>
        </div>
      </section>

      {/* Alamat */}
      <OrderSummary form={form} />

      {/* Produk */}
      <ProductList
        items={items}
        selectedVoucher={selectedVoucher}
        discountAmount={discountAmount}
        originalTotal={originalTotal}
        finalTotal={finalTotal}
      />

      {/* Voucher Section */}
      <VoucherSection
        selectedVoucher={selectedVoucher}
        voucherCode={voucherCode}
        voucherError={voucherError}
        voucherLoading={voucherLoading}
        onVoucherCodeChange={handleVoucherCodeChange}
        onApplyVoucher={handleApplyVoucher}
        onRemoveVoucher={handleRemoveVoucher}
      />

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-bold ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {loading ? "Proses Pembayaran..." : `Beli`}
      </button>
    </div>
  );
}
