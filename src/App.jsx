import { Routes, Route, useEffect } from "react-router-dom";
import useAppStore from "./stores/useAppStore";

// User Layout Components
import Navbar from "./container/Layouts/Navbar";
import Footer from "./container/Layouts/Footer";

// Pages (User)
import HomePage from "./pages/HomePage/page";
import EventPage from "./components/Event/EventPage";
import StorePage from "./pages/Store/StorePage";
import ProductDetailPage from "./pages/Store/ProductDetailPage";
import DivisionPage from "./pages/Division/page";
import CheckoutPage from "./pages/Store/payment/CheckoutFormPage";
import OrderSuccessPage from "./pages/Store/payment/OrderSuccessPage";
import ProfilePage from "./pages/Profile/page";
import PurchaseHistory from "./pages/Profile/PurchaseHistory";
import PurchaseDetail from "./pages/Profile/PurchaseDetail";

// Admin
import AdminLayout from "./components/AdminLayout/AdminLayout";
import AdminPage from "./pages/Admin/AdminPage";
import AdminProducts from "./pages/Admin/AdminProductsPage";
import CreateProduct from "./pages/Admin/CreateProductPage";
import EditProduct from "./pages/Admin/EditProductPage";
import AdminOrder from "./pages/Admin/AdminOrderPage";
import Dashboard from "./pages/Admin/Dashboard";

export default function App() {
  const { loadCartFromDatabase } = useAppStore();

  useEffect(() => {
    // Load cart items from database when app starts
    // Only load if user is logged in (has token)
    const loadCart = async () => {
      console.log("App start - Checking for token...");
      // Small delay to ensure token is properly set
      await new Promise((resolve) => setTimeout(resolve, 100));
      const token = localStorage.getItem("token");
      console.log("App start - Token found:", !!token);
      if (token) {
        try {
          console.log("App start - Loading cart from database...");
          await loadCartFromDatabase();
          console.log("App start - Cart loaded successfully");
        } catch (error) {
          console.error("Failed to load cart on app start:", error);
        }
      } else {
        console.log("App start - No token, clearing cart");
        // Clear cart items if no token
        useAppStore.getState().set({ cartItems: [] });
      }
    };

    loadCart();
  }, []); // Run only once on mount

  // Also listen for token changes to reload cart when user logs in
  useEffect(() => {
    const handleStorageChange = (e) => {
      console.log(
        "App - handleStorageChange called, key:",
        e.key,
        "newValue:",
        e.newValue
      );
      if (e.key === "token") {
        if (e.newValue) {
          // User logged in, load cart
          console.log("App - User logged in, loading cart");
          loadCartFromDatabase();
        } else {
          // User logged out, clear cart
          console.log("App - User logged out, clearing cart");
          useAppStore.getState().clearCart();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadCartFromDatabase]);

  // Reload cart when window gains focus to ensure data is up to date
  useEffect(() => {
    const handleFocus = async () => {
      console.log("App - handleFocus called");
      const token = localStorage.getItem("token");
      console.log("App - handleFocus token:", token);
      if (token) {
        try {
          console.log("App - handleFocus loading cart");
          await loadCartFromDatabase();
        } catch (error) {
          console.error("Failed to reload cart on focus:", error);
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadCartFromDatabase]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-white">
      {/* USER LAYOUT (tidak tampil di Admin) */}
      <Routes>
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/ejpeace/home" element={<HomePage />} />
                  <Route path="/ejpeace/division" element={<HomePage />} />

                  {/* EVENT */}
                  <Route path="/ejpeace/event" element={<EventPage />} />
                  <Route
                    path="/ejpeace/event/:id"
                    element={<ProductDetailPage />}
                  />

                  {/* STORE */}
                  <Route path="/ejpeace/store" element={<StorePage />} />
                  <Route
                    path="/ejpeace/store/product/:id"
                    element={<ProductDetailPage />}
                  />
                  <Route
                    path="/ejpeace/checkout-form"
                    element={<CheckoutPage />}
                  />
                  <Route
                    path="/ejpeace/store/success"
                    element={<OrderSuccessPage />}
                  />

                  {/* PROFILE */}
                  <Route path="/ejpeace/profile" element={<ProfilePage />} />
                  <Route
                    path="/ejpeace/purchase-history"
                    element={<PurchaseHistory />}
                  />
                  <Route
                    path="/ejpeace/purchase/:id"
                    element={<PurchaseDetail />}
                  />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />

        {/* ADMIN LAYOUT */}
        <Route
          path="/ejpeace/internal/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="/admin-page" element={<AdminPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin-products" element={<AdminProducts />} />
                <Route path="/create-product" element={<CreateProduct />} />
                <Route path="/edit-product/:id" element={<EditProduct />} />
                <Route path="/admin-order" element={<AdminOrder />} />
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>
    </div>
  );
}
