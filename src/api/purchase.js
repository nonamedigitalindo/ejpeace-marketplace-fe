import { api as apiClient } from "./apiClient";

export const createPurchase = async (purchaseData) => {
  const response = await apiClient.post("/purchases", purchaseData);
  return response.data;
};

export const createPurchaseDirect = async (purchaseData) => {
  const response = await apiClient.post("/purchases/direct", purchaseData);
  return response.data;
};

export const initiatePayment = async (purchaseId) => {
  const response = await apiClient.post("/purchases/pay", {
    purchase_id: purchaseId,
  });
  return response.data;
};

export const getUserPurchases = async () => {
  const response = await apiClient.get("/purchases");
  return response.data;
};

export const getPurchaseById = async (id) => {
  const response = await apiClient.get(`/purchases/${id}`);
  return response.data;
};

export const getPurchaseDetail = async (id) => {
  const response = await apiClient.get(`/purchases/${id}/detail`);
  return response.data;
};

export const downloadInvoice = async (
  id,
  buyerName = "",
  purchaseDate = new Date()
) => {
  const response = await apiClient.get(`/purchases/${id}/invoice`, {
    responseType: "blob", // Important for file download
  });

  // Format date as YYYY-MM-DD
  const formattedDate = new Date(purchaseDate).toISOString().split("T")[0];

  // Clean buyer name (remove special characters for filename)
  const cleanBuyerName =
    buyerName.replace(/[^a-zA-Z0-9\s]/g, "").trim() || "customer";

  // Format: receipt.ejpeace - nama pembeli - tanggal.pdf
  const filename = `receipt.ejpeace - ${cleanBuyerName} - ${formattedDate}.pdf`;

  // Create a blob URL and trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return true;
};
