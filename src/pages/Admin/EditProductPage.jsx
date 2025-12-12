import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "../../components/Admin/ProductForm";
import { getProductById, updateProduct } from "../../api/product";

export default function EditProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await getProductById(id);
            const data = res.data || res;
            setProduct(data);
        } catch (err) {
            console.error("Failed to load product", err);
            alert("Failed to load product");
            navigate("/ejpeace/internal/admin-products");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (formData) => {
        await updateProduct(id, formData);
        navigate("/ejpeace/internal/admin-products");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="w-full min-h-screen font-sans pb-10">
            <ProductForm initialData={product} isEdit={true} onSubmit={handleUpdate} />
        </div>
    );
}
