import useAppStore from "../stores/useAppStore";
import { useNavigate } from "react-router-dom";

export default function CartIndicator() {
  const { cartItems, setIsOpen } = useAppStore();
  const navigate = useNavigate();

  console.log("CartIndicator - Rendering");
  console.log("CartIndicator - cartItems from store:", cartItems);

  // Calculate total items in cart
  const totalItems = Array.isArray(cartItems)
    ? cartItems.reduce((total, item) => total + (parseInt(item.qty) || 1), 0)
    : 0;

  console.log("CartIndicator - cartItems:", cartItems);
  console.log("CartIndicator - totalItems:", totalItems);

  const handleCartClick = () => {
    console.log(
      "CartIndicator - handleCartClick called, totalItems:",
      totalItems
    );
    if (totalItems > 0) {
      console.log("CartIndicator - Opening cart sidebar");
      setIsOpen(true);
    } else {
      console.log("CartIndicator - Navigating to store page");
      // If cart is empty, navigate to store page
      navigate("/ejpeace/store"); // Fix route to match /ejpeace prefix
    }
  };

  return (
    <div className="relative cursor-pointer" onClick={handleCartClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>

      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}

      {totalItems > 0 && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 transition-opacity duration-300 hover:opacity-100">
          {totalItems} item{totalItems > 1 ? "s" : ""} in cart
        </div>
      )}
    </div>
  );
}
