import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import { useState, useEffect } from "react";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false); 
  }, [pathname]);

  return (
    <div className="flex w-full min-h-screen">
      {/* SIDEBAR */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* BACKDROP MOBILE */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* MAIN */}
      <main
        className={`
          flex-1 min-h-screen bg-[#E1F4F3] flex flex-col transition-all duration-300
          ${mobileOpen ? "opacity-40" : "opacity-100"}
          md:ml-64 
        `}
      >
        <div className="p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>

        <AdminFooter />
      </main>
    </div>
  );
}
