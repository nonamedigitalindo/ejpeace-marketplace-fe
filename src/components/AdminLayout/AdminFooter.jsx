import React from "react";

export default function AdminFooter() {
  return (
    <footer className="w-full bg-white border-t py-4 px-6 flex items-center justify-between text-sm text-gray-600">
      <p>© {new Date().getFullYear()}  © 2025 EJPEACE — All Rights Reserved.</p>

      <div className="flex items-center gap-4">
        <a 
          href="#"
          className="hover:text-gray-900 transition"
        >
          Privacy Policy
        </a>
        <span>|</span>
        <a 
          href="#"
          className="hover:text-gray-900 transition"
        >
          Terms & Conditions
        </a>
      </div>
    </footer>
  );
}
