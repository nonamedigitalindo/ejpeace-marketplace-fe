import { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Select from "react-select";
import { FaCloudUploadAlt, FaSave, FaTimes, FaEdit, FaArrowLeft, FaExchangeAlt, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import resolveImageSrc from "../../utils/image";

// Predefined Options
const SIZE_OPTIONS = [
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
    { value: "XL", label: "XL" },
    { value: "XXL", label: "XXL" },
    { value: "3XL", label: "3XL" },
    { value: "4XL", label: "4XL" },
];

const CATEGORY_OPTIONS = [
    { value: "Clothing", label: "Clothing" },
    { value: "Accessories", label: "Accessories" },
    { value: "Bags", label: "Bags" },
    { value: "Event", label: "Event" },
    { value: "Voucher", label: "Voucher" },
];

export default function ProductForm({ initialData = {}, isEdit = false, onSubmit }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);
    const [editingImageIndex, setEditingImageIndex] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        discount_percentage: 0,
        category: null, // Select object
        size: [], // Array of Select objects
        quantity: 0,
        active: 1
    });

    // Image State
    // existingImages: array of strings (URLs)
    // newImages: array of objects { file: File, preview: string }
    // We need a unified list for reordering.
    // Unified Item: { type: 'existing' | 'new', src: string, file?: File, originalIndex?: number }
    const [images, setImages] = useState([]);

    // Initialize Data
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                description: initialData.description || "",
                price: initialData.price || "",
                discount_percentage: initialData.discount_percentage || 0,
                category: initialData.category ? CATEGORY_OPTIONS.find(c => c.value === initialData.category) : null,
                size: initialData.size
                    ? (typeof initialData.size === 'string' ? initialData.size.split(',').map(s => SIZE_OPTIONS.find(opt => opt.value === s.trim()) || { value: s.trim(), label: s.trim() }) : [])
                    : [],
                quantity: initialData.quantity || 0,
                active: initialData.active ?? 1
            });

            // Handle Initial Images
            if (initialData.images && Array.isArray(initialData.images)) {
                setImages(initialData.images.map(img => ({ type: 'existing', src: resolveImageSrc(img), originalSrc: img })));
            } else if (initialData.image) {
                setImages([{ type: 'existing', src: resolveImageSrc(initialData.image), originalSrc: initialData.image }]);
            }
        }
    }, [initialData]);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePriceChange = (e) => {
        // Remove non-numeric
        const val = e.target.value.replace(/[^0-9]/g, '');
        setFormData(prev => ({ ...prev, price: val }));
    };

    const handleDiscountChange = (e) => {
        let val = parseInt(e.target.value) || 0;
        if (val < 0) val = 0;
        if (val > 100) val = 100;
        setFormData(prev => ({ ...prev, discount_percentage: val }));
    };

    // --- IMAGE LOGIC ---
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        const newItems = files.map(file => ({
            type: 'new',
            src: URL.createObjectURL(file),
            file: file
        }));
        setImages(prev => [...prev, ...newItems]);
        e.target.value = ''; // Reset
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleEditImage = (index) => {
        setEditingImageIndex(index);
        if (editFileInputRef.current) {
            editFileInputRef.current.click();
        }
    };

    const handleEditFileChange = (e) => {
        const file = e.target.files[0];
        if (file && editingImageIndex !== null) {
            setImages(prev => {
                const newArr = [...prev];
                newArr[editingImageIndex] = {
                    type: 'new',
                    src: URL.createObjectURL(file), // Replace with new preview
                    file: file
                };
                return newArr;
            });
        }
        setEditingImageIndex(null);
        e.target.value = '';
    };

    // Drag and Drop Reordering
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);

    const onDragStart = (e, index) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const onDragOver = (e, index) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index) return;

        // Swap logic
        const newImages = [...images];
        const draggedItem = newImages[draggedItemIndex];
        newImages.splice(draggedItemIndex, 1);
        newImages.splice(index, 0, draggedItem);

        setImages(newImages);
        setDraggedItemIndex(index);
    };

    const onDragEnd = () => {
        setDraggedItemIndex(null);
    };

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.name) throw new Error("Product Name is required");
            if (!formData.price) throw new Error("Price is required");

            const fd = new FormData();
            fd.append("name", formData.name);
            fd.append("description", formData.description); // HTML content
            fd.append("price", formData.price);
            fd.append("discount_percentage", formData.discount_percentage);
            fd.append("quantity", formData.quantity);

            if (formData.category) fd.append("category", formData.category.value);
            if (formData.size && formData.size.length > 0) {
                fd.append("size", formData.size.map(s => s.value).join(","));
            }

            // Handle Images
            // Backend usually expects 'image' (single) or 'images' (multiple new)
            // And we might need logic to 'keep' existing images.
            // If the backend API for create/update expects specialized handling, we need to adapt.
            // Assuming 'updateProduct' can handle "existingImages" array and "images" array for new ones.

            const newFiles = images.filter(img => img.type === 'new').map(img => img.file);
            const existingUrls = images.filter(img => img.type === 'existing').map(img => img.originalSrc);

            // Append new files
            newFiles.forEach(file => {
                fd.append("images", file);
            });

            // Append existing images list (if backend supports it for Edit)
            if (isEdit) {
                fd.append("existingImages", JSON.stringify(existingUrls));
            } else {
                // for Create, existingUrls should be empty usually, but if we have them...
                // well, create usually only sends new files.
            }

            await onSubmit(fd);
        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to submit");
        } finally {
            setLoading(false);
        }
    };

    // Custom Styles for Select
    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            padding: '6px',
            borderRadius: '0.75rem',
            borderColor: state.isFocused ? '#fbbf24' : '#e5e7eb',
            boxShadow: state.isFocused ? '0 0 0 4px #fef3c7' : 'none',
            "&:hover": { borderColor: '#fbbf24' }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#fbbf24' : state.isFocused ? '#fef3c7' : 'white',
            color: state.isSelected ? 'black' : 'black',
            cursor: 'pointer'
        })
    };

    return (
        <div className="w-full pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-600 hover:bg-yellow-50 hover:text-yellow-600 shadow-sm transition-all"
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Create New Product'}</h1>
                    <p className="text-gray-500">Fill in the details below.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2 border-gray-100">Product Information</h2>

                        <div className="space-y-6">
                            <Input label="Product Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Premium T-Shirt" required />

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Description</label>
                                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 focus-within:ring-4 focus-within:ring-yellow-100 focus-within:border-yellow-400">
                                    <ReactQuill theme="snow" value={formData.description} onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} className="bg-white" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                    <Select
                                        options={CATEGORY_OPTIONS}
                                        value={formData.category}
                                        onChange={(opt) => setFormData({ ...formData, category: opt })}
                                        styles={customSelectStyles}
                                        placeholder="Select Category..."
                                        isSearchable
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Size (Multiple)</label>
                                    <Select
                                        options={SIZE_OPTIONS}
                                        value={formData.size}
                                        onChange={(opts) => setFormData({ ...formData, size: opts })}
                                        styles={customSelectStyles}
                                        isMulti
                                        placeholder="Select Sizes..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2 border-gray-100">Price & Stock</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Price (Rp)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold z-10">Rp</span>
                                    <input
                                        type="text"
                                        value={formData.price ? Number(formData.price).toLocaleString('id-ID') : ''}
                                        onChange={handlePriceChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none font-bold text-lg"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Discount</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.discount_percentage}
                                            onChange={handleDiscountChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none"
                                            min="0" max="100"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                    </div>
                                </div>
                                <Input label="Stock" name="quantity" type="number" value={formData.quantity} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2 border-gray-100">Images</h2>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, idx)}
                                    onDragOver={(e) => onDragOver(e, idx)}
                                    onDragEnd={onDragEnd}
                                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group cursor-move hover:shadow-lg transition-all"
                                >
                                    <img src={img.src} alt="" className="w-full h-full object-cover" />

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <button type="button" onClick={() => handleEditImage(idx)} className="p-2 bg-yellow-400 text-black rounded-full hover:scale-110 transition-transform"><FaEdit size={12} /></button>
                                        <button type="button" onClick={() => removeImage(idx)} className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"><FaTrash size={12} /></button>
                                    </div>
                                    {/* Badge */}
                                    <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 rounded backdrop-blur-sm">#{idx + 1}</div>
                                </div>
                            ))}

                            {/* Upload Button */}
                            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-yellow-400 rounded-xl bg-yellow-50 hover:bg-yellow-100 cursor-pointer transition-colors">
                                <FaCloudUploadAlt className="text-yellow-600 text-2xl mb-1" />
                                <span className="text-[10px] font-bold text-yellow-700 uppercase">Add Image</span>
                                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                            </label>
                        </div>

                        <p className="text-xs text-gray-500 text-center">Drag images to reorder. First image is cover.</p>
                        {/* Hidden Input for Editing */}
                        <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleEditFileChange} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></span> : <FaSave />}
                        {isEdit ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Input({ label, type = "text", ...props }) {
    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <input
                type={type}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                {...props}
            />
        </div>
    );
}
