import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../container/Layouts/MainLayout";

import Login from "../pages/Login/page";
import ErrorBoundary from "../components/ErrorBoundary";
import ProtectedRoute from "../components/ProtectedRoute";

// Main pages
import HomePage from "../pages/HomePage/page";
import EventPage from "../pages/Event/page";
import AboutPage from "../pages/AboutPage/page";

// Division pages
import DivisionPage from "../pages/Division/page";

// Store pages
import StorePage from "../pages/Store/StorePage";
import ProductDetailPage from "../pages/Store/ProductDetailPage";
import ProfilePage from "../pages/Profile/ProfilePage";

// Payment pages
import CheckoutFormPage from "../pages/Store/payment/CheckoutFormPage";
import OrderSuccessPage from "../pages/Store/payment/OrderSuccessPage";
import PaymentPage from "../pages/Store/payment/PaymentPage";
import PaymentFailurePage from "../pages/Store/payment/PaymentFailurePage";
import OrderDetailPage from "../pages/Store/payment/OrderDetailPage";
import QRScanPage from "../pages/Store/payment/QRScanPage";

// Event pages
import TicketPurchasePage from "../pages/Event/TicketPurchasePage";
import PaymentCallbackPage from "../pages/Event/PaymentCallbackPage";

// Purchase pages
import PurchaseHistory from "../pages/Profile/PurchaseHistory";
import PurchaseDetail from "../pages/Profile/PurchaseDetail";

// Cart
import CartSidebar from "../container/Layouts/CartSidebar";

// Admin pages
import AdminLayout from "../components/AdminLayout/AdminLayout";
import AdminPage from "../pages/Admin/AdminPage";
import AdminProducts from "../pages/Admin/AdminProductsPage";
import CreateProduct from "../pages/Admin/CreateProductPage";
import EditProduct from "../pages/Admin/EditProductPage";
import AdminOrder from "../pages/Admin/AdminOrderPage";
import Dashboard from "../pages/Admin/Dashboard";
import UserPage from "../pages/Admin/CreateUserPage";
import AdminEventPage from "../pages/Admin/CreateEventPage";
import CreateVoucher from "../pages/Admin/CreateVoucher";

const route = createBrowserRouter([
  // Redirect awal ke home
  {
    path: "/",
    element: <Navigate to="/ejpeace/home" replace />,
  },

  // Login
  {
    path: "/ejpeace/login",
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },

  // USER AREA
  {
    path: "/ejpeace",
    element: (
      <>
        <MainLayout />
        <CartSidebar />
      </>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { path: "home", element: <HomePage /> },
      { path: "division", element: <DivisionPage /> },
      { path: "event", element: <EventPage /> },
      { path: "about", element: <AboutPage /> },

      // STORE — protected
      {
        path: "store",
        element: (
          // <ProtectedRoute>
          <StorePage />
          // </ProtectedRoute>
        ),
      },

      {
        path: "store/product/:id",
        element: (
          // <ProtectedRoute>
          <ProductDetailPage />
          // </ProtectedRoute>
        ),
      },

      {
        path: "checkout-form",
        element: (
          <ProtectedRoute>
            <CheckoutFormPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "payment",
        element: (
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "order-success",
        element: (
          <ProtectedRoute>
            <OrderSuccessPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },

      {
        path: "purchase-history",
        element: (
          <ProtectedRoute>
            <PurchaseHistory />
          </ProtectedRoute>
        ),
      },

      {
        path: "purchase/:id",
        element: (
          <ProtectedRoute>
            <PurchaseDetail />
          </ProtectedRoute>
        ),
      },

      // Add route for order detail page
      {
        path: "order/:id",
        element: (
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        ),
      },

      // Add route for QR scan page (public, no protection needed)
      {
        path: "qr-scan",
        element: <QRScanPage />,
      },

      // event purchase protected
      {
        path: "event/ticket-purchase",
        element: (
          <ProtectedRoute>
            <TicketPurchasePage />
          </ProtectedRoute>
        ),
      },

      {
        path: "event/payment-callback",
        element: (
          <ProtectedRoute>
            <PaymentCallbackPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // PAYMENT CALLBACK
  {
    path: "/payment/success",
    element: (
      <>
        <MainLayout />
        <CartSidebar />
      </>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <OrderSuccessPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    path: "/payment/failure",
    element: (
      <>
        <MainLayout />
        <CartSidebar />
      </>
    ),
    errorElement: <ErrorBoundary />,
    children: [{ index: true, element: <PaymentFailurePage /> }],
  },

  // ADMIN AREA
  {
    path: "/ejpeace/internal",
    element: <AdminLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: "admin-page", element: <AdminPage /> },
      { path: "admin-products", element: <AdminProducts /> },
      { path: "create-product", element: <CreateProduct /> },
      { path: "edit-product/:id", element: <EditProduct /> },
      { path: "admin-order", element: <AdminOrder /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "users", element: <UserPage /> },
      { path: "event", element: <AdminEventPage /> },
      { path: "voucher", element: <CreateVoucher /> },
    ],
  },
]);

export default route;
