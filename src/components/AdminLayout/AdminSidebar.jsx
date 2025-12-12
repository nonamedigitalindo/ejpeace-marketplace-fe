// AdminSidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const { pathname } = useLocation();
  const [productDropdown, setProductDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => navigate("/ejpeace/login");

  useEffect(() => {
    if (
      pathname.includes("admin-products") ||
      pathname.includes("create-product") ||
      pathname.includes("edit-product")
    ) {
      setProductDropdown(true);
    }
  }, [pathname]);

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#333333] text-white flex flex-col
          transition-all duration-300 z-50 shadow-lg
          w-64
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <span className="font-bold text-xl">Admin Panel</span>
          {/* Mobile close */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setMobileOpen(false)}
          >
            <FiX />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col gap-1 flex-grow overflow-y-auto pb-4">
          <SidebarLink
            label="Home"
            short="H"
            to="/ejpeace/internal/admin-page"
            active={pathname === "/ejpeace/internal/admin-page"}
          />
          <SidebarLink
            label="Dashboard"
            short="D"
            to="/ejpeace/internal/dashboard"
            active={pathname === "/ejpeace/internal/dashboard"}
          />

          {/* Product Dropdown */}
          <div>
            <button
              onClick={() => setProductDropdown(!productDropdown)}
              className={`w-full flex justify-between items-center py-3 px-4 rounded hover:bg-[#706C61] transition
                ${
                  pathname.includes("admin-products") ||
                  pathname.includes("edit-product") ||
                  pathname.includes("create-product")
                    ? "bg-[#706C61]"
                    : ""
                }
              `}
            >
              Products
              {productDropdown ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                productDropdown ? "max-h-40" : "max-h-0"
              } ml-2`}
            >
              <SidebarLink
                label="List Product"
                short="L"
                to="/ejpeace/internal/admin-products"
                active={pathname === "/ejpeace/internal/admin-products"}
              />
              <SidebarLink
                label="Create Product"
                short="C"
                to="/ejpeace/internal/create-product"
                active={pathname === "/ejpeace/internal/create-product"}
              />
            </div>
          </div>

          <SidebarLink
            label="Orders"
            short="O"
            to="/ejpeace/internal/admin-order"
            active={pathname === "/ejpeace/internal/admin-order"}
          />
          <SidebarLink
            label="Users"
            short="U"
            to="/ejpeace/internal/users"
            active={pathname === "/ejpeace/internal/users"}
          />
          <SidebarLink
            label="Events"
            short="E"
            to="/ejpeace/internal/event"
            active={pathname === "/ejpeace/internal/events"}
          />
          <SidebarLink
            label="Vouchers"
            short="E"
            to="/ejpeace/internal/voucher"
            active={pathname === "/ejpeace/internal/voucher"}
          />
        </nav>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 transition p-2 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ label, to, active }) {
  return (
    <Link
      to={to}
      className={`block py-2 px-4 rounded transition
        ${active ? "bg-[#706C61] font-semibold" : "hover:bg-[#706C61]"}
      `}
    >
      {label}
    </Link>
  );
}
