import useAppStore from "../stores/useAppStore";

// Custom hook to provide payment-related functionality
export const usePayment = () => {
  const {
    loading,
    showVoucherModal,
    setLoading,
    setShowVoucherModal,
    resetPaymentState,
  } = useAppStore();

  return {
    loading,
    showVoucherModal,
    setLoading,
    setShowVoucherModal,
    resetPaymentState,
  };
};

export default usePayment;
