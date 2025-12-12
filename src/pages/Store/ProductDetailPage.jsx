// ProductDetailPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../api/product";
import resolveImageSrc from "../../utils/image";
import useAppStore from "../../stores/useAppStore";
import StockIndicator from "../../components/Product/StockIndicator";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsOpen } = useAppStore();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantityError, setQuantityError] = useState("");

  // ============================================================
  // FETCH PRODUCT
  // ============================================================
  const fetchProduct = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getProductById(id);
      const productData = res?.data; // FIX: Ambil data dari API

      if (!productData) throw new Error("Product invalid");

      setProduct(productData);

      // Set selected image
      if (productData.images?.length > 0) {
        setSelectedImage(productData.images[0]);
      } else if (productData.image) {
        setSelectedImage(productData.image);
      } else {
        setSelectedImage(null);
      }

      // Initial quantity
      setQuantity(productData.quantity > 0 ? 1 : 0);
    } catch (err) {
      console.error("Failed to fetch product:", err);
      setError("Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial fetch
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Refresh on product invalidation event
  useEffect(() => {
    const handler = () => fetchProduct();
    window.addEventListener("productDataInvalidated", handler);
    return () => window.removeEventListener("productDataInvalidated", handler);
  }, [fetchProduct]);

  // ============================================================
  // QUANTITY HANDLER
  // ============================================================
  const handleQuantityChange = (newQty) => {
    setQuantityError("");

    if (!newQty || Number.isNaN(Number(newQty))) {
      setQuantity(1);
      return;
    }

    let qty = Number(newQty);
    const availableStock = product?.quantity ?? 0;

    if (availableStock === 0) {
      setQuantity(0);
      setQuantityError("Produk sedang kosong");
      return;
    }

    if (qty < 1) {
      setQuantity(1);
      setQuantityError("Minimum quantity is 1");
      return;
    }

    if (qty > availableStock) {
      setQuantity(availableStock);
      setQuantityError(`Only ${availableStock} items available`);
      return;
    }

    setQuantity(qty);
  };

  // ============================================================
  // ADD TO CART
  // ============================================================
  const handleAddToCart = async () => {
    if (!product) return;

    const availableStock = product.quantity ?? 0;
    if (availableStock === 0) {
      alert("This product is out of stock");
      return;
    }

    if (quantity > availableStock) {
      alert(`Only ${availableStock} items available`);
      return;
    }

    const cartItem = {
      product_id: product.id,
      qty: quantity,
    };

    try {
      await addToCart(cartItem);
      setIsOpen(true);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("Gagal menambahkan ke keranjang.");
    }
  };

  // ============================================================
  // BUY NOW
  // ============================================================
  const handleBuyNow = () => {
    if (!product) return;

    const availableStock = product.quantity ?? 0;
    if (availableStock === 0) {
      alert("This product is out of stock");
      return;
    }

    if (quantity > availableStock) {
      alert(`Only ${availableStock} items available`);
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    const buyNowItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image:
        product.images?.length > 0 ? product.images[0] : product.image,
      qty: quantity,
    };

    navigate("/ejpeace/checkout-form", {
      state: { buyNowItem },
    });

    setTimeout(() => setIsProcessing(false), 800);
  };

  // ============================================================
  // UI: Loading / Error / Not Found
  // ============================================================
  if (loading) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading product...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-28 min-h-screen flex items-center justify-center">
        <div className="text-xl">Product not found</div>
      </div>
    );
  }

  // ============================================================
  // HELPER: Price
  // ============================================================
  const formattedPrice =
    product.price_formatted ||
    Number(product.price || 0).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });

  // ============================================================
  // MAIN UI
  // ============================================================
  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-y-3">
        
        {/* BACK BUTTON */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/ejpeace/store")}
            className="flex items-center px-3 py-2 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Store
          </button>
        </section>

        {/* PRODUCT BLOCK */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">

          {/* IMAGES */}
          <div>
            {selectedImage ? (
              <img
                src={resolveImageSrc(selectedImage)}
                alt={product.name}
                className="w-full h-96 object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded border-2 ${
                      img === selectedImage
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={resolveImageSrc(img)}
                      alt={`Product ${idx}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="flex flex-col gap-y-3">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            
            {product.description && (
              <p className="text-gray-600">{product.description}</p>
            )}

            <span className="text-2xl font-bold">{formattedPrice}</span>

            {/* Stock Indicator */}
            <StockIndicator quantity={product.quantity} />

            {/* Quantity Selector */}
            <div className="gap-4">
              <label className="block text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className={`px-3 py-2 rounded-l ${
                    quantity <= 1
                      ? "bg-gray-100 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  -
                </button>
                <span className="mt-2.5 px-4 py-3 border rounded">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= (product.quantity || 0)}
                  className={`px-3 py-2 rounded-r ${
                    quantity >= (product.quantity || 0)
                      ? "bg-gray-100 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  +
                </button>
              </div>
              {quantityError && (
                <p className="text-red-500 text-sm mt-1">{quantityError}</p>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.quantity || product.quantity === 0}
                className={`flex-1 py-3 rounded-lg transition ${
                  !product.quantity || product.quantity === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {!product.quantity || product.quantity === 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={
                  isProcessing || !product.quantity || product.quantity === 0
                }
                className={`flex-1 py-3 rounded-lg transition ${
                  isProcessing || !product.quantity || product.quantity === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-400 text-black hover:bg-yellow-500"
                }`}
              >
                {isProcessing
                  ? "Processing..."
                  : !product.quantity || product.quantity === 0
                  ? "Out of Stock"
                  : "Buy Now"}
              </button>
            </div>
          </div>

        </section>

        {/* TANYA ADMIN SECTION */}
        <section>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">
              Pertanyaan tentang produk ini?
            </h3>
            <p className="text-gray-600 mb-4">
              Hubungi admin kami untuk informasi lebih lanjut tentang produk ini
            </p>
            <button
              onClick={() => {
                const productName = product?.name || "produk ini";
                const message = `Halo admin, saya ingin bertanya tentang ${productName}`;
                const whatsappUrl = `https://wa.me/6285860472720?text=${encodeURIComponent(
                  message
                )}`;
                window.open(whatsappUrl, "_blank");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Tanya Admin via WhatsApp
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}