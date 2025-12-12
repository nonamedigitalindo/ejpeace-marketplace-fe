import { api } from "./apiClient";

// GET ALL CART
export const getCart = async () => {
  console.log("getCart - Starting request");
  const res = await api.get("/cart");
  console.log("getCart - Response:", res);
  return res.data;
};

// ADD TO CART
export const addToCart = async (data) => {
  console.log("addToCart - Starting request with data:", data);
  const res = await api.post("/cart", data);
  console.log("addToCart - Response:", res);
  return res.data;
};

// UPDATE CART ITEM QUANTITY
export const updateCartItem = async (id, data) => {
  console.log(
    `updateCartItem - Starting request for id ${id} with data:`,
    data
  );
  const res = await api.put(`/cart/${id}`, data);
  console.log("updateCartItem - Response:", res);
  return res.data;
};

// REMOVE CART ITEM
export const removeCartItem = async (id) => {
  console.log(`removeCartItem - Starting request for id ${id}`);
  const res = await api.delete(`/cart/${id}`);
  console.log("removeCartItem - Response:", res);
  return res.data;
};

// CLEAR ENTIRE CART
export const clearCart = async () => {
  console.log("clearCart - Starting request");
  const res = await api.delete("/cart");
  console.log("clearCart - Response:", res);
  return res.data;
};
