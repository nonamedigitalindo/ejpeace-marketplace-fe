import useAppStore from "../stores/useAppStore";

// Custom hook to provide cart-related functionality
export const useCart = () => {
  const {
    cartItems,
    selectedCartItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    toggleItemSelection,
    toggleSelectAll,
  } = useAppStore();

  return {
    cartItems,
    selectedCartItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    toggleItemSelection,
    toggleSelectAll,
  };
};

export default useCart;
