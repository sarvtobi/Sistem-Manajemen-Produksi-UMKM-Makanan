import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, LayoutDashboard } from 'lucide-react';

interface StaffDashboardData {
  umkm_name?: string;
  recent_tasks?: any[];
  status?: string;
  [key: string]: any;
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/staff/dashboard');
        setData(response.data.data || response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="bg-blue-100 p-4 rounded-lg mr-4">
            <LayoutDashboard size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Assigned UMKM</p>
            <h3 className="text-xl font-bold text-gray-800">{data?.umkm_name || 'Tidak ada/belum ditentukan'}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
          <div className="bg-green-100 p-4 rounded-lg mr-4">
            <Activity size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Status</p>
            <h3 className="text-xl font-bold text-gray-800">{data?.status || 'Active'}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <Activity size={20} className="text-gray-500" />
          <h2 className="text-lg font-bold text-gray-800">My Tasks / Assignments</h2>
        </div>
        <div className="p-6">
          {data?.recent_tasks && data.recent_tasks.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {data.recent_tasks.map((task, index) => (
                <li key={index} className="py-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">{task.title || 'Task'}</span>
                    <span className="text-sm text-gray-500">{task.date || 'Recent'}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">Tidak ada tugas aktif.</p>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 font-medium mb-2">Technical Info / Dashboard Data:</p>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
