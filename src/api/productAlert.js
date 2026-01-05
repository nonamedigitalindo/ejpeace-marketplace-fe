import { api } from "./apiClient";

// Get all product alerts
export const getProductAlerts = async () => {
    try {
        const response = await api.get("/product-alerts");
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to fetch product alerts";
    }
};

// Create product alert
export const createProductAlert = async (data) => {
    try {
        const response = await api.post("/product-alerts", data);
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to create product alert";
    }
};

// Update product alert
export const updateProductAlert = async (id, data) => {
    try {
        const response = await api.put(`/product-alerts/${id}`, data);
        return response.data.data;
    } catch (error) {
        throw error.response?.data?.message || "Failed to update product alert";
    }
};

// Delete product alert
export const deleteProductAlert = async (id) => {
    try {
        await api.delete(`/product-alerts/${id}`);
        return true;
    } catch (error) {
        throw error.response?.data?.message || "Failed to delete product alert";
    }
};
