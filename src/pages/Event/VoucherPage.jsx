import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllVouchers, claimVoucher } from "../../api/voucher";
import NoDataMessage from "../../components/NoDataMessage";

export default function VoucherPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimLoading, setClaimLoading] = useState({});
  const [claimSuccess, setClaimSuccess] = useState({});

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("token");

  // Fetch all vouchers
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/"); // Redirect to login if not logged in
      return;
    }

    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const response = await getAllVouchers();
        const vouchersData = response.data || response || [];
        setVouchers(vouchersData);
        setError(null);
      } catch (err) {
        console.error("Error fetching vouchers:", err);
        setError("Failed to load vouchers");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [isLoggedIn, navigate]);

  // Handle claim voucher
  const handleClaimVoucher = async (voucherId) => {
    if (!isLoggedIn) {
      navigate("/"); // Redirect to login if not logged in
      return;
    }

    setClaimLoading((prev) => ({ ...prev, [voucherId]: true }));
    setClaimSuccess((prev) => ({ ...prev, [voucherId]: false }));

    try {
      await claimVoucher(voucherId);
      setClaimSuccess((prev) => ({ ...prev, [voucherId]: true }));

      // Refresh vouchers after claiming
      const response = await getAllVouchers();
      const vouchersData = response.data || response || [];
      setVouchers(vouchersData);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setClaimSuccess((prev) => ({ ...prev, [voucherId]: false }));
      }, 3000);
    } catch (err) {
      console.error("Error claiming voucher:", err);
      setError(err.response?.data?.message || "Failed to claim voucher");
    } finally {
      setClaimLoading((prev) => ({ ...prev, [voucherId]: false }));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6">You need to be logged in to view vouchers.</p>
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

  if (loading) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading vouchers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="pt-28 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide underline underline-offset-8">
            All Vouchers
          </h1>
          <button
            onClick={() => navigate("/ejpeace/event")}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Back to Events
          </button>
        </div>

        {vouchers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {voucher.code}
                    </h2>
                    <div className="mt-2">
                      {voucher.discount_type === "percentage" ? (
                        <span className="text-2xl font-bold text-green-600">
                          {parseFloat(voucher.discount_value)}% OFF
                        </span>
                      ) : (
                        <span className="text-2xl font-bold text-green-600">
                          Rp{" "}
                          {parseFloat(voucher.discount_value).toLocaleString()}{" "}
                          OFF
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaimVoucher(voucher.id)}
                    disabled={claimLoading[voucher.id]}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      claimSuccess[voucher.id]
                        ? "bg-green-500 text-white"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    } disabled:opacity-50`}
                  >
                    {claimLoading[voucher.id]
                      ? "Claiming..."
                      : claimSuccess[voucher.id]
                      ? "Claimed!"
                      : "Claim"}
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Minimum Order:</span>
                    <span>
                      Rp{" "}
                      {parseFloat(
                        voucher.min_order_value || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valid Until:</span>
                    <span>
                      {new Date(voucher.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usage:</span>
                    <span>
                      {voucher.used_count || 0} of {voucher.max_usage || "∞"}{" "}
                      used
                    </span>
                  </div>
                </div>

                {claimSuccess[voucher.id] && (
                  <div className="mt-3 p-2 bg-green-100 text-green-700 text-sm rounded">
                    Voucher claimed successfully! You can now use it for
                    purchases.
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <NoDataMessage
            title="No Vouchers Available"
            message="There are currently no vouchers available. Check back later for new offers."
            actionText="Back to Events"
            onAction={() => navigate("/ejpeace/event")}
          />
        )}
      </div>
    </div>
  );
}
