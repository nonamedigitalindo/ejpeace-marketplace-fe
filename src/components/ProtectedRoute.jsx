import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // Pass the current location so login can redirect back after success
    return <Navigate to="/ejpeace/login" state={{ from: location }} replace />;
  }
  return children;
}

export default ProtectedRoute;
