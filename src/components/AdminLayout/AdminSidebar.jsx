// AdminSidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaBox, FaChartLine, FaClipboardList, FaUsers, FaTags, FaTicketAlt } from "react-icons/fa";
import { FiX, FiLogOut, FiHome } from "react-icons/fi";

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const { pathname } = useLocation();
  const [productDropdown, setProductDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => navigate("/ejpeace/login");

  useEffect(() => {
    if (
      pathname.includes("admin-products") ||
      pathname.includes("create-product") ||
      pathname.includes("edit-product") ||
      pathname.includes("product-alerts")
    ) {
      setProductDropdown(true);
    }
  }, [pathname]);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#111827] text-gray-300 flex flex-col
          transition-all duration-300 z-50 shadow-2xl
          w-72 border-r border-gray-800
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-gray-800 bg-[#0f1523]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black font-bold text-xl">
              P
            </div>
            <span className="font-bold text-xl text-white tracking-wide">eJPeace</span>
          </div>
          {/* Mobile close */}
          <button
            className="md:hidden text-2xl text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <FiX />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex flex-col gap-2 flex-grow overflow-y-auto px-4 pb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Main Menu</p>

          <SidebarLink
            label="Home"
            icon={<FiHome />}
            to="/ejpeace/internal/admin-page"
            active={pathname === "/ejpeace/internal/admin-page"}
          />
          <SidebarLink
            label="Dashboard"
            icon={<FaChartLine />}
            to="/ejpeace/internal/dashboard"
            active={pathname === "/ejpeace/internal/dashboard"}
          />

          {/* Product Dropdown */}
          <div className="mt-2">
            <button
              onClick={() => setProductDropdown(!productDropdown)}
              className={`w-full flex justify-between items-center py-3 px-4 rounded-xl transition-all duration-200 group
                ${pathname.includes("admin-products") ||
                  pathname.includes("edit-product") ||
                  pathname.includes("create-product") ||
                  pathname.includes("product-alerts")
                  ? "bg-gray-800 text-white"
                  : "hover:bg-gray-800/50 hover:text-white"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <FaBox className={`${pathname.includes("admin-products") ? "text-yellow-500" : "text-gray-400 group-hover:text-yellow-400"}`} />
                <span className="font-medium">Products</span>
              </div>
              {productDropdown ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${productDropdown ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
                } ml-4 border-l border-gray-700 pl-2 space-y-1`}
            >
              <SidebarLink
                label="List Product"
                to="/ejpeace/internal/admin-products"
                active={pathname === "/ejpeace/internal/admin-products"}
                isSubItem
              />
              <SidebarLink
                label="Create Product"
                to="/ejpeace/internal/create-product"
                active={pathname === "/ejpeace/internal/create-product"}
                isSubItem
              />
              <SidebarLink
                label="Product Alerts"
                to="/ejpeace/internal/product-alerts"
                active={pathname === "/ejpeace/internal/product-alerts"}
                isSubItem
              />
            </div>
          </div>

          <SidebarLink
            label="Orders"
            icon={<FaClipboardList />}
            to="/ejpeace/internal/admin-order"
            active={pathname === "/ejpeace/internal/admin-order"}
          />
          <SidebarLink
            label="Users"
            icon={<FaUsers />}
            to="/ejpeace/internal/users"
            active={pathname === "/ejpeace/internal/users"}
          />

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2 px-2">Content</p>

          <SidebarLink
            label="Events"
            icon={<FaTicketAlt />}
            to="/ejpeace/internal/event"
            active={pathname === "/ejpeace/internal/events"}
          />
          <SidebarLink
            label="Vouchers"
            icon={<FaTags />}
            to="/ejpeace/internal/voucher"
            active={pathname === "/ejpeace/internal/voucher"}
          />
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800 bg-[#0f1523]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white transition py-3 rounded-xl text-sm font-semibold shadow-lg shadow-red-900/20"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ label, icon, to, active, isSubItem }) {
  if (isSubItem) {
    return (
      <Link
        to={to}
        className={`block py-2 px-4 rounded-lg transition-all text-sm
          ${active
            ? "text-yellow-400 font-medium bg-gray-800/50 translate-x-1"
            : "text-gray-400 hover:text-white hover:translate-x-1"
          }
        `}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 group
        ${active
          ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 font-bold"
          : "hover:bg-gray-800 hover:text-white"
        }
      `}
    >
      <span className={`text-lg ${active ? "text-black" : "text-gray-400 group-hover:text-yellow-400"}`}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
