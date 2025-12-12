import { api } from "./apiClient";

// GET ALL PRODUCTS
export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

// GET PRODUCT BY ID
export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

// ADD PRODUCT (multipart/form-data)
export const addProduct = async (formData) => {
  const res = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// UPDATE PRODUCT (multipart/form-data)
export const updateProduct = async (id, formData) => {
  const res = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// DELETE PRODUCT
export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};
