import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Plus, X, Edit, Trash2, Users } from 'lucide-react';

interface Staff {
  id: number;
  name: string;
  email: string;
  role: string;
  umkm_id: number;
  created_at: string;
}

interface UMKM {
  id: number;
  name: string;
}

export default function StaffManagement() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [umkms, setUmkms] = useState<UMKM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentStaffId, setCurrentStaffId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    umkm_id: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [staffRes, umkmRes] = await Promise.all([
        api.get('/api/owner/staff'),
        api.get('/api/owner/umkm')
      ]);
      const sData = staffRes.data.staffs || staffRes.data.data || staffRes.data;
      const uData = umkmRes.data.umkm || umkmRes.data.data || umkmRes.data;
      
      setStaffList(Array.isArray(sData) ? sData : []);
      
      let parsedUmkms: UMKM[] = [];
      if (Array.isArray(uData)) {
        parsedUmkms = uData;
      } else if (uData && typeof uData === 'object' && Object.keys(uData).length > 0) {
        parsedUmkms = [uData];
      }
      setUmkms(parsedUmkms);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ 
      name: '', 
      email: '', 
      password: '', 
      umkm_id: umkms.length === 1 ? umkms[0].id.toString() : '' 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (staff: Staff) => {
    setModalMode('edit');
    setCurrentStaffId(staff.id);
    setFormData({
      name: staff.name,
      email: staff.email,
      password: '', // Leave blank when editing unless changing
      umkm_id: staff.umkm_id.toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      await api.delete(`/api/owner/staff/${id}`);
      fetchData(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete staff');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (modalMode === 'create') {
        const payload = { ...formData, umkm_id: parseInt(formData.umkm_id) };
        await api.post('/api/owner/staff', payload);
      } else {
        const payload: any = { 
          name: formData.name, 
          email: formData.email, 
          umkm_id: parseInt(formData.umkm_id) 
        };
        if (formData.password) payload.password = formData.password;
        await api.put(`/api/owner/staff/${currentStaffId}`, payload);
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${modalMode === 'create' ? 'create' : 'update'} staff`);
    }
  };

  return (
    <div className="fade-in">
      <div className="flex-between">
        <h1 className="page-header">Manajemen Staff</h1>
        <button className="btn btn-primary" onClick={openCreateModal} style={{ width: 'auto' }}>
          <Plus size={18} /> Daftarkan Staff
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {isLoading ? (
          <div className="flex-center" style={{ padding: '2rem' }}>Loading...</div>
        ) : staffList.length === 0 ? (
          <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem', padding: '3rem 1rem' }}>
            <Users size={48} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-muted)' }}>Belum ada staff yang didaftarkan.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>UMKM ID / Cabang</th>
                  <th>Tanggal Berabung</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id}>
                    <td style={{ fontWeight: 500 }}>{staff.name}</td>
                    <td>{staff.email}</td>
                    <td>
                      <span className="badge badge-primary">
                        UMKM {staff.umkm_id}
                      </span>
                    </td>
                    <td>{new Date(staff.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--text-main)', marginRight: '0.5rem' }} onClick={() => openEditModal(staff)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.4rem', border: 'none' }} onClick={() => handleDelete(staff.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal CRUD Staff */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Daftarkan Staff Baru' : 'Edit Data Staff'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Password {modalMode === 'edit' && <span style={{fontSize: '0.75rem', fontWeight:'normal', color:'var(--text-muted)'}}>(Kosongkan jika tidak ingin diubah)</span>}</label>
                <input
                  type="password"
                  className="form-control"
                  required={modalMode === 'create'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Tugaskan ke UMKM</label>
                <select 
                  className="form-control" 
                  required
                  value={formData.umkm_id}
                  onChange={(e) => setFormData({...formData, umkm_id: e.target.value})}
                >
                  <option value="" disabled>Pilih UMKM</option>
                  {umkms.map(umkm => (
                    <option key={umkm.id} value={umkm.id}>{umkm.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                  {modalMode === 'create' ? 'Simpan Staff' : 'Update Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
