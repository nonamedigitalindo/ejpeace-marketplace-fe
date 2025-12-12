import React from "react";

const VoucherSection = ({
  selectedVoucher,
  voucherCode,
  voucherError,
  voucherLoading,
  onVoucherCodeChange,
  onApplyVoucher,
  onRemoveVoucher,
}) => {
  return (
    <div className="space-y-3">
      {/* Label Voucher Section */}
      <div className="flex items-center mb-2">
        <svg
          className="w-5 h-5 text-blue-600 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        <span className="font-semibold text-gray-700">Voucher Code</span>
      </div>

      {/* Jika voucher SUDAH dipilih */}
      {selectedVoucher ? (
        <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200">
          <div className="flex items-center flex-1">
            <svg
              className="w-5 h-5 text-green-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
            <div>
              <p className="font-bold text-green-800">
                {selectedVoucher.code}
                <span className="ml-2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded font-semibold">
                  APPLIED
                </span>
              </p>
              <p className="text-sm text-green-600 mt-1">
                {selectedVoucher.discount_type === "percentage"
                  ? `${selectedVoucher.discount_value}% OFF`
                  : `Rp ${parseFloat(
                      selectedVoucher.discount_value
                    ).toLocaleString()} OFF`}
              </p>
            </div>
          </div>

          <button
            onClick={onRemoveVoucher}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded font-semibold transition"
          >
            Remove
          </button>
        </div>
      ) : (
        /* Jika voucher BELUM dipilih → tampilkan input dan tombol apply */
        <div className="space-y-2">
          <div className="flex gap-2 items-center ">
            <input
              type="text"
              placeholder="Enter voucher code..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 focus:outline-none"
              value={voucherCode}
              onChange={onVoucherCodeChange}
              disabled={voucherLoading}
            />
            <button
              onClick={onApplyVoucher}
              disabled={voucherLoading || !voucherCode.trim()}
              className={`pt-2 mb-6 rounded-lg font-semibold text-white transition ${
                voucherLoading || !voucherCode.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {voucherLoading ? "Applying..." : "Apply"}
            </button>
          </div>
          {voucherError && (
            <p className="text-sm text-red-600">{voucherError}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VoucherSection;
