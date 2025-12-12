// ——— IMPORTS ———
import React, { useEffect, useState } from "react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../../api/product";
import resolveImageSrc, { PLACEHOLDER_BASE64 } from "../../utils/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ProductPage() {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount_percentage: 0,
    category: "",
    size: "",
    quantity: 0,
    editingExistingImages: [],
  });

  // ——— LOAD DATA ———
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getProducts();

      const arr = (Array.isArray(res) ? res : res.data || []).map((p) => ({
        ...p,
        price: Number(p.price),
        discount_percentage: Number(p.discount_percentage || 0),
        discounted_price:
          p.discounted_price !== undefined
            ? Number(p.discounted_price)
            : Number(p.price) -
              (Number(p.price) * Number(p.discount_percentage || 0)) / 100,
        images: p.images || [],
      }));

      setProductList(arr);
    } catch (err) {
      console.error("Failed to load products", err);
      setProductList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Revoke previous blob previews whenever previews change or when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => url?.startsWith("blob:") && URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const revokeAllPreviews = () => {
    imagePreviews.forEach((url) => url?.startsWith("blob:") && URL.revokeObjectURL(url));
  };

  // ——— OPEN ADD ———
  const openAdd = () => {
    setEditing(null);
    revokeAllPreviews();
    setImageFiles([]);
    setImagePreviews([]);
    setFormData({
      name: "",
      description: "",
      price: "",
      discount_percentage: 0,
      category: "",
      size: "",
      quantity: 0,
      editingExistingImages: [],
    });
    setShowModal(true);
  };

  // ——— OPEN EDIT ———
  const openEdit = (p) => {
    setEditing(p);
    revokeAllPreviews();
    setImageFiles([]);
    setImagePreviews([]);

    setFormData({
      name: p.name || "",
      description: p.description || "",
      price: p.price ?? "",
      discount_percentage: p.discount_percentage ?? 0,
      category: p.category || "",
      size: p.size || "",
      quantity: p.quantity ?? 0,
      editingExistingImages: Array.isArray(p.images) ? [...p.images] : [],
    });

    setShowModal(true);
  };

  // ——— FORM CHANGE ———
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  // ——— FILE UPLOAD (MULTI) ———
  const MAX_WIDTH = 1280;
  const MAX_HEIGHT = 1280;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.type.startsWith("image/"));

    validFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} terlalu besar (max ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
  
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Scale down if needed (MAX 1280px)
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const scale = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            width = width * scale;
            height = height * scale;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // COMPRESS
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });

                setImageFiles((prev) => [...prev, compressedFile]);
                setImagePreviews((prev) => [
                  ...prev,
                  URL.createObjectURL(compressedFile),
                ]);
              }
            },
            file.type.includes("png") ? "image/png" : "image/jpeg",
            0.6 // 60% quality → ukuran file kecil
          );
        };
      };
      reader.readAsDataURL(file);
    });
  };

  // ——— REMOVE NEW IMAGE PREVIEW ———
  const removePreviewImage = (index) => {
    if (imagePreviews[index]?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviews[index]);
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ——— REMOVE EXISTING IMAGE (EDIT MODE) ———
  const removeExistingImage = (index) => {
    setFormData((s) => ({
      ...s,
      editingExistingImages: s.editingExistingImages.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // ——— SUBMIT ———
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.name.trim()) return alert("Nama produk wajib diisi.");
      if (!formData.price || Number(formData.price) <= 0)
        return alert("Harga harus lebih dari 0.");

      const fd = new FormData();

      fd.append("name", formData.name);
      fd.append("description", formData.description || "");
      fd.append("price", formData.price);
      fd.append("discount_percentage", formData.discount_percentage || 0);
      fd.append("category", formData.category || "");
      fd.append("size", formData.size || "");
      fd.append("quantity", formData.quantity || 0);

      // ====== GAMBAR (LOGIKA DIPERBAIKI + DEBUG) ======

      if (editing) {
        // MODE EDIT
        
        console.log("=== UPDATE PRODUCT DEBUG ===");
        console.log("Product ID:", editing.id);
        console.log("Existing images (BEFORE transform):", formData.editingExistingImages);
        console.log("New images to upload:", imageFiles.length);

        // 🔧 TRANSFORM: Convert full URLs to relative paths
        // Remove "http://localhost:3000" or "http://212.85.27.163" from URLs
        const transformedImages = formData.editingExistingImages.map(img => {
          if (typeof img === 'string') {
            // Remove any base URL and keep only the path
            return img
              .replace('http://localhost:3000', '')
              .replace('http://212.85.27.163', '')
              .replace(/^https?:\/\/[^\/]+/, ''); // Remove any domain
          }
          return img;
        });

        console.log("Existing images (AFTER transform):", transformedImages);

        // PENTING: Kirim gambar lama sebagai JSON string
        // Karena FormData tidak bisa mengirim array dengan benar
        if (transformedImages.length > 0) {
          fd.append("existingImages", JSON.stringify(transformedImages));
          console.log("Sent existingImages:", JSON.stringify(transformedImages));
        } else {
          // Jika tidak ada gambar lama, kirim array kosong
          fd.append("existingImages", JSON.stringify([]));
          console.log("Sent existingImages: []");
        }

        // Kirim gambar baru
        if (imageFiles.length > 0) {
          imageFiles.forEach((file, idx) => {
            fd.append("images", file);
            console.log(`New image ${idx + 1}:`, file.name);
          });
        }

        // Debug: Print all FormData entries
        console.log("=== FormData Contents ===");
        for (let pair of fd.entries()) {
          console.log(pair[0] + ':', typeof pair[1] === 'object' && pair[1] instanceof File ? pair[1].name : pair[1]);
        }

        await updateProduct(editing.id, fd);
        console.log("✅ Product updated successfully");
      } else {
        // MODE ADD
        console.log("=== ADD PRODUCT ===");
        imageFiles.forEach((file, idx) => {
          fd.append("images", file);
          console.log(`Image ${idx + 1}:`, file.name);
        });
        await addProduct(fd);
        console.log("✅ Product added successfully");
      }

      setShowModal(false);
      setEditing(null);

      revokeAllPreviews();
      setImageFiles([]);
      setImagePreviews([]);

      await loadData();
    } catch (err) {
      console.error("❌ Submit error:", err);
      console.error("Error response:", err.response?.data);
      alert("Gagal menyimpan produk. " + (err.response?.data?.message || err.message));
    }
  };

  // ——— DELETE ———
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      await deleteProduct(id);
      await loadData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ——— UI ———
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Produk</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          + Tambah Produk
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg p-4">
        {loading ? (
          <div className="text-center py-8">Memuat...</div>
        ) : productList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada produk.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border">No</th>
                  <th className="p-3 border">Nama</th>
                  <th className="p-3 border">Kategori</th>
                  <th className="p-3 border">Size</th>
                  <th className="p-3 border">Harga</th>
                  <th className="p-3 border">Stok</th>
                  <th className="p-3 border">Gambar</th>
                  <th className="p-3 border">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {productList.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-2 border text-center">{i + 1}</td>
                    <td className="p-2 border">{p.name}</td>
                    <td className="p-2 border">{p.category}</td>
                    <td className="p-2 border text-center">{p.size}</td>

                    <td className="p-2 border text-right">
                      {p.discount_percentage > 0 ? (
                        <>
                          <div className="line-through text-gray-500">
                            Rp {Number(p.price).toLocaleString("id-ID")}
                          </div>
                          <div className="text-red-600 font-bold">
                            Rp{" "}
                            {Number(p.discounted_price).toLocaleString("id-ID")}
                          </div>
                        </>
                      ) : (
                        <>Rp {Number(p.price).toLocaleString("id-ID")}</>
                      )}
                    </td>

                    <td className="p-2 border text-center">{p.quantity}</td>

                    <td className="p-2 border text-center flex gap-1 justify-center">
                      {(p.images && p.images.length > 0
                        ? p.images
                        : [PLACEHOLDER_BASE64]
                      ).map((img, i2) => (
                        <img
                          key={i2}
                          src={resolveImageSrc(img)}
                          alt={`product-${i2}`}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ))}
                    </td>

                    <td className="p-2 border text-center space-x-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ——— MODAL ——— */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold">
                {editing ? "Edit Produk" : "Tambah Produk"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* ——— LEFT ——— */}
              <div className="space-y-3">
                <label>
                  <div className="text-sm font-medium">Nama Produk</div>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                    required
                  />
                </label>

                <label>
                  <div className="text-sm font-medium">Kategori</div>
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                </label>

                <label>
                  <div className="text-sm font-medium">Size</div>
                  <input
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                </label>

                <label>
                  <div className="text-sm font-medium">Deskripsi</div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border rounded p-2 h-32 resize-none"
                  />
                </label>
              </div>

              {/* ——— RIGHT ——— */}
              <div className="space-y-3">
                <label>
                  <div className="text-sm font-medium">Harga</div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                </label>

                <label>
                  <div className="text-sm font-medium">Diskon (%)</div>
                  <input
                    type="number"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                </label>

                <label>
                  <div className="text-sm font-medium">Stok</div>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                </label>

                {/* ——— IMAGE UPLOAD + PREVIEW ——— */}
                <div>
                  <div className="text-sm font-medium mb-2">Gambar Produk</div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="w-full text-sm"
                  />

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {/* EXISTING IMAGES (yang masih ada) */}
                    {formData.editingExistingImages.length > 0 &&
                      formData.editingExistingImages.map((img, i) => (
                        <div key={`existing-${i}`} className="relative group">
                          <img
                            src={resolveImageSrc(img)}
                            alt={`existing-${i}`}
                            className="w-full h-24 object-cover rounded-md border-2 border-blue-300"
                          />
                          <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-1 rounded">
                            Existing
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingImage(i)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                    {/* NEW IMAGES PREVIEW */}
                    {imagePreviews.length > 0 &&
                      imagePreviews.map((src, i) => (
                        <div key={`new-${i}`} className="relative group">
                          <img
                            src={src}
                            className="w-full h-24 object-cover rounded-md border-2 border-green-300"
                          />
                          <div className="absolute top-0 left-0 bg-green-600 text-white text-xs px-1 rounded">
                            New
                          </div>
                          <button
                            type="button"
                            onClick={() => removePreviewImage(i)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}

                    {/* PLACEHOLDER */}
                    {imagePreviews.length === 0 &&
                      formData.editingExistingImages.length === 0 && (
                        <img
                          src={PLACEHOLDER_BASE64}
                          className="w-full h-24 object-cover rounded-md border"
                          alt="placeholder"
                        />
                      )}
                  </div>

                  {/* HELPER TEXT */}
                  {editing && (
                    <div className="text-xs mt-2 p-2 bg-blue-50 rounded">
                      <p className="font-semibold text-blue-700">💡 Tips:</p>
                      <ul className="list-disc list-inside text-gray-600 mt-1">
                        <li>Gambar biru = gambar lama yang akan dipertahankan</li>
                        <li>Gambar hijau = gambar baru yang akan diupload</li>
                        <li>Klik ✕ untuk menghapus gambar</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* ——— ACTIONS ——— */}
              <div className="col-span-2 flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-600">
                  {editing
                    ? `${formData.editingExistingImages.length} gambar lama + ${imageFiles.length} gambar baru`
                    : "Menambahkan produk baru."}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 transition"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}