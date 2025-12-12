import React from "react";

const OrderSummary = ({ form }) => {
  return (
    <div className="border rounded-lg bg-white border-gray-200 p-4 shadow-md">
      <h3 className="font-bold text-lg mb-2">Bill To</h3>
      <p className="font-semibold">
        {form.full_name} - ({form.phone})
      </p>
      <p className="text-sm text-gray-600 mt-1">{form.email}</p>
      <p className="text-sm text-gray-600 mt-1">{form.address_line1}</p>
      <p className="text-sm text-gray-600">{form.city}</p>
      <p className="text-sm text-gray-600">{form.postal_code}</p>
    </div>
  );
};

export default OrderSummary;
