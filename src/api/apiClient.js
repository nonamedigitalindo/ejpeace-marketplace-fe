import axios from "axios";

// Base URL untuk API
// In development, use relative URL to leverage Vite's proxy
// In production, this should be set to the actual backend URL

// Base URL untuk images
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "";

// Export BASE_URL for components that need it for image URLs
export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getBaseURL = () => {
  // Always use production server
  return `${BASE_URL}/api/v1`;
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("API Request:", config.method?.toUpperCase(), config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token added to request");
    } else {
      console.log("No token found for request");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log("API Error:", error.response?.status, error.config?.url);

    const originalRequest = error.config;

    // Attempt token refresh on 401 responses (single retry)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // Use axios directly to avoid interceptor recursion
          const refreshResponse = await axios.post(`${getBaseURL()}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const newToken =
            refreshResponse.data?.token || refreshResponse.data?.access_token;

          if (newToken) {
            localStorage.setItem("token", newToken);
            // Update header and retry original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          console.warn("Token refresh failed:", refreshErr);
          // fall through to clear session
        }
      }

      // If we couldn't refresh, clear tokens and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      try {
        window.location.href = "/ejpeace/login";
      } catch (e) {
        console.warn("Could not redirect to login after 401", e);
      }
    }

    return Promise.reject(error);
  }
);
