import { useState, useEffect, type FormEvent } from 'react';
import api from '../../lib/axios';
import Modal from '../../components/Modal';
import { Users, Edit2, Trash2 } from 'lucide-react';
import type { User } from '../../types';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/admin/users');
      setUsers(res.data.data || res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openUpdateModal = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, password: '' });
    setFormError('');
    setIsUpdateModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setFormError('');
    setIsSubmitting(true);
    try {
      const payload: any = { name: formData.name, email: formData.email };
      if (formData.password) payload.password = formData.password;
      
      await api.put(`/api/admin/users/${selectedUser.id}`, payload);
      setIsUpdateModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/api/admin/users/${selectedUser.id}`);
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
          <p className="text-gray-600 mt-1">Kelola data owner dan staff</p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
            <Users size={20} className="text-gray-500" />
            <h2 className="text-lg font-bold text-gray-800">Daftar Pengguna</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="p-4 border-b border-gray-100 font-medium">ID</th>
                  <th className="p-4 border-b border-gray-100 font-medium">Nama</th>
                  <th className="p-4 border-b border-gray-100 font-medium">Email</th>
                  <th className="p-4 border-b border-gray-100 font-medium">Role</th>
                  <th className="p-4 border-b border-gray-100 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">Tidak ada data pengguna.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                      <td className="p-4">#{u.id}</td>
                      <td className="p-4 font-medium text-gray-900">{u.name}</td>
                      <td className="p-4 text-gray-500">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase ${
                          u.role === 'super_admin' ? 'bg-red-100 text-red-700' : 
                          u.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== 'super_admin' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openUpdateModal(u)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(u)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Modal */}
      <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} title="Update User">
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{formError}</div>
        )}
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password (Opsional)</label>
            <input
              type="password"
              placeholder="Kosongkan jika tidak diubah"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Hapus User">
        <div className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus pengguna <span className="font-semibold text-gray-900">{selectedUser?.name}</span>? Tindakan ini tidak dapat dibatalkan.
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 size={16} />
            {isSubmitting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
