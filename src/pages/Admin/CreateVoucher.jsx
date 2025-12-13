import { useEffect, useState } from "react";
import { FaTicketAlt, FaEdit, FaTrash, FaPlus, FaPercentage, FaMoneyBillWave, FaCalendarAlt, FaTimes } from "react-icons/fa";
import {
  getAllVouchers,
  addVoucher,
  getVouchersById,
  updateVoucher,
  deleteVoucher,
} from "../../api/voucher";

// Converter tanggal ke format MySQL
function toMySQLDateTime(date) {
  const d = new Date(date);
  const pad = (n) => (n < 10 ? "0" + n : n);

  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    " " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes()) +
    ":" +
    pad(d.getSeconds())
  );
}

export default function CRUDVoucher() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState({
    code: "",
    // default new vouchers: fixed discount and product-type
    discount_type: "fixed",
    discount_value: "",
    max_usage: "",
    used_count: 0,
    min_order_value: "",
    valid_from: "",
    valid_until: "",
    is_active: 1,
    voucher_type: "product",
  });

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const res = await getAllVouchers();
      const list = Array.isArray(res?.data) ? res.data : [];

      // automatically disable any voucher that has reached its max usage
      const toDisable = list.filter((v) => {
        const max = Number(v.max_usage || 0);
        const used = Number(v.used_count || 0);
        return max > 0 && used >= max && Number(v.is_active) === 1;
      });

      if (toDisable.length > 0) {
        // update each voucher to set is_active = 0 (server expects full object via PUT)
        for (const v of toDisable) {
          try {
            // fetch fresh copy to ensure payload contains all required fields
            const full = await getVouchersById(v.id);
            const payload = {
              ...full,
              is_active: 0,
            };
            await updateVoucher(v.id, payload);
          } catch (err) {
            console.warn(`Failed to auto-disable voucher ${v.id}`, err);
          }
        }

        // reflect change in local copy
        const updated = list.map((vv) =>
          toDisable.some((d) => d.id === vv.id) ? { ...vv, is_active: 0 } : vv
        );

        setVouchers(updated);
      } else {
        setVouchers(list);
      }
    } catch (err) {
      console.error("Voucher load error:", err);
      setVouchers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAdd = () => {
    setForm({
      code: "",
      discount_type: "fixed",
      discount_value: "",
      max_usage: "",
      used_count: 0,
      min_order_value: "",
      valid_from: "",
      valid_until: "",
      is_active: 1,
      voucher_type: "product",
    });
    setIsEdit(false);
    setOpenModal(true);
  };

  const openEdit = (voucher) => {
    setForm({
      code: voucher.code,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      max_usage: voucher.max_usage,
      used_count: voucher.used_count,
      min_order_value: voucher.min_order_value,
      valid_from: voucher.valid_from ? voucher.valid_from.slice(0, 16) : "",
      valid_until: voucher.valid_until ? voucher.valid_until.slice(0, 16) : "",
      is_active: voucher.is_active,
      voucher_type: voucher.voucher_type,
    });

    setSelectedId(voucher.id);
    setIsEdit(true);
    setOpenModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.discount_type === "percent" && Number(form.discount_value) > 100) {
      alert("Diskon percent tidak boleh lebih dari 100%");
      return;
    }

    if (!form.valid_from || !form.valid_until) {
      alert("Tanggal mulai dan selesai wajib diisi");
      return;
    }

    if (new Date(form.valid_from) >= new Date(form.valid_until)) {
      alert("Tanggal mulai tidak boleh lebih besar atau sama");
      return;
    }

    try {
      const payload = {
        ...form,
        discount_value: Number(form.discount_value),
        max_usage: Number(form.max_usage),
        used_count: Number(form.used_count),
        min_order_value: Number(form.min_order_value),
        is_active: Number(form.is_active),
        valid_from: toMySQLDateTime(form.valid_from),
        valid_until: toMySQLDateTime(form.valid_until),
      };

      // If max_usage is defined and used_count reached max, force-disable the voucher
      const max = Number(payload.max_usage || 0);
      const used = Number(payload.used_count || 0);
      if (max > 0 && used >= max) {
        payload.is_active = 0;
      }

      if (isEdit) await updateVoucher(selectedId, payload);
      else await addVoucher(payload);

      setOpenModal(false);
      loadVouchers();
    } catch (err) {
      console.error("Save voucher error:", err.response?.data || err);
      alert(`ERROR: ${err.response?.data?.error || "Gagal menyimpan voucher"}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus voucher ini?")) return;

    try {
      await deleteVoucher(id);
      loadVouchers();
    } catch (err) {
      console.error("Delete voucher error:", err);
    }
  };

  return (
    <div className="w-full min-h-screen font-sans pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voucher Management</h1>
          <p className="text-gray-500 mt-1">Manage discounts and promotional codes.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <FaPlus /> Add Voucher
        </button>
      </div>

      {/* Voucher Table with Floating Rows */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-yellow-50 text-gray-600 border-b border-gray-100">
                  <th className="p-5 font-bold uppercase text-xs tracking-wider rounded-tl-3xl">Voucher Code</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider">Discount</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider">Usage</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider">Validity Period</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider">Status</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider text-right rounded-tr-3xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vouchers.length === 0 ? (
                  <tr><td colSpan="6" className="text-center p-10 text-gray-500">No vouchers found.</td></tr>
                ) : (
                  vouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-yellow-50/30 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-yellow-600 shadow-inner">
                            <FaTicketAlt />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 font-mono tracking-wider">{v.code}</p>
                            <p className="text-xs text-gray-400 uppercase">{v.voucher_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 font-bold text-gray-800">
                          {v.discount_type === 'percent' ? <FaPercentage className="text-gray-400 text-xs" /> : <FaMoneyBillWave className="text-gray-400 text-xs" />}
                          {v.discount_type === 'percent' ? `${v.discount_value}%` : `Rp ${Number(v.discount_value).toLocaleString()}`}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Min. Order: Rp {Number(v.min_order_value).toLocaleString()}</p>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1 w-full max-w-[120px]">
                          <div className="flex justify-between text-xs font-bold text-gray-600">
                            <span>{v.used_count} used</span>
                            <span className="text-gray-400">/ {v.max_usage || '∞'}</span>
                          </div>
                          {/* Simple Progress Bar */}
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${v.used_count >= v.max_usage ? 'bg-red-500' : 'bg-yellow-500'}`}
                              style={{ width: `${Math.min(100, (v.used_count / (v.max_usage || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-2 mb-1">
                            <FaCalendarAlt className="text-gray-300 text-xs" />
                            <span className="font-medium text-xs">Start:</span>
                            {new Date(v.valid_from).toLocaleDateString('id-ID')}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 text-xs">
                            <FaCalendarAlt className="text-gray-200 text-xs" />
                            <span>Until:</span>
                            {new Date(v.valid_until).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${v.is_active === 1
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                          {v.is_active === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(v)}
                            className="p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                            title="Edit Voucher"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete Voucher"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">
                {isEdit ? "Edit Voucher" : "Create New Voucher"}
              </h2>
              <button onClick={() => setOpenModal(false)} className="bg-white/20 hover:bg-white/40 rounded-full w-8 h-8 flex items-center justify-center text-black font-bold transition-colors">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Voucher Code" name="code" value={form.code} onChange={handleChange} placeholder="e.g. SUMMER2024" required />

                <div className="flex flex-col">
                  <label className="font-bold text-gray-700 mb-2 text-sm">Discount Type</label>
                  <select
                    name="discount_type"
                    value={form.discount_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                    disabled={!isEdit} // as per original logic, though usually editable
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed Amount (Rp)</option>
                  </select>
                </div>

                <Input label="Discount Value" name="discount_value" value={form.discount_value} onChange={handleChange} type="number" required />
                <Input label="Minimum Order (Rp)" name="min_order_value" value={form.min_order_value} onChange={handleChange} type="number" />

                <Input label="Max Usage Limit" name="max_usage" value={form.max_usage} onChange={handleChange} type="number" />

                <div className="flex flex-col">
                  <label className="font-bold text-gray-700 mb-2 text-sm">Status</label>
                  <select
                    name="is_active"
                    value={form.is_active}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

                <Input label="Valid From" type="datetime-local" name="valid_from" value={form.valid_from} onChange={handleChange} required />
                <Input label="Valid Until" type="datetime-local" name="valid_until" value={form.valid_until} onChange={handleChange} required />

                <div className="flex flex-col md:col-span-2">
                  <label className="font-bold text-gray-700 mb-2 text-sm">Voucher Type (Product/Event)</label>
                  <input
                    type="text"
                    name="voucher_type"
                    value={form.voucher_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                    disabled={!isEdit} // original logic disabled this for some reason
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  {isEdit ? "Save Changes" : "Create Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Input Component
function Input({ label, name, value, onChange, type = "text", placeholder, required }) {
  return (
    <div className="flex flex-col">
      <label className="font-bold text-gray-700 mb-2 text-sm">{label} {required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
      />
    </div>
  );
}
