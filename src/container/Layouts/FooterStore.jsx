import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-black text-white text-center py-12">

      {/* MENU */}
      <div className="flex justify-center gap-10 text-sm mb-6 uppercase">
        <Link to="/about" className="hover:underline">About</Link>
        <Link to="/contact" className="hover:underline">Contact</Link>
        <Link to="/terms" className="hover:underline">Terms & Policy</Link>
        <Link to="/faq" className="hover:underline">FAQ</Link>
      </div>

      {/* SOCIAL ICONS */}
      <div className="flex justify-center gap-6 text-xl mb-6">
        <i className="fa-brands fa-instagram cursor-pointer hover:scale-110 transition"></i>
        <i className="fa-brands fa-tiktok cursor-pointer hover:scale-110 transition"></i>
        <i className="fa-brands fa-youtube cursor-pointer hover:scale-110 transition"></i>
      </div>

      {/* COPYRIGHT */}
      <p className="text-xs opacity-70">
        © 2025 EJPEACE — All Rights Reserved.
      </p>
    </footer>
  );
}
