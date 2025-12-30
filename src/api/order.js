import { api, BASE_URL } from "./apiClient";
// base import.meta.env.VITE_API_BASE_URL;
import { saveAs } from 'file-saver';

// GET ALL ORDERS
export const getOrders = async () => {
  const res = await api.get(`/orders/all`);
  return res.data; // hasil API: {success, message, data:[…]}
};

// GET ORDER BY ID
export const getOrdersById = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const exportOrdersXLSX = async (startDate = null, endDate = null, status = null) => {
  try {
    const params = new URLSearchParams();
    params.append("type", "xlsx");
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (status) params.append("status", status);

    const token = localStorage.getItem('token'); // Adjust based on your auth

    console.log("🚀 Requesting XLSX...");

    const response = await fetch(
      `${BASE_URL}/api/v1/orders/all?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      }
    );

    console.log("📡 Response status:", response.status);
    console.log("📡 Content-Type:", response.headers.get('content-type'));

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const blob = await response.blob();

    console.log("📦 Blob size:", blob.size, "bytes");
    console.log("📦 Blob type:", blob.type);

    // Generate filename
    let filename = "orders";
    if (startDate && endDate) {
      filename += `_${startDate}_to_${endDate}`;
    } else if (startDate) {
      filename += `_from_${startDate}`;
    } else if (endDate) {
      filename += `_until_${endDate}`;
    }
    filename += ".xlsx";

    console.log("💾 Downloading:", filename);

    // Use FileSaver - this ALWAYS works!
    saveAs(blob, filename);

    console.log("✅ Download triggered");

    return true;
  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error;
  }
};