import resolveImageSrc from "../../utils/image";

const ProductItem = ({
  item,
  selectedVoucher,
  discountAmount,
  originalTotal,
}) => {
  // Calculate discounted price for this item
  const calculateItemDiscount = () => {
    if (!selectedVoucher || !discountAmount || !originalTotal) return 0;

    const itemTotal = parseFloat(item.price || 0) * parseInt(item.qty || 1);
    return (discountAmount * itemTotal) / originalTotal;
  };

  const itemTotal = parseFloat(item.price || 0) * parseInt(item.qty || 1);
  const discountedPrice = itemTotal - calculateItemDiscount();

  return (
    <div key={item.id} className="flex gap-4 mb-3">
      {item.images && item.images.length > 0 ? (
        <img
          src={resolveImageSrc(item.images[0])}
          alt={item.name}
          className="w-24 h-24 rounded object-cover"
        />
      ) : item.image ? (
        <img
          src={resolveImageSrc(item.image)}
          alt={item.name}
          className="w-24 h-24 rounded object-cover"
        />
      ) : (
        <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500">No Image</span>
        </div>
      )}
      <div className="flex-1">
        <p className="font-bold">{item.name}</p>
        <p className="text-sm">x{item.qty || 1}</p>
        <div className="mt-2">
          {selectedVoucher && discountAmount > 0 ? (
            <>
              <p className="font-semibold text-green-600">
                {discountedPrice.toLocaleString("id-ID", {
                  currency: "IDR",
                  style: "currency",
                })}
              </p>
              <p className="text-sm text-gray-500 line-through">
                {itemTotal.toLocaleString("id-ID", {
                  currency: "IDR",
                  style: "currency",
                })}
              </p>
              <div className="mt-1 inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Voucher Applied
              </div>
            </>
          ) : (
            <p className="font-semibold">
              {itemTotal.toLocaleString("id-ID", {
                currency: "IDR",
                style: "currency",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
