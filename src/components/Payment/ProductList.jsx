import React from "react";
import ProductItem from "./ProductItem";
import PaymentSummary from "./PaymentSummary";

const ProductList = ({
  items,
  selectedVoucher,
  discountAmount,
  originalTotal,
  finalTotal,
}) => {
  return (
    <div className="border-b bg-white border border-gray-200 rounded-md shadow-md p-4">
      {items.map((item) => (
        <ProductItem
          key={item.id}
          item={item}
          selectedVoucher={selectedVoucher}
          discountAmount={discountAmount}
          originalTotal={originalTotal}
        />
      ))}

      <PaymentSummary
        originalTotal={originalTotal}
        selectedVoucher={selectedVoucher}
        discountAmount={discountAmount}
        finalTotal={finalTotal}
      />
    </div>
  );
};

export default ProductList;
