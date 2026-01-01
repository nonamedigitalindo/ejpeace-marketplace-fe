import { useEffect, useState } from "react";
import { FaTicketAlt, FaEdit, FaTrash, FaPlus, FaPercentage, FaMoneyBillWave, FaCalendarAlt, FaTimes, FaBoxOpen } from "react-icons/fa";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getAllVouchers,
  addScopedVoucher,
  getScopedVoucherById,
  updateScopedVoucher,
  deleteVoucher,
  getVouchersById
} from "../../api/voucher";
import { getProducts } from "../../api/product";
import { getEvents } from "../../api/event";



export default function CRUDVoucher() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    code: "",
    discount_type: "fixed",
    discount_value: "",
    max_usage: "",
    used_count: 0,
    min_order_value: "",
    valid_from: null,
    valid_until: null,
    is_active: 1,
    voucher_type: { value: "product", label: "Product Voucher" }, // React Select Object
    apply_to_all: true,
    selected_items: [], // React Select Array of Objects
  });

  // Source Data for Selects
  const [productOptions, setProductOptions] = useState([]);
  const [eventOptions, setEventOptions] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const res = await getAllVouchers();
      const list = Array.isArray(res?.data) ? res.data : [];

      // Auto-disable maxed out vouchers
      const toDisable = list.filter((v) => {
        const max = Number(v.max_usage || 0);
        const used = Number(v.used_count || 0);
        return max > 0 && used >= max && Number(v.is_active) === 1;
      });

      if (toDisable.length > 0) {
        for (const v of toDisable) {
          try {
            const full = await getVouchersById(v.id);
            const payload = { ...full, is_active: 0 };
            await updateScopedVoucher(v.id, payload);
          } catch (err) {
            console.warn(`Failed to auto-disable voucher ${v.id}`, err);
          }
        }
        // Refresh list
        const refreshed = await getAllVouchers();
        setVouchers(Array.isArray(refreshed?.data) ? refreshed.data : []);
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
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoadingItems(true);
    try {
      // Load Products
      const pRes = await getProducts();
      const pData = pRes?.products || pRes?.data || (Array.isArray(pRes) ? pRes : []);
      setProductOptions(pData.map(p => ({ value: p.id, label: `${p.name} - Rp ${Number(p.price).toLocaleString()}`, type: 'product' })));

      // Load Events
      const eRes = await getEvents();
      const eData = eRes?.events || eRes?.data || (Array.isArray(eRes) ? eRes : []);
      setEventOptions(eData.map(e => ({ value: e.id, label: `${e.title} - ${new Date(e.start_date || Date.now()).toLocaleDateString()}`, type: 'event' })));

    } catch (err) {
      console.error("Failed to load items:", err);
    }
    setLoadingItems(false);
  };

  const openAdd = () => {
    setForm({
      code: "",
      discount_type: "fixed",
      discount_value: "",
      max_usage: "",
      used_count: 0,
      min_order_value: "",
      valid_from: null,
      valid_until: null,
      is_active: 1,
      voucher_type: { value: "product", label: "Product Voucher" },
      apply_to_all: true,
      selected_products: [],
      selected_events: [],
    });
    setIsEdit(false);
    setOpenModal(true);
  };

  const openEdit = async (voucher) => {
    try {
      const fullVoucher = (await getScopedVoucherById(voucher.id)).data;

      // Determine Voucher Type Object
      const typeOptions = [
        { value: "general", label: "General (All Types)" },
        { value: "product", label: "Product Voucher" },
        { value: "event", label: "Event Voucher" },
      ];
      const selectedType = typeOptions.find(t => t.value === fullVoucher.voucher_type) || typeOptions[1];

      // Map Selected Items
      let selectedProducts = [];
      let selectedEvents = [];

      if (fullVoucher.products && Array.isArray(fullVoucher.products)) {
        selectedProducts = fullVoucher.products.map(p => ({ value: p.id, label: p.name, type: 'product' }));
      }
      if (fullVoucher.events && Array.isArray(fullVoucher.events)) {
        selectedEvents = fullVoucher.events.map(e => ({ value: e.id, label: e.title, type: 'event' }));
      }

      setForm({
        code: fullVoucher.code,
        discount_type: fullVoucher.discount_type,
        discount_value: fullVoucher.discount_value,
        max_usage: fullVoucher.max_usage || "",
        used_count: fullVoucher.used_count,
        min_order_value: fullVoucher.min_order_value || "",
        valid_from: fullVoucher.valid_from ? new Date(fullVoucher.valid_from) : null,
        valid_until: fullVoucher.valid_until ? new Date(fullVoucher.valid_until) : null,
        is_active: fullVoucher.is_active,
        voucher_type: selectedType,
        apply_to_all: fullVoucher.apply_to_all === 1 || fullVoucher.apply_to_all === true,
        selected_products: selectedProducts,
        selected_events: selectedEvents,
      });

      setSelectedId(fullVoucher.id);
      setIsEdit(true);
      setOpenModal(true);
    } catch (error) {
      console.error("Failed to load voucher details:", error);
      alert("Failed to load voucher details");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.valid_from || !form.valid_until) {
      alert("Please select both a start date and an end date.");
      return;
    }

    if (form.valid_from >= form.valid_until) {
      alert("End date must be after the start date.");
      return;
    }

    if (form.discount_type === "percent" && Number(form.discount_value) > 100) {
      alert("Percentage discount cannot exceed 100%");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        code: form.code,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        max_usage: Number(form.max_usage),
        used_count: Number(form.used_count),
        min_order_value: Number(form.min_order_value),
        is_active: Number(form.is_active),
        valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        voucher_type: form.voucher_type.value,
        apply_to_all: form.apply_to_all,
        product_ids: form.selected_products.map(i => i.value),
        event_ids: form.selected_events.map(i => i.value),
      };

      // Auto-disable logic
      const max = Number(payload.max_usage || 0);
      const used = Number(payload.used_count || 0);
      if (max > 0 && used >= max) {
        payload.is_active = 0;
      }

      if (isEdit) await updateScopedVoucher(selectedId, payload);
      else await addScopedVoucher(payload);

      setOpenModal(false);
      loadVouchers();
    } catch (err) {
      console.error("Save voucher error:", err.response?.data || err);
      alert(`ERROR: ${err.response?.data?.error || "Failed to save voucher"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;
    try {
      // Use deleteVoucher directly. Make sure backend supports standard DELETE /vouchers/:id
      await deleteVoucher(id);

      // Delay reload slightly to allow DB to process
      setTimeout(() => {
        loadVouchers();
      }, 500);

    } catch (err) {
      console.error("Delete voucher error:", err);
      alert("Failed to delete voucher.");
    }
  };

  // Styles for React Select
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '0.75rem', // rounded-xl
      padding: '0.15rem',
      borderColor: state.isFocused ? '#FBBF24' : '#E5E7EB', // yellow-400 : gray-200
      boxShadow: state.isFocused ? '0 0 0 4px #FEF3C7' : 'none', // ring-yellow-100
      "&:hover": {
        borderColor: '#FBBF24'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#F59E0B' : state.isFocused ? '#FEF3C7' : 'white',
      color: state.isSelected ? 'white' : 'black',
    })
  };

  // Filter options based on Voucher Type
  const getFilteredOptions = () => {
    const type = form.voucher_type.value;
    if (type === 'product') return productOptions;
    if (type === 'event') return eventOptions;
    if (type === 'general') return [...productOptions, ...eventOptions];
    return [];
  };

  return (
    <div className="w-full min-h-screen font-sans pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voucher Management</h1>
          <p className="text-gray-500 mt-1">Manage discounts and promotional codes.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-linear-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <FaPlus /> Add Voucher
        </button>
      </div>

      {/* Table */}
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
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-yellow-600 shadow-inner">
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
                            {new Date(v.valid_from).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 text-xs">
                            <FaCalendarAlt className="text-gray-200 text-xs" />
                            <span>Until:</span>
                            {new Date(v.valid_until).toLocaleDateString()}
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
                          <button onClick={() => openEdit(v)} className="p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete(v.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
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

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-slide-up">
            <div className="bg-linear-to-r from-yellow-400 to-amber-500 p-6 flex justify-between items-center shrink-0 rounded-t-3xl">
              <h2 className="text-xl font-bold text-black">
                {isEdit ? "Edit Voucher" : "Create New Voucher"}
              </h2>
              <button onClick={() => setOpenModal(false)} className="bg-white/20 hover:bg-white/40 rounded-full w-8 h-8 flex items-center justify-center text-black font-bold transition-colors">
                <FaTimes />
              </button>
            </div>

            <div className="overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Voucher Code" name="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. SUMMER2024" required />

                  <div className="flex flex-col">
                    <label className="font-bold text-gray-700 mb-2 text-sm">Discount Type</label>
                    <Select
                      options={[
                        { value: 'fixed', label: 'Fixed Amount (Rp)' },
                        { value: 'percent', label: 'Percentage (%)' }
                      ]}
                      value={{ value: form.discount_type, label: form.discount_type === 'fixed' ? 'Fixed Amount (Rp)' : 'Percentage (%)' }}
                      onChange={(opt) => setForm({ ...form, discount_type: opt.value })}
                      styles={selectStyles}
                    />
                  </div>

                  <Input
                    label="Discount Value *"
                    name="discount_value"
                    type="number"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    required
                  />

                  <Input
                    label="Minimum Order (Rp)"
                    name="min_order_value"
                    type="number"
                    value={form.min_order_value}
                    onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                  />

                  <Input
                    label="Max Usage Limit"
                    name="max_usage"
                    type="number"
                    value={form.max_usage}
                    onChange={(e) => setForm({ ...form, max_usage: e.target.value })}
                    placeholder="0 for unlimited"
                  />

                  <div className="flex flex-col">
                    <label className="font-bold text-gray-700 mb-2 text-sm">Status</label>
                    <Select
                      options={[
                        { value: 1, label: 'Active' },
                        { value: 0, label: 'Inactive' }
                      ]}
                      value={{ value: form.is_active, label: form.is_active === 1 ? 'Active' : 'Inactive' }}
                      onChange={(opt) => setForm({ ...form, is_active: opt.value })}
                      styles={selectStyles}
                    />
                  </div>
                </div>

                {/* Date Selection - Split for precise time control */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col z-20">
                    <label className="font-bold text-gray-700 mb-2 text-sm">Valid From *</label>
                    <DatePicker
                      selected={form.valid_from}
                      onChange={(date) => setForm({ ...form, valid_from: date })}
                      showTimeSelect
                      dateFormat="Pp"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 outline-none"
                      placeholderText="Select Start Date & Time"
                      wrapperClassName="w-full"
                    />
                  </div>
                  <div className="flex flex-col z-20">
                    <label className="font-bold text-gray-700 mb-2 text-sm">Valid Until *</label>
                    <DatePicker
                      selected={form.valid_until}
                      onChange={(date) => setForm({ ...form, valid_until: date })}
                      showTimeSelect
                      dateFormat="Pp"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 outline-none"
                      placeholderText="Select End Date & Time"
                      minDate={form.valid_from}
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>

                {/* VOUCHER SCOPING SECTION */}
                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 bg-yellow-50 inline-block px-3 py-1 rounded-lg">
                    Voucher Scope
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Voucher Type */}
                    <div className="flex flex-col">
                      <label className="font-bold text-gray-700 mb-2 text-sm">Voucher Type</label>
                      <Select
                        options={[
                          { value: "general", label: "General (All Types)" },
                          { value: "product", label: "Product Voucher" },
                          { value: "event", label: "Event Voucher" },
                          { value: "shipping", label: "Shipping Voucher" }
                        ]}
                        value={form.voucher_type}
                        onChange={(opt) => setForm({ ...form, voucher_type: opt })}
                        styles={selectStyles}
                      />
                    </div>

                    {/* Apply To (Radio) */}
                    <div className="flex flex-col">
                      <label className="font-bold text-gray-700 mb-2 text-sm">Apply To</label>
                      <div className="flex items-center gap-6 mt-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            checked={form.apply_to_all}
                            onChange={() => setForm({ ...form, apply_to_all: true, selected_items: [] })}
                            className="w-5 h-5 text-yellow-500 focus:ring-yellow-400 border-gray-300"
                          />
                          <span className={`${form.apply_to_all ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                            {form.voucher_type.value === 'general' ? 'All Items' :
                              form.voucher_type.value === 'event' ? 'All Events' : 'All Products'}
                          </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            checked={!form.apply_to_all}
                            onChange={() => setForm({ ...form, apply_to_all: false })}
                            className="w-5 h-5 text-yellow-500 focus:ring-yellow-400 border-gray-300"
                          />
                          <span className={`${!form.apply_to_all ? 'font-bold text-gray-900' : 'text-gray-500'}`}>Specific Items</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ITEM SELECTION (React Select Multi) */}
                  {!form.apply_to_all && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Show Product Select if General or Product type */}
                      {(form.voucher_type.value === 'general' || form.voucher_type.value === 'product') && (
                        <div>
                          <label className="font-bold text-gray-700 mb-2 text-sm block">Select Specific Products</label>
                          <Select
                            isMulti
                            options={productOptions}
                            value={form.selected_products}
                            onChange={(vals) => setForm({ ...form, selected_products: vals })}
                            styles={selectStyles}
                            placeholder="Search and select products..."
                            noOptionsMessage={() => loadingItems ? "Loading products..." : "No products found"}
                          />
                        </div>
                      )}

                      {/* Show Event Select if General or Event type */}
                      {(form.voucher_type.value === 'general' || form.voucher_type.value === 'event') && (
                        <div>
                          <label className="font-bold text-gray-700 mb-2 text-sm block">Select Specific Events</label>
                          <Select
                            isMulti
                            options={eventOptions}
                            value={form.selected_events}
                            onChange={(vals) => setForm({ ...form, selected_events: vals })}
                            styles={selectStyles}
                            placeholder="Search and select events..."
                            noOptionsMessage={() => loadingItems ? "Loading events..." : "No events found"}
                          />
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-2">
                        {form.selected_products?.length || 0} products and {form.selected_events?.length || 0} events selected
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-6 flex justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 pb-2">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-linear-to-r from-yellow-400 to-amber-500 text-black px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>}
                    {isEdit ? "Update Voucher" : "Create Voucher"}
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
