import useAppStore from "../stores/useAppStore";

// Custom hook to provide voucher-related functionality
export const useVoucher = () => {
  const {
    vouchers,
    selectedVoucher,
    voucherCode,
    voucherError,
    voucherSuccess,
    voucherLoading,
    setVouchers,
    setSelectedVoucher,
    setVoucherCode,
    setVoucherError,
    setVoucherSuccess,
    setVoucherLoading,
    resetVoucherState,
  } = useAppStore();

  return {
    vouchers,
    selectedVoucher,
    voucherCode,
    voucherError,
    voucherSuccess,
    voucherLoading,
    setVouchers,
    setSelectedVoucher,
    setVoucherCode,
    setVoucherError,
    setVoucherSuccess,
    setVoucherLoading,
    resetVoucherState,
  };
};

export default useVoucher;
