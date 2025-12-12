import { api } from "./apiClient";

/**
 * Get all order addresses for the current user
 * @returns {Promise} List of user's order addresses
 */
export const getUserOrderAddresses = async () => {
  try {
    const response = await api.get("/order-addresses/my-addresses");
    return response.data;
  } catch (error) {
    console.error("Error fetching user order addresses:", error);
    throw error;
  }
};

/**
 * Get specific order address by purchase ID
 * @param {number} purchaseId - Purchase ID
 * @returns {Promise} Order address details
 */
export const getOrderAddressById = async (purchaseId) => {
  try {
    const response = await api.get(`/order-addresses/${purchaseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order address ${purchaseId}:`, error);
    throw error;
  }
};
