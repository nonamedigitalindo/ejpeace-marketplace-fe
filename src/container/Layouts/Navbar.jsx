import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
// import { useCart } from "../../hooks/useCart";
import useAppStore from "../../stores/useAppStore";
// import { getProducts } from "../../api/product"; // <-- INTEGRASI API

export default function Navbar() {
  const [open, setOpen] = useState(false);

  console.log("Navbar - Rendering");

  // const { cartItems } = useCart();
  const { cartItems, setIsOpen, loadCartFromDatabase } = useAppStore();
  const navigate = useNavigate();

  console.log("Navbar - cartItems:", cartItems);

  // Load cart when navbar mounts
  useEffect(() => {
    console.log("Navbar - useEffect triggered");
    loadCartFromDatabase();
  }, [loadCartFromDatabase]);

  // 🔥 FETCH DATA PRODUK DARI API SAAT COMPONENT LOAD
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await getProducts();
  //       setProducts(data);
  //     } catch (error) {
  //       console.error("Gagal memuat produk:", error);
  //    }
  //   };
  //   fetchData();
  // }, []);

  // HITUNG TOTAL ITEM DALAM CART
  const totalItems = Array.isArray(cartItems)
    ? cartItems.reduce(
        (total, item) => total + (parseInt(item.qty || item.quantity) || 1),
        0
      )
    : 0;

  const handleProfileClick = () => {
    const token = localStorage.getItem("token");
    navigate(token ? "/ejpeace/profile" : "/ejpeace/login");
  };

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-black/60 backdrop-blur-md text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link
          to="/ejpeace/home"
          className="text-lg md:text-xl font-bold tracking-wide"
        >
          EJPEACE ENTERTAINMENT
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/ejpeace/home" className="hover:text-yellow-400">
            HOME
          </Link>
          <Link to="/ejpeace/division" className="hover:text-yellow-400">
            DIVISION
          </Link>
          <Link to="/ejpeace/store" className="hover:text-yellow-400">
            STORE
          </Link>
          <Link to="/ejpeace/event" className="hover:text-yellow-400">
            EVENT
          </Link>
          {/* <Link to="/ejpeace/about" className="hover:text-yellow-400">
            ABOUT
          </Link> */}
        </nav>

        {/* DESKTOP ICONS */}
        <div className="hidden md:flex items-center gap-6 text-xl">
          <button
            onClick={() => {
              console.log("Navbar - Opening cart sidebar");
              setIsOpen(true);
            }}
            className="relative"
          >
            <FiShoppingCart className="hover:text-yellow-400" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          <button onClick={handleProfileClick}>
            <FiUser className="hover:text-yellow-400" />
          </button>
        </div>

        {/* MOBILE MENU ICON */}
        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-black/90 backdrop-blur-sm text-white px-6 py-4 space-y-2">
          {[
            ["Home", "/ejpeace/home"],
            ["Division", "/ejpeace/division"],
            ["Store", "/ejpeace/store"],
            ["Event", "/ejpeace/event"],
            // ["About", "/ejpeace/about"],
          ].map(([label, link], idx) => (
            <Link
              key={idx}
              to={link}
              onClick={() => setOpen(false)}
              className="block py-2 border-b border-white/10"
            >
              {label}
            </Link>
          ))}

          <div className="flex items-center gap-6 pt-4 text-2xl">
            <button
              onClick={() => {
                setIsOpen(true);
                setOpen(false);
              }}
              className="relative"
            >
              <FiShoppingCart />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setOpen(false);
                handleProfileClick();
              }}
            >
              <FiUser />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
