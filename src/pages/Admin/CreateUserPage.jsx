import { useEffect, useState } from "react";
import { FaUserPlus, FaEdit, FaTrash, FaUser, FaPhone, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../../api/user";

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    status: "",
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      const safeData = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.users)
            ? res.users
            : Array.isArray(res?.results)
              ? res.results
              : Array.isArray(res?.data?.data)
                ? res.data.data
                : [];

      setUsers(safeData);
    } catch (err) {
      console.error("ERROR FETCH USERS:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openEditModal = async (id) => {
    setSelectedId(id);
    const res = await getUserById(id);
    const user = res?.data ?? res;

    setEditForm({
      username: user?.username ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
      role: user?.role ?? "",
      status: user?.status ?? "",
    });

    setOpenEdit(true);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUser(selectedId, editForm);
      setOpenEdit(false);
      loadUsers();
    } catch (err) {
      console.error("UPDATE ERROR:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus user ini?")) return;
    await deleteUser(id);
    loadUsers();
  };

  return (
    <div className="w-full min-h-screen font-sans pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage system users, roles, and access.</p>
        </div>
        {/* Placeholder for Add User if needed, currently only listing/editing */}
        {/*
        <button className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all">
          <FaUserPlus /> Add User
        </button>
        */}
      </div>

      {/* Users Table */}
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
                  <th className="p-5 font-bold uppercase text-xs tracking-wider rounded-tl-3xl">User Info</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider">Email</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider">Phone</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider">Address</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider">Role</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider">Status</th>
                  <th className="p-5 font-bold uppercase text-xs tracking-wider text-right rounded-tr-3xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(users?.length ?? 0) === 0 ? (
                  <tr><td colSpan="7" className="text-center p-10 text-gray-500">No users found.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-yellow-50/30 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-yellow-600 font-bold text-lg shadow-inner">
                            {u.username?.charAt(0).toUpperCase() || <FaUser />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{u.username}</p>
                            <p className="text-xs text-gray-400">ID: {u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-sm text-gray-600">
                        {u.email}
                      </td>
                      <td className="p-5 text-sm text-gray-600">
                        {u.phone || '-'}
                      </td>
                      <td className="p-5 text-sm text-gray-600">
                        <span className="truncate max-w-[150px] inline-block" title={u.address}>{u.address || '-'}</span>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-5">
                        <button
                          onClick={async () => {
                            const newStatus = u.status === 'active' ? 'inactive' : 'active';
                            try {
                              await updateUser(u.id, { ...u, status: newStatus });
                              loadUsers();
                            } catch (e) {
                              alert("Failed to update status");
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide cursor-pointer hover:shadow-md transition-all ${u.status === 'active'
                            ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                            : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                            }`}
                          title="Click to toggle status"
                        >
                          {u.status}
                        </button>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2 opacity-100 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(u.id)}
                            className="p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                            title="Edit User"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete User"
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

      {/* Edit Modal */}
      {openEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-6">
              <h2 className="text-2xl font-bold text-black text-center">Edit User</h2>
              <p className="text-center text-yellow-900/80 text-sm mt-1">Update user details and permissions</p>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none appearance-none"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all outline-none appearance-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenEdit(false)}
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
