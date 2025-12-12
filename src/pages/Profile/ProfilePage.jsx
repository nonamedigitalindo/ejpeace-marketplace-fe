import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../../api/user";
import { getUserPurchases } from "../../api/purchase"; // Menambahkan API untuk mendapatkan pembelian
import UserInfoSection from "../../components/Profile/UserInfoSection";
import OrderHistorySection from "../../components/Profile/OrderHistorySection";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info"); // "info" | "orders"
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // First, check if we have user data in localStorage
      const storedUser = localStorage.getItem("user");
      console.log("Stored user in localStorage:", storedUser);

      // Parse stored user if it exists
      let parsedStoredUser = null;
      if (storedUser) {
        try {
          parsedStoredUser = JSON.parse(storedUser);
          console.log("Parsed stored user:", parsedStoredUser);
        } catch (parseError) {
          console.error("Error parsing stored user:", parseError);
        }
      }

      // Set user from localStorage immediately while we check API
      if (parsedStoredUser) {
        setUser(parsedStoredUser);
      }

      // Try to fetch from API to get latest data
      console.log("Fetching user profile and orders...");

      // Check if token exists
      const token = localStorage.getItem("token");
      console.log("Auth token:", token ? "Present" : "Missing");

      if (!token) {
        console.log("No token found, using localStorage data only");
        setLoading(false);
        return;
      }

      // Mengganti getUserOrders dengan getUserPurchases untuk mendapatkan data pembelian yang benar
      const [profileRes, purchasesRes] = await Promise.allSettled([
        getUserProfile(),
        getUserPurchases(), // Menggunakan API pembelian yang benar
      ]);

      console.log("Profile result:", profileRes);
      console.log("Purchases result:", purchasesRes);

      // Handle user profile
      if (profileRes.status === "fulfilled") {
        console.log("Profile data:", profileRes.value.data || profileRes.value);
        const apiUser =
          profileRes.value.data?.data ||
          profileRes.value.data ||
          profileRes.value;
        console.log("Processed profile data:", apiUser);
        setUser(apiUser);
        // Update localStorage with latest data from API
        localStorage.setItem("user", JSON.stringify(apiUser));
      } else {
        console.log("Profile fetch failed:", profileRes.reason);
        // If API fails but we already have user data from localStorage, keep it
        console.log("Keeping localStorage user data");
      }

      // Handle purchases (mengganti orders)
      if (purchasesRes.status === "fulfilled") {
        console.log("Purchases data:", purchasesRes.value);
        // Handle different response formats
        const purchasesData = Array.isArray(purchasesRes.value)
          ? purchasesRes.value
          : purchasesRes.value?.data || [];
        console.log("Processed purchases data:", purchasesData);
        setOrders(purchasesData);
      } else {
        console.log("Purchases fetch failed:", purchasesRes.reason);
        // Set empty array if purchases fetch failed
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback to localStorage for user
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log(
            "Using user from localStorage (error fallback):",
            parsedUser
          );
          setUser(parsedUser);
        } catch (parseError) {
          console.error(
            "Error parsing stored user in error fallback:",
            parseError
          );
        }
      }
      // Set empty array for orders in case of error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    // Update localStorage as well
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  if (loading && !user) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="mb-6">You need to be logged in to view your profile</p>
        <button
          onClick={() => navigate("/ejpeace/login")}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold">My Account</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border p-3 rounded-lg bg-white border-gray-200 shadow-md">
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === "info"
                ? "border-b-2 border-black text-black rounded"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === "orders"
                ? "border-b-2 border-black text-black rounded"
                : "text-gray-500 hover:text-black"
            }`}
          >
            Order History
          </button>
        </div>

        {/* Content */}
        {activeTab === "info" && (
          <UserInfoSection user={user} onUpdateUser={handleUpdateUser} />
        )}
        {activeTab === "orders" && <OrderHistorySection orders={orders} />}
      </div>
    </div>
  );
}
