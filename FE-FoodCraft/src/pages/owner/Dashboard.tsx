import { Store, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../lib/axios';

interface DashboardStats {
  total_umkm?: number;
  total_staff?: number;
  recent_activities?: any[];
  [key: string]: any;
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get('/api/owner/dashboard');
        setStats(response.data.data || response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  return (
    <div className="fade-in">
      <div className="flex-between">
        <h1 className="page-header">Dashboard Owner</h1>
      </div>

      <div className="grid-cards">
        <div className="stat-card">
          <div className="stat-icon">
             <Store size={24} />
          </div>
          <div className="stat-content">
            <h3>Total UMKM</h3>
            <p>{isLoading ? '...' : (stats?.total_umkm || 0)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
             <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Staff</h3>
            <p>{isLoading ? '...' : (stats?.total_staff || 0)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
             <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Status</h3>
            <p>Active</p>
          </div>
        </div>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
           <h2 className="mb-4" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Quick Actions</h2>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <Link to="/owner/umkm" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
               <Store size={18} /> Kelola UMKM Anda
             </Link>
             <Link to="/owner/staff" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
               <Users size={18} /> Kelola Staff
             </Link>
           </div>
        </div>
        
        <div className="card">
           <h2 className="mb-4" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Recent Notifications</h2>
           <ul style={{ listStyle: 'none' }}>
             <li style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
               <p style={{ fontSize: '0.9rem' }}><strong>Staff "Budi"</strong> was successfully registered.</p>
               <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2 hours ago</span>
             </li>
             <li style={{ padding: '0.75rem 0' }}>
               <p style={{ fontSize: '0.9rem' }}><strong>UMKM "Ayam Geprek"</strong> profile updated.</p>
               <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1 day ago</span>
             </li>
           </ul>
        </div>
      </div>
    </div>
  );
}
