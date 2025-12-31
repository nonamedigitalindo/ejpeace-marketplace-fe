import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/Division/ENT.png";

// IMPORT API
import { loginUser, registerUser } from "../../api/auth";
import { getUserProfile } from "../../api/user";

export default function AuthCard({ isRegister: isRegisterProp = false }) {
  const location = useLocation();
  const isRegisterFromProp = isRegisterProp;
  const isRegisterFromState = location.state?.isRegister;
  const [isRegister, setIsRegister] = useState(
    isRegisterFromProp || isRegisterFromState || false
  );
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const handleLoginChange = (e) =>
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  const handleRegisterChange = (e) =>
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

  // Show alert function
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" });
    }, 3000);
  };

  // ==========================================
  //                  LOGIN
  // ==========================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser({
        email: loginForm.email,
        password: loginForm.password,
      });

      console.log("LOGIN SUCCESS:", response);

      // Store token in localStorage
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);

        // Try to get and store user profile data
        try {
          const profileResponse = await getUserProfile();
          const userData = profileResponse.data || profileResponse;
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          // If we can't fetch profile, at least store basic user info if available
          if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        }
      }

      showAlert("success", "Login berhasil!");
      // setTimeout(() => {
      if (response.data.user.role === "admin") {
        navigate("/ejpeace/internal");
        return;
      } else {
        // Redirect back to previous page or default to home
        const from = location.state?.from?.pathname || "/ejpeace/store";
        if (from === "/ejpeace/checkout-form") {
          navigate("/ejpeace/store");
          return;
        }
        navigate(from, { replace: true });
        return;
      }
      // }, 1500);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      showAlert("error", error.message || "Login gagal!");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  //                REGISTER
  // ==========================================
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        phone: registerForm.phone,
        address: registerForm.address,
      });

      showAlert("success", "Register berhasil! Silakan login.");
      setTimeout(() => {
        setRegisterForm({
          username: "",
          email: "",
          password: "",
          phone: "",
          address: "",
        });
        setIsRegister(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      showAlert("error", err.response?.data?.message || "Gagal register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-4">
      {/* Custom Alert */}
      {alert.show && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn ${alert.type === "success"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
            }`}
        >
          <div className="flex items-center">
            {alert.type === "success" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span>{alert.message}</span>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4 relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex flex-col items-center justify-center z-50">
            <div className="relative">
              <img
                src={logo}
                alt="Loading"
                className="w-16 h-16 animate-pulse"
              />
              <div className="absolute inset-0 rounded-full border-4 border-t-green-500 border-r-green-500 border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            <p className="text-white mt-4 font-medium">Loading...</p>
          </div>
        )}

        <img src={logo} alt="logo" className="w-24 h-24 mx-auto" />
        <h1 className="text-3xl font-bold text-center">
          {isRegister ? "Register" : "Login"}
        </h1>

        {/* REGISTER */}
        {isRegister ? (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={registerForm.username}
              onChange={handleRegisterChange}
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              required
              disabled={loading}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={handleRegisterChange}
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              required
              disabled={loading}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={registerForm.phone}
              onChange={handleRegisterChange}
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              required
              disabled={loading}
            />
            <textarea
              name="address"
              placeholder="Address"
              value={registerForm.address}
              onChange={handleRegisterChange}
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              rows="3"
              disabled={loading}
            />

            <button
              className="bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </>
              ) : (
                "Register"
              )}
            </button>

            <p className="text-sm text-gray-600 text-center">
              Sudah punya akun?{" "}
              <button
                type="button"
                className="text-green-600 font-medium hover:underline"
                onClick={() => setIsRegister(false)}
                disabled={loading}
              >
                Login
              </button>
            </p>
          </form>
        ) : (
          // LOGIN
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={handleLoginChange}
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={handleLoginChange}
              className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              required
              disabled={loading}
            />

            <button
              className="bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </>
              ) : (
                "Login"
              )}
            </button>

            <p className="text-sm text-gray-600 text-center">
              Belum punya akun?{" "}
              <button
                type="button"
                className="text-green-600 font-medium hover:underline"
                onClick={() => setIsRegister(true)}
                disabled={loading}
              >
                Register
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
