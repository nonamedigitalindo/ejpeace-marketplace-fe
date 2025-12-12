import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPurchase, createPurchaseDirect } from "../../../api/purchase";
import { getProductById } from "../../../api/product";
import { BASE_URL } from "../../../api/apiClient";
import { getUserProfile } from "../../../api/user";
import useAppStore from "../../../stores/useAppStore";

export default function CheckoutFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useAppStore();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Indonesia",
    voucher_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockErrors, setStockErrors] = useState({});

  // Check if this is a "Buy Now" purchase
  const buyNowItem = location.state?.buyNowItem;
  // Check if this is a selected items checkout
  const selectedCartItems = location.state?.selectedCartItems;
  const itemsToProcess = buyNowItem
    ? [buyNowItem]
    : selectedCartItems || cartItems;

  // Calculate total price
  const totalPrice = Array.isArray(itemsToProcess)
    ? itemsToProcess.reduce(
        (total, item) =>
          total +
          (parseFloat(item.price) || 0) *
            (parseInt(item.qty || item.quantity) || 1),
        0
      )
    : 0;

  // Prefill form with user data if logged in. Try server first, fallback to localStorage.
  useEffect(() => {
    let mounted = true;

    const mapUserToShipping = (user = {}) => {
      const full_name =
        user.username || user.name || user.full_name || user.displayName || "";
      const email = user.email || user.profile?.email || "";
      const phone =
        user.phone || user.phone_number || user.profile?.phone || "";

      const rawAddress =
        user.address ||
        user.addresses ||
        user.profile?.address ||
        user.default_address ||
        null;

      let address_line1 = "";
      let address_line2 = "";
      let state = user.state || "";
      let country = user.country || "Indonesia";

      if (rawAddress) {
        if (typeof rawAddress === "string") {
          address_line1 = rawAddress;
        } else if (typeof rawAddress === "object") {
          address_line1 =
            rawAddress.address_line1 ||
            rawAddress.street ||
            rawAddress.address ||
            rawAddress.line1 ||
            rawAddress.address1 ||
            "";
          address_line2 =
            rawAddress.address_line2 ||
            rawAddress.unit ||
            rawAddress.line2 ||
            rawAddress.detail ||
            "";
          state =
            state ||
            rawAddress.state ||
            rawAddress.province ||
            rawAddress.region ||
            "";
          country =
            country || rawAddress.country || rawAddress.country_code || country;
        }
      }

      return {
        full_name,
        email,
        phone,
        address_line1,
        address_line2,
        state,
        country,
        // intentionally DO NOT set city or postal_code here
      };
    };

    async function loadProfile() {
      try {
        const res = await getUserProfile();
        const serverUser = res?.data?.data || res?.data || res;
        if (!mounted) return;
        const mapped = mapUserToShipping(serverUser);
        setFormData((prev) => ({ ...prev, ...mapped }));
      } catch (err) {
        console.warn(
          "Could not fetch profile from API, falling back to localStorage",
          err
        );
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            const mapped = mapUserToShipping(user);
            setFormData((prev) => ({ ...prev, ...mapped }));
          } catch (e) {
            console.warn("Malformed localStorage user", e);
          }
        }
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🚀 CRITICAL: Validate stock before checkout
  const validateCartStock = async (items) => {
    console.log("🔍 Validating stock for items:", items);
    setStockErrors({});
    const errors = {};
    let hasApiFailures = false;
    let hasCriticalStockIssues = false;

    for (const item of items) {
      try {
        // Fetch fresh product data
        console.log(
          `📦 Fetching product data for item ID: ${item.id || item.product_id}`
        );
        const response = await getProductById(item.id || item.product_id);
        const product = response.data || response;

        const requestedQty = item.qty || item.quantity || 1;
        const availableStock = product.quantity || 0;

        console.log(
          `✓ Product ${item.name}: requested=${requestedQty}, available=${availableStock}`
        );

        // Check if product is out of stock
        if (availableStock === 0) {
          console.error(`❌ Product ${item.name} is OUT OF STOCK`);
          errors[item.id] = {
            message: "Product is out of stock",
            available: 0,
            requested: requestedQty,
            isCritical: true,
          };
          hasCriticalStockIssues = true;
        }
        // Check if requested quantity exceeds available stock
        else if (requestedQty > availableStock) {
          console.error(`❌ Product ${item.name}: Insufficient stock`);
          errors[item.id] = {
            message: `Only ${availableStock} available (you have ${requestedQty} in cart)`,
            available: availableStock,
            requested: requestedQty,
            isCritical: true,
          };
          hasCriticalStockIssues = true;
        }
      } catch (error) {
        console.error(`⚠️ API Error validating product ${item.id}:`, error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        // 🔄 USER-FRIENDLY APPROACH: Don't block checkout on API failures
        // Instead, log the warning and allow user to proceed
        hasApiFailures = true;
        console.warn(
          `⚠️ Could not verify stock for ${item.name}, but allowing checkout to proceed`
        );

        // Don't add to errors object - this allows checkout to continue
        // Only log for debugging purposes
      }
    }

    setStockErrors(errors);

    // Only return false (block checkout) if we have CRITICAL stock issues
    // If we just have API failures, allow checkout to proceed
    if (hasCriticalStockIssues) {
      console.log("❌ Stock validation failed: Critical stock issues detected");
      return false;
    }

    if (hasApiFailures) {
      console.log(
        "⚠️ Stock validation completed with API warnings, but allowing checkout"
      );
    } else {
      console.log("✅ Stock validation passed successfully");
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 🚀 CRITICAL: Validate stock before proceeding
    console.log("🛒 Starting checkout validation...");
    const isStockValid = await validateCartStock(itemsToProcess);

    if (!isStockValid) {
      setError(
        "Some items in your cart are no longer available in the requested quantity. Please review your cart."
      );
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Debug: Log initial data
    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log("Buy Now Item:", buyNowItem);
    console.log("Form Data:", formData);
    console.log("Total Price:", totalPrice);
    console.log("=============================");

    try {
      if (buyNowItem) {
        // Handle direct purchase for buy now items
        const directPurchaseData = {
          purchase_data: {
            product_id: buyNowItem.id,
            total_amount: totalPrice,
            description: buyNowItem.name,
          },
          shipping_address: {
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
          },
          ...(formData.voucher_code && { voucher_code: formData.voucher_code }),
        };

        console.log(
          "Sending direct purchase data to backend:",
          directPurchaseData
        );

        // Log the raw request data for debugging
        console.log("=== DEBUG INFO ===");
        console.log("Product ID being sent:", buyNowItem.id);
        console.log("Product Name being sent:", buyNowItem.name);
        console.log(
          "Full request payload:",
          JSON.stringify(directPurchaseData, null, 2)
        );
        console.log("==================");

        // Create direct purchase
        const response = await createPurchaseDirect(directPurchaseData);

        console.log("Response from backend:", response);

        // Get the purchase ID from the response
        const purchaseId = response.data?.id || response.id;

        // Redirect to payment page with the order data
        navigate("/ejpeace/payment", {
          state: {
            form: formData,
            buyNowItem: buyNowItem,
            purchaseId: purchaseId,
            total: totalPrice,
            subtotal: totalPrice,
            discount: 0,
            isTicket: false,
          },
        });
      } else {
        // Handle regular cart purchase
        const orderData = {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          total_amount: totalPrice,
          ...(formData.voucher_code && { voucher_code: formData.voucher_code }),
        };

        // Include line items so backend records multi-item orders correctly
        if (Array.isArray(itemsToProcess) && itemsToProcess.length > 0) {
          orderData.items = itemsToProcess.map((it) => ({
            product_id: it.product_id || it.id,
            quantity: it.qty || it.quantity || 1,
            price: Number(it.price) || 0,
          }));
        }

        console.log("Sending order data to backend:", orderData);

        // Log the raw request data for debugging
        console.log("=== DEBUG INFO ===");
        console.log(
          "Full cart request payload:",
          JSON.stringify(orderData, null, 2)
        );
        console.log("==================");

        // Create order
        const response = await createPurchase(orderData);

        console.log("Response from backend:", response);

        // Get the purchase ID from the response
        const purchaseId = response.data?.id || response.id;

        // DON'T clear cart here - only redirect to payment
        // The cart should remain until payment is confirmed
        // setIsOpen(false);

        // Redirect to payment page with the order data
        navigate("/ejpeace/payment", {
          state: {
            form: formData,
            cartItems: cartItems,
            selectedCartItems: selectedCartItems,
            purchaseId: purchaseId,
            total: totalPrice,
            subtotal: totalPrice,
            discount: 0,
            isTicket: false,
          },
        });
      }
    } catch (err) {
      console.error("Error creating order:", err);
      setError("Failed to process order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if there are no items to process
  const hasItems = itemsToProcess && itemsToProcess.length > 0;
  const resolveImageUrl = (img) => {
    if (!img) return null;

    let str = String(img);

    // 1. Jika URL masih localhost → paksa ubah ke domain production
    str = str.replace(
      /^http:\/\/localhost:3000/i,
      "https://api.ejpeaceentertainment.com"
    );

    // 2. Jika sudah URL lengkap: langsung return
    if (str.startsWith("http://") || str.startsWith("https://")) {
      return str;
    }

    // 3. Jika path dari backend
    return `https://api.ejpeaceentertainment.com${str}`;
  };

  if (!hasItems) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {buyNowItem ? "Product not found" : "Your cart is empty"}
          </h1>
          <button
            onClick={() => navigate("/ejpeace/store")}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 flex flex-col gap-y-3">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 flex items-center p-3 justify-between">
          <button
            onClick={() =>
              navigate(`/ejpeace/store`)
            }
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ">
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              {itemsToProcess.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 mb-4 pb-4 border-b"
                >
                  {item.image ? (
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-600 text-sm">
                      {parseFloat(item.price).toLocaleString("id-ID", {
                        currency: "IDR",
                        style: "currency",
                      })}{" "}
                      x {item.qty || item.quantity}
                    </p>
                    <p className="font-medium">
                      {(
                        parseFloat(item.price) *
                        parseInt(item.qty || item.quantity)
                      ).toLocaleString("id-ID", {
                        currency: "IDR",
                        style: "currency",
                      })}
                    </p>

                    {/* Stock Error Warning */}
                    {stockErrors[item.id] && (
                      <div className="mt-2 p-2 bg-red-50 text-red-800 text-xs rounded">
                        <p className="font-medium">
                          ⚠️ {stockErrors[item.id].message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>
                    {totalPrice.toLocaleString("id-ID", {
                      currency: "IDR",
                      style: "currency",
                    })}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span>Rp 0</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                  <span>Total</span>
                  <span>
                    {totalPrice.toLocaleString("id-ID", {
                      currency: "IDR",
                      style: "currency",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div>
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-4">
                Shipping Information
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Address Line 1
                </label>
                <textarea
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  className="w-full border p-3 rounded-lg"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Voucher Code Input */}
              {/* <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Voucher Code (Optional)
                </label>
                <input
                  type="text"
                  name="voucher_code"
                  value={formData.voucher_code}
                  onChange={handleChange}
                  placeholder="Enter voucher code"
                  className="w-full border p-3 rounded-lg"
                />
                {formData.voucher_code && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Voucher code will be applied at payment
                  </p>
                )}
              </div> */}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      full_name: "",
                      email: "",
                      phone: "",
                      address_line1: "",
                      address_line2: "",
                      city: "",
                      state: "",
                      postal_code: "",
                      country: "Indonesia",
                      voucher_code: "",
                    })
                  }
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Place Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
