import React from "react";

const VoucherModal = ({
  showVoucherModal,
  voucherSuccess,
  voucherError,
  voucherCode,
  voucherLoading,
  selectedVoucher,
  onVoucherCodeChange,
  onHandleClaimVoucher,
  onCloseModal,
}) => {
  return (
    showVoucherModal && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onCloseModal}
      >
        <div
          className="bg-white rounded-lg p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Enter Voucher Code</h2>
            <button
              onClick={onCloseModal}
              className="text-gray-500 hover:text-gray-700"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {voucherSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
              {voucherSuccess}
            </div>
          )}

          {voucherError && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
              {voucherError}
            </div>
          )}

          {selectedVoucher && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-gray-600">Applied Voucher:</p>
              <p className="font-bold text-lg">{selectedVoucher.code}</p>
              <p className="text-sm text-green-600">
                {selectedVoucher.discount_type === "percentage"
                  ? `${selectedVoucher.discount_value}% OFF`
                  : `Rp ${parseFloat(
                      selectedVoucher.discount_value
                    ).toLocaleString()} OFF`}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              value={voucherCode}
              onChange={onVoucherCodeChange}
              placeholder="Enter voucher code"
              className="w-full border p-3 rounded"
              disabled={voucherLoading}
            />

            <button
              onClick={onHandleClaimVoucher}
              disabled={voucherLoading || !voucherCode}
              className={`w-full py-2 rounded font-bold text-white ${
                voucherLoading || !voucherCode
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {voucherLoading ? "Applying..." : "Apply Voucher"}
            </button>

            <button
              onClick={onCloseModal}
              className="w-full py-2 rounded font-bold border border-gray-300 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default VoucherModal;
