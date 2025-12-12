import { api } from "./apiClient";

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
