import { api } from "./apiClient";

// REGISTER (sudah benar)
export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

// LOGIN (baru ditambahkan)
export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};
