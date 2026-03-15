import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import StaffDashboard from './pages/dashboard/StaffDashboard';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes — Super Admin */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Protected Routes — Owner */}
      <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
        <Route path="/owner" element={<OwnerDashboard />} />
      </Route>

      {/* Protected Routes — Staff */}
      <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
        <Route path="/staff" element={<StaffDashboard />} />
      </Route>

      {/* Catch-all → redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
