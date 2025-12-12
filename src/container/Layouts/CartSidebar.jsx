import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import resolveImageSrc from "../../utils/image";
import useAppStore from "../../stores/useAppStore";

export default function CartSidebar() {
  const navigate = useNavigate();

  console.log("CartSidebar - Rendering");

  // Zustand store
  const {
    cartItems,
    selectedCartItems,
    isOpen,
    toggleItemSelection,
    toggleSelectAll,
    removeFromCart,
    updateCartItemQuantity,
    setShowVoucherModal,
    setIsOpen,
    loadCartFromDatabase, // Add this
  } = useAppStore();

  console.log("CartSidebar - cartItems:", cartItems);
  console.log("CartSidebar - isOpen:", isOpen);

  // Load cart when sidebar opens
  useEffect(() => {
    console.log("CartSidebar - useEffect triggered, isOpen:", isOpen);
    if (isOpen) {
      console.log("CartSidebar - Sidebar is open, loading cart from database");
      loadCartFromDatabase();
    }
  }, [isOpen, loadCartFromDatabase]);

  // Calculate total price for selected items only
  const totalPrice =
    Array.isArray(cartItems) && Array.isArray(selectedCartItems)
      ? cartItems
          .filter((item) => selectedCartItems.includes(item.id))
          .reduce(
            (total, item) =>
              total + (parseFloat(item.price) || 0) * (parseInt(item.qty) || 1),
            0
          )
      : 0;

  // Handle checkout for selected items
  const handleCheckout = () => {
    console.log("CartSidebar - handleCheckout called");
    // Filter cart items to only include selected items
    const selectedItems = cartItems.filter((item) =>
      selectedCartItems.includes(item.id)
    );
    console.log("CartSidebar - Selected items for checkout:", selectedItems);
    // Pass selected items to checkout page via state
    setIsOpen(false);
    navigate("/ejpeace/checkout-form", {
      state: {
        selectedCartItems: selectedItems,
      },
    });
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      console.log("CartSidebar - handleClickOutside called, target:", e.target);
      if (isOpen && e.target.classList.contains("cart-sidebar-backdrop")) {
        console.log("CartSidebar - Closing sidebar due to click outside");
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, setShowVoucherModal]);

  console.log(
    "CartSidebar - Rendering, isOpen:",
    isOpen,
    "cartItems.length:",
    Array.isArray(cartItems) ? cartItems.length : 0
  );
  if (!isOpen) {
    console.log("CartSidebar - Not rendering because isOpen is false");
    return null;
  }

  console.log("Cart Items:", cartItems);

  return (
    <div className="cart-sidebar-backdrop fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl rounded-l-xl transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button
            onClick={() => {
              console.log("CartSidebar - Closing sidebar");
              setIsOpen(false);
            }}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 gap-y-3 flex flex-col w-full">
          {Array.isArray(cartItems) && cartItems.length > 0 ? (
            <>
              {/* Select All Checkbox */}
              <div className="flex justify-between items-center">
                <section className="w-1/6">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={
                      selectedCartItems.length === cartItems.length &&
                      cartItems.length > 0
                    }
                    onChange={() => {
                      console.log("CartSidebar - Toggling select all");
                      toggleSelectAll();
                    }}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer mt-4"
                  />
                </section>
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium w-5/6 self-center"
                >
                  Select All ({selectedCartItems.length}/{cartItems.length})
                </label>
              </div>

              <div className="space-y-4 ">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-xl"
                  >
                    <section className="w-1/6">
                      <input
                        type="checkbox"
                        checked={selectedCartItems.includes(item.id)}
                        onChange={() => {
                          console.log(
                            "CartSidebar - Toggling item selection:",
                            item.id
                          );
                          toggleItemSelection(item.id);
                        }}
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                      />
                    </section>

                    <section className="flex gap-x-3 justify-between w-full">
                      <div className="flex gap-x-3 justify-between flex-1">
                        {item.product_images ? (
                          <img
                            src={resolveImageSrc(item.product_images[0])}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              No Image
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <p className="text-gray-600 text-sm">
                            {parseFloat(item.price || 0).toLocaleString(
                              "id-ID",
                              {
                                style: "currency",
                                currency: "IDR",
                              }
                            )}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                console.log(
                                  "CartSidebar - Decreasing quantity for item:",
                                  item.id
                                );
                                updateCartItemQuantity(
                                  item.id,
                                  Math.max(1, (parseInt(item.qty) || 1) - 1)
                                );
                              }}
                              className="w-6 h-6 flex items-center justify-center border rounded"
                            >
                              -
                            </button>
                            <span className="text-sm self-center">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => {
                                console.log(
                                  "CartSidebar - Increasing quantity for item:",
                                  item.id
                                );
                                updateCartItemQuantity(
                                  item.id,
                                  (parseInt(item.qty) || 1) + 1
                                );
                              }}
                              className="w-6 h-6 flex items-center justify-center border rounded"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          console.log("CartSidebar - Removing item:", item.id);
                          removeFromCart(item.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </section>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400"
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
              <p className="mt-4 text-gray-500">Your cart is empty</p>
            </div>
          )}
        </div>

        {Array.isArray(cartItems) && cartItems.length > 0 && (
          <div className="border-t p-4 w-full bg-white flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-lg">
                {totalPrice.toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                })}
              </span>
            </div>
            <button
              onClick={() => {
                console.log("CartSidebar - Proceed to Checkout button clicked");
                handleCheckout();
              }}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
