import { api } from "./apiClient";

export const payment = async (data) => {
  const res = await api.post("/tickets/payment", data);
  return res.data;
}