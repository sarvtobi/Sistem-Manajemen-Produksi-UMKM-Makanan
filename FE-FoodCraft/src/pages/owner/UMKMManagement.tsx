import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Plus, X, Building2, Edit2 } from 'lucide-react';

interface UMKM {
  id: number;
  name: string;
  description: string;
  address: string;
  created_at: string;
}

export default function UMKMManagement() {
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: ''
  });

  const fetchUMKMs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/owner/umkm');
      // Berdasarkan payload: { message: "...", umkm: {id: 3, ...} }
      // Atau mungkin jika data array: { data: [...] }
      const data = res.data.umkm || res.data.data || res.data;
      
      if (Array.isArray(data)) {
        setUmkms(data);
      } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        setUmkms([data]);
      } else {
        setUmkms([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch UMKM data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUMKMs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await api.post('/api/owner/umkm', formData);
      } else {
        await api.put('/api/owner/umkm', formData);
      }
      setIsModalOpen(false);
      setFormData({ name: '', description: '', address: '' });
      fetchUMKMs();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${modalMode === 'create' ? 'create' : 'update'} UMKM`);
    }
  };

  const openEditModal = (umkm: UMKM) => {
    setModalMode('edit');
    setFormData({
      name: umkm.name,
      description: umkm.description || '',
      address: umkm.address
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', description: '', address: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="fade-in">
      <div className="flex-between">
        <h1 className="page-header">Manajemen UMKM</h1>
        {umkms.length === 0 && (
          <button className="btn btn-primary" onClick={openCreateModal} style={{ width: 'auto' }}>
            <Plus size={18} /> Tambah UMKM
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {isLoading ? (
          <div className="flex-center" style={{ padding: '2rem' }}>Loading...</div>
        ) : umkms.length === 0 ? (
          <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem', padding: '3rem 1rem' }}>
            <Building2 size={48} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-muted)' }}>Belum ada UMKM yang didaftarkan.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nama UMKM</th>
                  <th>Deskripsi</th>
                  <th>Alamat</th>
                  <th>Tanggal Daftar</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {umkms.map((umkm) => (
                  <tr key={umkm.id}>
                    <td style={{ fontWeight: 500 }}>{umkm.name}</td>
                    <td>{umkm.description || '-'}</td>
                    <td>{umkm.address}</td>
                    <td>{new Date(umkm.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem', border: 'none', color: 'var(--text-main)' }} 
                        onClick={() => openEditModal(umkm)}
                        title="Edit UMKM"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah UMKM */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Tambah UMKM Baru' : 'Edit UMKM'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama UMKM</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Alamat Lengkap</label>
                <textarea
                  className="form-control"
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                  {modalMode === 'create' ? 'Simpan UMKM' : 'Update UMKM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
