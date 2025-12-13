import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/Admin/ProductForm";
import { addProduct } from "../../api/product";

export default function CreateProductPage() {
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    try {
      console.log("Creating product...", formData);
      const result = await addProduct(formData);
      console.log("Product created successfully:", result);
      alert("Product created successfully!");
      navigate("/ejpeace/internal/admin-products");
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to create product: " + (error.response?.data?.message || error.message || "Unknown error"));
    }
  };

  return (
    <div className="w-full min-h-screen font-sans pb-10">
      <ProductForm onSubmit={handleCreate} />
    </div>
  );
}