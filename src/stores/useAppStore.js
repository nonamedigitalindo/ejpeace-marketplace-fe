import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addToCart as apiAddToCart,
  removeCartItem,
  updateCartItem,
  getCart,
  clearCart as apiClearCart,
} from "../api/cart";

const useAppStore = create(
  persist(
    (set) => ({
      // Cart state
      cartItems: [],
      selectedCartItems: [],

      // Voucher state
      vouchers: [],
      selectedVoucher: null,
      voucherCode: "",
      voucherError: "",
      voucherSuccess: "",
      voucherLoading: false,

      // Payment state
      loading: false,
      showVoucherModal: false,

      // Cart sidebar open state
      isOpen: false,

      // User state (if needed)
      user: null,

      // Cart actions
      addToCart: async (item) => {
        console.log("addToCart - Starting with item:", item);
        try {
          // Get token to check if user is logged in
          const token = localStorage.getItem("token");
          console.log("addToCart - Token found:", !!token);
          if (!token) {
            // If not logged in, show error or redirect to login
            console.log("User not logged in");
            alert("Please log in to add items to cart");
            return;
          }

          // Add to database
          console.log("addToCart - Adding item to database:", {
            product_id: item.product_id,
            quantity: item.qty || 1, // Use the actual quantity from the item
          });
          await apiAddToCart({
            product_id: item.product_id,
            quantity: item.qty || 1, // Use the actual quantity from the item
          });
          console.log("addToCart - Item added to database successfully");

          // Show success message
          console.log("Item added to cart successfully");
          // alert("Item added to cart successfully");

          // Reload cart from database to ensure consistency
          console.log("addToCart - Reloading cart from database");
          await useAppStore.getState().loadCartFromDatabase();
          console.log("addToCart - Cart reloaded successfully");
        } catch (error) {
          console.error("Failed to add item to cart:", error);
          alert("Failed to add item to cart. Please try again.");
        }
      },

      removeFromCart: async (itemId) => {
        console.log("removeFromCart - Starting with itemId:", itemId);
        try {
          // Get token to check if user is logged in
          const token = localStorage.getItem("token");
          console.log("removeFromCart - Token found:", !!token);
          if (!token) {
            // If not logged in, just update local state
            console.log("removeFromCart - No token, updating local state");
            set((state) => ({
              cartItems: state.cartItems.filter((item) => item.id !== itemId),
            }));
            return;
          }

          // Remove from database
          console.log("removeFromCart - Removing item from database");
          await removeCartItem(itemId);
          console.log(
            "removeFromCart - Item removed from database successfully"
          );

          // Reload cart from database to ensure consistency
          console.log("removeFromCart - Reloading cart from database");
          await useAppStore.getState().loadCartFromDatabase();
          console.log("removeFromCart - Cart reloaded successfully");
        } catch (error) {
          console.error("Failed to remove item from cart:", error);
          alert("Failed to remove item from cart. Please try again.");
          // Reload cart from database to ensure consistency
          console.log(
            "removeFromCart - Reloading cart from database after error"
          );
          await useAppStore.getState().loadCartFromDatabase();
        }
      },

      updateCartItemQuantity: async (itemId, qty) => {
        console.log(
          "updateCartItemQuantity - Starting with itemId:",
          itemId,
          "qty:",
          qty
        );
        try {
          // Get token to check if user is logged in
          const token = localStorage.getItem("token");
          console.log("updateCartItemQuantity - Token found:", !!token);
          if (!token) {
            // If not logged in, just update local state
            console.log(
              "updateCartItemQuantity - No token, updating local state"
            );
            set((state) => ({
              cartItems: state.cartItems.map((item) =>
                item.id === itemId ? { ...item, qty: Math.max(1, qty) } : item
              ),
            }));
            return;
          }

          // Update in database
          console.log("updateCartItemQuantity - Updating item in database");
          await updateCartItem(itemId, { quantity: qty });
          console.log(
            "updateCartItemQuantity - Item updated in database successfully"
          );

          // Reload cart from database to ensure consistency
          console.log("updateCartItemQuantity - Reloading cart from database");
          await useAppStore.getState().loadCartFromDatabase();
          console.log("updateCartItemQuantity - Cart reloaded successfully");
        } catch (error) {
          console.error("Failed to update cart item quantity:", error);
          alert("Failed to update cart item quantity. Please try again.");
          // Reload cart from database to ensure consistency
          console.log(
            "updateCartItemQuantity - Reloading cart from database after error"
          );
          await useAppStore.getState().loadCartFromDatabase();
        }
      },

      clearCart: async () => {
        console.log("clearCart - Starting");
        try {
          // Get token to check if user is logged in
          const token = localStorage.getItem("token");
          console.log("clearCart - Token found:", !!token);
          if (!token) {
            // If not logged in, just update local state
            console.log("clearCart - No token, clearing local state");
            set({ cartItems: [] });
            return;
          }

          // Clear cart in database
          console.log("clearCart - Clearing cart in database");
          await apiClearCart();
          console.log("clearCart - Cart cleared in database successfully");

          // Update local state
          console.log("clearCart - Clearing local state");
          set({ cartItems: [] });
        } catch (error) {
          console.error("Failed to clear cart:", error);
          // Still update local state even if API fails
          console.log("clearCart - Clearing local state after error");
          set({ cartItems: [] });
        }
      },

      // Load cart items from database
      loadCartFromDatabase: async () => {
        try {
          console.log("loadCartFromDatabase - Starting...");
          const token = localStorage.getItem("token");
          console.log("loadCartFromDatabase - Token:", token);
          if (!token) {
            console.log("No token found, skipping cart load and clearing cart");
            set({ cartItems: [] });
            return;
          }

          console.log(
            "Loading cart from database with token:",
            token.substring(0, 20) + "..."
          );
          const response = await getCart();
          console.log("Cart response:", response);

          // Handle API response format (data is in response.data)
          const cartData = response.data || [];
          console.log("Cart data:", cartData);

          // Format the response to match our cart item structure
          const formattedItems = Array.isArray(cartData)
            ? cartData.map((item) => ({
                id: item.id,
                product_id: item.product_id,
                qty: item.quantity || 1,
                name: item.product_name,
                price: item.product_price,
                product_images: item.product_images,
                // Normalize a single `image` prop for compatibility with components
                image:
                  (Array.isArray(item.product_images) && item.product_images[0]) ||
                  item.product_image ||
                  null,
              }))
            : [];

          console.log("Formatted cart items:", formattedItems);
          set({ cartItems: formattedItems });
          console.log(
            "Cart loaded successfully with",
            formattedItems.length,
            "items"
          );
          return formattedItems;
        } catch (error) {
          console.error("Failed to load cart from database:", error);
          // Clear cart items on error to avoid showing stale data
          set({ cartItems: [] });
          throw error;
        }
      },

      // Selected cart items actions
      toggleItemSelection: (itemId) => {
        console.log("toggleItemSelection - Starting with itemId:", itemId);
        return set((state) => {
          const isSelected = state.selectedCartItems.includes(itemId);
          console.log("toggleItemSelection - Is selected:", isSelected);
          const newSelectedCartItems = isSelected
            ? state.selectedCartItems.filter((id) => id !== itemId)
            : [...state.selectedCartItems, itemId];
          console.log(
            "toggleItemSelection - New selected items:",
            newSelectedCartItems
          );
          return {
            selectedCartItems: newSelectedCartItems,
          };
        });
      },

      toggleSelectAll: () => {
        console.log("toggleSelectAll - Starting");
        return set((state) => {
          const allItemIds = state.cartItems.map((item) => item.id);
          console.log("toggleSelectAll - All item ids:", allItemIds);
          const areAllSelected = allItemIds.every((id) =>
            state.selectedCartItems.includes(id)
          );
          console.log("toggleSelectAll - Are all selected:", areAllSelected);
          const newSelectedCartItems = areAllSelected ? [] : allItemIds;
          console.log(
            "toggleSelectAll - New selected items:",
            newSelectedCartItems
          );
          return {
            selectedCartItems: newSelectedCartItems,
          };
        });
      },

      // Voucher actions
      setVouchers: (vouchers) => set({ vouchers }),
      setSelectedVoucher: (voucher) => set({ selectedVoucher: voucher }),
      setVoucherCode: (code) => set({ voucherCode: code }),
      setVoucherError: (error) => set({ voucherError: error }),
      setVoucherSuccess: (success) => set({ voucherSuccess: success }),
      setVoucherLoading: (loading) => set({ voucherLoading: loading }),

      // Payment actions
      setLoading: (loading) => set({ loading }),
      setShowVoucherModal: (show) => set({ showVoucherModal: show }),

      // Cart actions (sidebar)
      setIsOpen: (open) => {
        console.log("setIsOpen - Setting isOpen to:", open);
        set({ isOpen: open });
      },
      toggleCart: () => {
        console.log("toggleCart - Toggling cart");
        return set((s) => ({ isOpen: !s.isOpen }));
      },

      // User actions
      setUser: (user) => set({ user }),

      // Reset actions
      resetVoucherState: () =>
        set({
          selectedVoucher: null,
          voucherCode: "",
          voucherError: "",
          voucherSuccess: "",
          voucherLoading: false,
        }),

      resetPaymentState: () =>
        set({
          loading: false,
          showVoucherModal: false,
          selectedVoucher: null,
          voucherCode: "",
          voucherError: "",
          voucherSuccess: "",
        }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        selectedCartItems: state.selectedCartItems,
        user: state.user,
        isOpen: state.isOpen,
      }),
    }
  )
);

export default useAppStore;
