// Updated CRUDVoucher.jsx — versi rapi, aman, dan bebas error
import { useEffect, useState } from "react";
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

// Komponen Input reusable
function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col">
      <label className="font-medium mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="border p-2 rounded-lg"
      />
    </div>
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
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Voucher Management</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Tambah Voucher
        </button>
      </div>

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3">Kode</th>
              <th className="p-3">Jenis Diskon</th>
              <th className="p-3">Nilai</th>
              <th className="p-3">Max Usage</th>
              <th className="p-3">Digunakan</th>
              <th className="p-3">Min Order</th>
              <th className="p-3">Valid Dari</th>
              <th className="p-3">Valid Sampai</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="10" className="text-center p-5">Loading...</td></tr>
            ) : vouchers.length === 0 ? (
              <tr><td colSpan="10" className="text-center p-5">Tidak ada data</td></tr>
            ) : (
              vouchers.map((v) => (
                <tr key={v.id} className="border-b text-sm">
                  <td className="p-3 font-semibold">{v.code}</td>
                  <td className="p-3 capitalize">{v.discount_type}</td>
                  <td className="p-3">Rp {Number(v.discount_value).toLocaleString()}</td>
                  <td className="p-3">{v.max_usage}</td>
                  <td className="p-3">{v.used_count}</td>
                  <td className="p-3">Rp {Number(v.min_order_value).toLocaleString()}</td>
                  <td className="p-3">{new Date(v.valid_from).toLocaleString("id-ID")}</td>
                  <td className="p-3">{new Date(v.valid_until).toLocaleString("id-ID")}</td>
                  <td className="p-3">
                    {v.is_active === 1 ? (
                      <span className="text-green-600 font-bold">Aktif</span>
                    ) : (
                      <span className="text-red-600 font-bold">Nonaktif</span>
                    )}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => openEdit(v)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-semibold text-center mb-6">
              {isEdit ? "Edit Voucher" : "Tambah Voucher"}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Kode Voucher" name="code" value={form.code} onChange={handleChange} />

              <div className="flex flex-col">
                <label className="font-medium mb-1">Jenis Diskon</label>
                {/* Auto-filled as Fixed for new vouchers; disable editing when creating */}
                <select
                  name="discount_type"
                  value={form.discount_type}
                  onChange={handleChange}
                  className="border p-2 rounded-lg"
                  disabled={!isEdit}
                >
                  {/* keep options for edit mode so existing vouchers can be adjusted */}
                  <option value="percent">Percent</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>

              <Input label="Nilai Diskon" name="discount_value" value={form.discount_value} onChange={handleChange} />
              <Input label="Max Usage" name="max_usage" value={form.max_usage} onChange={handleChange} />
              <Input label="Min Order" name="min_order_value" value={form.min_order_value} onChange={handleChange} />

              <Input label="Valid Dari" type="datetime-local" name="valid_from" value={form.valid_from} onChange={handleChange} />
              <Input label="Valid Sampai" type="datetime-local" name="valid_until" value={form.valid_until} onChange={handleChange} />

              <div className="flex flex-col">
                <label className="font-medium mb-1">Status</label>
                <select
                  name="is_active"
                  value={form.is_active}
                  onChange={handleChange}
                  className="border p-2 rounded-lg"
                >
                  <option value={1}>Aktif</option>
                  <option value={0}>Nonaktif</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Voucher Type</label>
                <input
                  type="text"
                  name="voucher_type"
                  value={form.voucher_type}
                  onChange={handleChange}
                  className="border p-2 rounded-lg"
                  disabled={!isEdit}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isEdit ? "Update" : "Simpan"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
