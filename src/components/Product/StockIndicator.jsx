export default function StockIndicator({ quantity, className = "" }) {
  // Convert to number if it's a string
  const stock = typeof quantity === "string" ? parseInt(quantity) : quantity;

  if (stock === 0 || stock === null || stock === undefined) {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 ${className}`}
      >
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        Out of Stock
      </span>
    );
  }

  if (stock < 5) {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800 ${className}`}
      >
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        Only {stock} left!
      </span>
    );
  }

  if (stock < 20) {
    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 ${className}`}
      >
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        Low Stock ({stock} available)
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 ${className}`}
    >
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      In Stock ({stock} available)
    </span>
  );
}
