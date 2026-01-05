import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes } from "react-icons/fa";
import {
    getProductAlerts,
    createProductAlert,
    updateProductAlert,
    deleteProductAlert
} from "../../api/productAlert";
import IconPicker from "../../components/Admin/IconPicker";
import AlertBadge from "../../components/Product/AlertBadge";
import ColorPickerInput from "../../components/Admin/ColorPickerInput";
import Swal from "sweetalert2";

export default function ProductAlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);

    const [formData, setFormData] = useState({
        text: "",
        color: "#000000",
        icon: "FaTag"
    });

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const data = await getProductAlerts();
            setAlerts(data);
        } catch (error) {
            Swal.fire("Error", error.toString(), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAlert) {
                await updateProductAlert(editingAlert.id, formData);
                Swal.fire("Success", "Alert updated successfully", "success");
            } else {
                await createProductAlert(formData);
                Swal.fire("Success", "Alert created successfully", "success");
            }
            setIsModalOpen(false);
            fetchAlerts();
            resetForm();
        } catch (error) {
            Swal.fire("Error", error.toString(), "error");
        }
    };

    const verifyDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                await deleteProductAlert(id);
                Swal.fire("Deleted!", "Your file has been deleted.", "success");
                fetchAlerts();
            } catch (error) {
                Swal.fire("Error", error.toString(), "error");
            }
        }
    };

    const openEdit = (alert) => {
        setEditingAlert(alert);
        setFormData({
            text: alert.text,
            color: alert.color,
            icon: alert.icon
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingAlert(null);
        setFormData({ text: "", color: "#000000", icon: "FaTag" });
    };

    return (
        <div className="w-full min-h-screen font-sans pb-10 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Product Alerts Management</h1>
                    <p className="text-gray-500 mt-1">Manage custom product badges and alerts.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-linear-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                >
                    <FaPlus /> Add New Alert
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-yellow-50 text-gray-600 border-b border-gray-100">
                                    <th className="p-5 font-bold uppercase text-xs tracking-wider rounded-tl-3xl">Preview</th>
                                    <th className="p-5 font-bold uppercase text-xs tracking-wider">Text</th>
                                    <th className="p-5 font-bold uppercase text-xs tracking-wider">Icon</th>
                                    <th className="p-5 font-bold uppercase text-xs tracking-wider">Color</th>
                                    <th className="p-5 font-bold uppercase text-xs tracking-wider text-right rounded-tr-3xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {alerts.map((alert) => (
                                    <tr key={alert.id} className="hover:bg-yellow-50/30 transition-colors group">
                                        <td className="p-5">
                                            <AlertBadge {...alert} />
                                        </td>
                                        <td className="p-5">
                                            <p className="font-bold text-gray-900">{alert.text}</p>
                                        </td>
                                        <td className="p-5 text-gray-500 font-mono text-xs">{alert.icon}</td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: alert.color }}></div>
                                                <span className="text-xs text-gray-500 uppercase">{alert.color}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-100">
                                                <button onClick={() => openEdit(alert)} className="p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => verifyDelete(alert.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {alerts.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No alerts found. Create one!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col animate-slide-up">
                        <div className="bg-linear-to-r from-yellow-400 to-amber-500 p-6 flex justify-between items-center shrink-0 rounded-t-3xl">
                            <h2 className="text-xl font-bold text-black">
                                {editingAlert ? "Edit Alert" : "Create New Alert"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white/20 hover:bg-white/40 rounded-full w-8 h-8 flex items-center justify-center text-black font-bold transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="font-bold text-gray-700 mb-2 text-sm block">Alert Text</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                                        value={formData.text}
                                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                        placeholder="e.g. Hot Sale!"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-gray-700 mb-2 text-sm block">Icon</label>
                                    <IconPicker
                                        value={formData.icon}
                                        onChange={(icon) => setFormData({ ...formData, icon })}
                                        color={formData.color}
                                    />
                                </div>

                                <ColorPickerInput
                                    colors={alerts.map((alert) => alert.color)}
                                    label="Color"
                                    color={formData.color}
                                    onChange={(color) => setFormData({ ...formData, color })}
                                />

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Live Preview</label>
                                    <div className="flex justify-center">
                                        <AlertBadge icon={formData.icon} color={formData.color} text={formData.text || "Preview Badge"} />
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-linear-to-r from-yellow-400 to-amber-500 text-black px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                                    >
                                        Save Alert
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
