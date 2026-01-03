import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createTicket, initiateTicketPayment } from "../../api/ticket";
import {
  getVouchersByType,
  applyVoucherToTicket,
  getVoucherByCode,
} from "../../api/voucher";
import resolveImageSrc from "../../utils/image";

export default function TicketPurchasePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get event data from location state
  const { event } = location.state || {};

  // Form state for attendee information
  const [formData, setFormData] = useState({
    attendee_name: "",
    attendee_email: "",
    attendee_phone: "",
    ticket_type: "general",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState(null);

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("token");

  // Pre-fill form with user data if available
  useEffect(() => {
    if (isLoggedIn) {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setFormData((prev) => ({
            ...prev,
            attendee_name: user.username || "",
            attendee_email: user.email || "",
            // Note: phone number is not in the user data, so we leave it empty
          }));
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }

      // Fetch all vouchers
      fetchAllVouchers();
    }
  }, [isLoggedIn]);

  // Fetch all vouchers
  const fetchAllVouchers = async () => {
    try {
      // Fetch only event-type vouchers
      const response = await getVouchersByType("event");
      const vouchersData = response.data || response || [];
      setVouchers(vouchersData);

      // If there's a voucher code in state, try to find and select it
      if (voucherCode && vouchersData.length > 0) {
        const foundVoucher = vouchersData.find((v) => v.code === voucherCode);
        if (foundVoucher) {
          setSelectedVoucher(foundVoucher);
        }
      }
    } catch (err) {
      console.error("Error fetching vouchers:", err);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle voucher code input
  const handleVoucherCodeChange = (e) => {
    const code = e.target.value;
    setVoucherCode(code);

    // If the code matches an existing voucher, select it
    if (code && vouchers.length > 0) {
      const foundVoucher = vouchers.find((v) => v.code === code);
      if (foundVoucher) {
        setSelectedVoucher(foundVoucher);
      } else {
        setSelectedVoucher(null);
      }
    }
  };

  // Apply selected voucher
  const handleApplyVoucher = async () => {
    if (!voucherCode) {
      setVoucherError("Please enter a voucher code");
      return;
    }

    setVoucherLoading(true);
    setVoucherError(null);

    try {
      // First, try to find the voucher by code
      let voucherToApply = selectedVoucher;

      if (!voucherToApply) {
        // If no voucher is selected, try to get it by code
        try {
          const voucherResponse = await getVoucherByCode(voucherCode);
          voucherToApply = voucherResponse.data || voucherResponse;
        } catch (err) {
          console.error("Error fetching voucher by code:", err);
          setVoucherError("Invalid voucher code");
          setVoucherLoading(false);
          return;
        }
      }

      if (voucherToApply) {
        setSelectedVoucher(voucherToApply);
        setVoucherError(
          "Voucher applied successfully! The discount will be reflected in the total."
        );
        setTimeout(() => {
          setVoucherError(null);
          setShowVoucherModal(false);
        }, 2000);
      } else {
        setVoucherError("Invalid voucher code");
      }
    } catch (err) {
      console.error("Error applying voucher:", err);
      setVoucherError(err.response?.data?.message || "Failed to apply voucher");
    } finally {
      setVoucherLoading(false);
    }
  };

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    if (!event) return 0;

    let price = parseFloat(event.discounted_price || event.price || 0);

    if (selectedVoucher) {
      const discountValue = parseFloat(selectedVoucher.discount_value);

      if (selectedVoucher.discount_type === "percentage") {
        price = price * (1 - discountValue / 100);
      } else if (selectedVoucher.discount_type === "fixed") {
        price = Math.max(0, price - discountValue);
      }
    }

    return price;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!isLoggedIn) {
      alert("You need to be logged in to purchase tickets.");
      navigate("/"); // Redirect to login page
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create ticket with attendee information
      const ticketData = {
        event_id: event.id,
        attendee_name: formData.attendee_name,
        attendee_email: formData.attendee_email,
        attendee_phone: formData.attendee_phone,
        ticket_type: formData.ticket_type,
      };

      const response = await createTicket(ticketData);

      // Apply voucher if selected
      if (selectedVoucher) {
        try {
          await applyVoucherToTicket(response.data.id, selectedVoucher.code);
        } catch (voucherErr) {
          console.error("Error applying voucher to ticket:", voucherErr);
          // Continue with payment even if voucher application fails
        }
      }

      // After creating ticket, initiate payment
      const paymentResponse = await initiateTicketPayment({
        ticket_id: response.data.id,
      });

      // Redirect to payment page (Xendit)
      if (paymentResponse.data.invoice_url) {
        // Store ticket ID for callback verification
        localStorage.setItem("pendingTicketId", response.data.id);
        window.location.href = paymentResponse.data.invoice_url;
      } else {
        setError("Failed to initiate payment. Please try again.");
      }
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/"); // Redirect to login page
      } else {
        setError("Failed to purchase ticket. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <button
            onClick={() => navigate("/ejpeace/event")}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6">You need to be logged in to purchase tickets.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Calculate prices
  const originalPrice = parseFloat(event.discounted_price || event.price || 0);
  const discountedPrice = calculateDiscountedPrice();
  const savings = originalPrice - discountedPrice;

  return (
    <div className="pt-28 min-h-screen">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-2xl font-bold mb-6 uppercase tracking-wide underline underline-offset-8">
          Ticket Purchase
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>
          <div className="flex items-center gap-4">
            {event?.image ? (
              <img
                src={resolveImageSrc(event.image)}
                alt={event.title}
                className="w-16 h-16 object-cover rounded-xl"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
            )}
            <div>
              <h3 className="font-bold text-lg">{event.title}</h3>
              <p className="text-gray-600">{event.location}</p>
              <p className="text-gray-600">
                {new Date(event.start_date).toLocaleDateString()} at{" "}
                {new Date(event.start_date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {/* Price display with voucher discount */}
              <div className="mt-2">
                {savings > 0 ? (
                  <>
                    <p className="text-lg font-bold text-green-600">
                      Rp {discountedPrice.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 line-through">
                      Rp {originalPrice.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">
                      You save Rp {savings.toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold">
                    Rp {originalPrice.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Voucher Button */}
          <div className="mt-4">
            <button
              onClick={() => setShowVoucherModal(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedVoucher
                ? `Voucher Applied: ${selectedVoucher.code}`
                : "Apply Voucher"}
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Attendee Information</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="attendee_name"
              value={formData.attendee_name}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="attendee_email"
              value={formData.attendee_email}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="attendee_phone"
              value={formData.attendee_phone}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Ticket Type
            </label>
            <select
              name="ticket_type"
              value={formData.ticket_type}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            >
              <option value="general">General Admission</option>
              <option value="vip">VIP</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/ejpeace/event")}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </form>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Apply Voucher</h3>
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {voucherError && (
                <div
                  className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${voucherError.includes("successfully")
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                    } shadow-sm`}
                >
                  {voucherError.includes("successfully") ? (
                    <svg
                      className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{voucherError}</p>
                  </div>
                </div>
              )}

              {/* Available Product Vouchers */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Available Product Vouchers
                </h4>
                {vouchers.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {vouchers.map((voucher) => (
                      <div
                        key={voucher.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedVoucher?.id === voucher.id
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                          }`}
                        onClick={() => {
                          setSelectedVoucher(voucher);
                          setVoucherCode(voucher.code);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">
                              {voucher.code}
                            </div>
                            <div className="text-xs text-gray-500">
                              Min order: Rp{" "}
                              {parseFloat(
                                voucher.min_order_value || 0
                              ).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {voucher.discount_type === "percentage"
                                ? `Rp ${parseFloat(
                                  voucher.discount_value
                                ).toLocaleString()}`
                                : `Rp ${parseFloat(
                                  voucher.discount_value
                                ).toLocaleString()}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No vouchers available at the moment.
                  </div>
                )}
              </div>

              {/* Selected Voucher Display */}
              {selectedVoucher && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {selectedVoucher.code}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedVoucher.discount_type === "percentage"
                          ? `${parseFloat(selectedVoucher.discount_value)}% OFF`
                          : `Rp ${parseFloat(
                            selectedVoucher.discount_value
                          ).toLocaleString()} OFF`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">
                        Rp{" "}
                        {parseFloat(
                          selectedVoucher.discount_value
                        ).toLocaleString()}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedVoucher(null);
                          setVoucherCode("");
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowVoucherModal(false);
                    setVoucherCode("");
                    setSelectedVoucher(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                  disabled={voucherLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyVoucher}
                  disabled={!selectedVoucher || voucherLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {voucherLoading ? "Applying..." : "Apply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
