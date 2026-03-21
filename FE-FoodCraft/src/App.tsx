import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages placeholders (will be implemented completely later)
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUserManagement from './pages/admin/UserManagement';

import OwnerDashboard from './pages/owner/Dashboard';
import UMKMManagement from './pages/owner/UMKMManagement';
import StaffManagement from './pages/owner/StaffManagement';

import StaffDashboard from './pages/staff/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Super Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUserManagement />} />
              </Route>

              {/* Owner Routes */}
              <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
                <Route path="/owner/dashboard" element={<OwnerDashboard />} />
                <Route path="/owner/umkm" element={<UMKMManagement />} />
                <Route path="/owner/staff" element={<StaffManagement />} />
              </Route>

              {/* Staff Routes */}
              <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
                <Route path="/staff/dashboard" element={<StaffDashboard />} />
              </Route>
            </Route>
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
