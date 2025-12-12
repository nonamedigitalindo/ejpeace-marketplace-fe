import React, { useState } from "react";

const TicketDebugPanel = () => {
  const [paymentId, setPaymentId] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [status, setStatus] = useState("paid");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkTicket = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Use the full URL with the correct base
      const baseUrl = "http://212.85.27.163/api/v1";
      const response = await fetch(
        `${baseUrl}/tickets/check-payment/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Use the full URL with the correct base
      const baseUrl = "http://212.85.27.163/api/v1";
      const response = await fetch(`${baseUrl}/tickets/update-status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: parseInt(ticketId),
          status: status,
        }),
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="debug-panel mt-8 p-6 rounded-lg shadow-md"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <h3 className="text-xl font-semibold mb-4">Debug Ticket</h3>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Cek Ticket by Payment ID</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
            placeholder="Payment ID"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={checkTicket}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Check Ticket"}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Update Ticket Status</h4>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="Ticket ID"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
            <option value="checked_in">Checked In</option>
          </select>
          <button
            onClick={updateStatus}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>

      {result && (
        <div
          className={`result p-4 rounded-md ${
            result.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <h4 className="font-medium mb-2">Result:</h4>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TicketDebugPanel;
