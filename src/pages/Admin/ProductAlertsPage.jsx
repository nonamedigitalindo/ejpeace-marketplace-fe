import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import {
    getProductAlerts,
    createProductAlert,
    updateProductAlert,
    deleteProductAlert
} from "../../api/productAlert";
import IconPicker from "../../components/Admin/IconPicker";
import AlertBadge from "../../components/Product/AlertBadge";
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Product Alerts Management</h1>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
                >
                    <FaPlus /> Add New Alert
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <FaSpinner className="animate-spin text-4xl text-blue-500" />
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {alerts.map((alert) => (
                                <tr key={alert.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <AlertBadge {...alert} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{alert.text}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.icon}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: alert.color }}></div>
                                            {alert.color}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEdit(alert)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => verifyDelete(alert.id)} className="text-red-600 hover:text-red-900">
                                            <FaTrash />
                                        </button>
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
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingAlert ? "Edit Alert" : "Create New Alert"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alert Text</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.text}
                                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                    placeholder="e.g. Hot Sale!"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                <IconPicker
                                    value={formData.icon}
                                    onChange={(icon) => setFormData({ ...formData, icon })}
                                    color={formData.color}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                <div className="flex items-center justify-center gap-3  rounded-lg p-2">
                                    <input
                                        type="color"
                                        required
                                        style={{ margin: 0, marginTop: '-1rem', padding: 0, width: '2.5rem', height: '2.5rem', border: 'none', borderRadius: '10%' }}
                                        className=" p-0 cursor-pointer"
                                        value={formData.color}

                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        className="w-full outline-none text-gray-700  font-medium uppercase"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>

                            <div className="mb-6 p-4 bg-gray-50 rounded border">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Preview</label>
                                <AlertBadge icon={formData.icon} color={formData.color} text={formData.text || "Preview Check"} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
