import StockIndicator from "./StockIndicator";

export default function ProductCard({ data }) {
  if (!data) return null;

  const isOutOfStock = !data.quantity || data.quantity === 0;

  return (
    <div
      className={`min-w-[200px] bg-white shadow rounded-lg overflow-hidden ${
        isOutOfStock ? "opacity-75" : ""
      }`}
    >
      {/* Gambar */}
      {data.image ? (
        <img src={data.image} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}

      <div className="p-3">
        <h3 className="font-semibold">{data.name || "No Name"}</h3>

        {data.price ? (
          <p className="text-gray-600">Rp {data.price.toLocaleString()}</p>
        ) : (
          <p className="text-gray-400">No Price</p>
        )}

        {/* Stock Indicator */}
        <div className="mt-2">
          <StockIndicator quantity={data.quantity} />
        </div>
      </div>
    </div>
  );
}
