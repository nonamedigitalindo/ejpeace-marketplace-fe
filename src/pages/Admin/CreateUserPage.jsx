import { useEffect, useState } from "react";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../../api/user";

export default function UserPage() {
  const [users, setUsers] = useState([]); // selalu array
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

      // normalize various response shapes just in case
      // getUsers() already tries to return an array, but be defensive here too
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

      console.debug("loadUsers -> normalized users count:", safeData.length);

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
    <div className="p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Data Users</h1>

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center p-5">
                  Loading...
                </td>
              </tr>
            ) : (users?.length ?? 0) === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-5">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3">{u.username}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3">{u.address}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3 capitalize">{u.status}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => openEditModal(u.id)}
                      className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
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

      {openEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Edit User</h2>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-4">
              <div>
                <label className="block font-medium mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded-lg"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full border p-2 rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setOpenEdit(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
