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
    <div className="flex w-full min-h-screen font-sans bg-[#fffbeb]">
      {/* SIDEBAR */}
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* BACKDROP MOBILE */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* MAIN */}
      <main
        className={`
          flex-1 min-h-screen flex flex-col transition-all duration-300
          ${mobileOpen ? "opacity-40" : "opacity-100"}
          md:ml-72 
        `}
      >
        <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto">
          {/* Top aesthetic accent/gradient (optional) */}
           <div className="hidden md:block absolute top-0 right-0 w-1/3 h-64 bg-gradient-to-b from-yellow-200/20 to-transparent pointer-events-none rounded-bl-full" />
          
          <Outlet />
        </div>

        <AdminFooter />
      </main>
    </div>
  );
}
