import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/Admin/ProductForm";
import { addProduct } from "../../api/product";

export default function CreateProductPage() {
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    await addProduct(formData);
    navigate("/ejpeace/internal/admin-products");
  };

  return (
    <div className="w-full min-h-screen font-sans pb-10">
      <ProductForm onSubmit={handleCreate} />
    </div>
  );
}