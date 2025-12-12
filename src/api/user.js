import { api } from "./apiClient";

console.log("API Base URL:", api.defaults.baseURL);

/**
 * Get current logged-in user profile
 * @returns {Promise} User profile data
 */
export const getUserProfile = () => {
  console.log("Fetching user profile...");
  return api.get("/users/me");
};

/**
 * Get all users (for admin)
 * @returns {Promise} List of all users
 */
export const getUsers = async () => {
  try {
    console.log("Fetching all users...");
    const response = await api.get("/users");
    console.log("Users response:", response);
    // Handle different response formats: some backends return
    // - response.data (array)
    // - response.data.data (array)
    // - response.data.users (array)
    // - response.data.results (array)
    // provide a tolerant fallback to return an array where possible
    return (
      response.data?.data ||
      response.data?.users ||
      response.data?.results ||
      response.data ||
      []
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Get specific user by ID
 * @param {number} userId - User ID
 * @returns {Promise} User details
 */
export const getUserById = async (userId) => {
  try {
    console.log(`Fetching user ${userId}...`);
    const response = await api.get(`/users/${userId}`);
    console.log(`User ${userId} response:`, response);
    // Handle different response formats
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} userData - User profile data to update
 * @returns {Promise} Updated user profile
 */
export const updateUserProfile = async (userData) => {
  try {
    console.log("Updating user profile...", userData);
    const response = await api.put("/users/me", userData);
    console.log("Profile update response:", response);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Update user data (for admin)
 * @param {number} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise} Updated user data
 */
export const updateUser = async (userId, userData) => {
  try {
    console.log(`Updating user ${userId}...`, userData);
    const response = await api.put(`/users/${userId}`, userData);
    console.log(`User ${userId} update response:`, response);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

/**
 * Delete user (for admin)
 * @param {number} userId - User ID
 * @returns {Promise} Response from delete operation
 */
export const deleteUser = async (userId) => {
  try {
    console.log(`Deleting user ${userId}...`);
    const response = await api.delete(`/users/${userId}`);
    console.log(`User ${userId} delete response:`, response);
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

/**
 * Update user password
 * @param {Object} passwordData - Current and new password
 * @param {string} userId - User ID
 * @returns {Promise} Response from password update
 */
export const updateUserPassword = async (passwordData, userId) => {
  try {
    console.log("Updating user password...", passwordData);
    const response = await api.put(
      `/auth/change-password/${userId}`,
      passwordData
    );
    console.log("Password update response:", response);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error updating user password:", error);
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise} Response from logout
 */
export const logoutUser = async () => {
  try {
    console.log("Logging out user...");
    const response = await api.post("/auth/logout");
    console.log("Logout response:", response);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error logging out user:", error);
    throw error;
  }
};

/**
 * Get user's purchase/order history
 * @returns {Promise} List of user's purchases
 */
export const getUserOrders = async () => {
  try {
    console.log("Fetching user purchases...");
    const response = await api.get("/purchases");
    console.log("Purchases response:", response);
    // Handle different response formats
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching user purchases:", error);
    throw error;
  }
};

/**
 * Get specific order details by ID
 * @param {number} orderId - Order ID
 * @returns {Promise} Order details
 */
export const getOrderById = async (orderId) => {
  try {
    console.log(`Fetching purchase detail ${orderId}...`);
    const response = await api.get(`/purchases/${orderId}/detail`);
    console.log(`Purchase detail ${orderId} response:`, response);
    // Handle different response formats
    return response.data?.data || response.data;
  } catch (error) {
    console.error(`Error fetching purchase detail ${orderId}:`, error);
    throw error;
  }
};
