import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PaymentCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Get URL parameters from Xendit callback
    const searchParams = new URLSearchParams(location.search);
    const paymentStatus = searchParams.get("status");
    const externalId = searchParams.get("external_id");
    const merchantOrderId = searchParams.get("merchant_order_id");

    // Process payment status
    const processPaymentStatus = () => {
      if (paymentStatus === "SUCCESS" || paymentStatus === "success") {
        setStatus("success");
        setMessage("Payment successful! Your ticket has been confirmed.");

        // Store payment success in localStorage for reference
        localStorage.setItem("lastPaymentStatus", "success");
        localStorage.setItem(
          "lastPaymentId",
          externalId || merchantOrderId || ""
        );
      } else if (paymentStatus === "FAILED" || paymentStatus === "failed") {
        setStatus("failed");
        setMessage("Payment failed. Please try again.");

        // Store payment failure in localStorage for reference
        localStorage.setItem("lastPaymentStatus", "failed");
        localStorage.setItem(
          "lastPaymentId",
          externalId || merchantOrderId || ""
        );
      } else {
        // For other cases, we assume it's still processing
        setStatus("processing");
        setMessage("Processing your payment. Please wait...");
      }
    };

    // Small delay to simulate processing
    const timer = setTimeout(processPaymentStatus, 500);
    return () => clearTimeout(timer);
  }, [location.search]);

  return (
    <div className="pt-28 min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        {status === "processing" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/ejpeace/event")}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition"
              >
                Back to Events
              </button>
              <button
                onClick={() => navigate("/ejpeace/profile")}
                className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                View My Tickets
              </button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/ejpeace/event")}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/ejpeace/home")}
                className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition"
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
