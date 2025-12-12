import React from "react";

const PaymentSummary = ({
  originalTotal,
  selectedVoucher,
  discountAmount,
  finalTotal,
}) => {
  return (
    <div className="mt-4 pt-2 border-t">
      <p className="text-sm flex justify-between mb-2">
        <span>SUBTOTAL</span>
        <span>
          {originalTotal.toLocaleString("id-ID", {
            currency: "IDR",
            style: "currency",
          })}
        </span>
      </p>
      {selectedVoucher && discountAmount > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-semibold text-green-800">
                Voucher: {selectedVoucher.code}
              </span>
            </div>
            <span className="text-sm font-bold text-green-600">
              -
              {discountAmount.toLocaleString("id-ID", {
                currency: "IDR",
                style: "currency",
              })}
            </span>
          </div>
        </div>
      )}
      <p className="font-bold text-lg flex justify-between bg-blue-50 p-2 rounded">
        <span>TOTAL BAYAR</span>
        <span className="text-blue-600">
          {finalTotal.toLocaleString("id-ID", {
            currency: "IDR",
            style: "currency",
          })}
        </span>
      </p>
    </div>
  );
};

export default PaymentSummary;
