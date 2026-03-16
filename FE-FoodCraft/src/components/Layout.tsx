import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, X, Home, Users, Store } from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    switch (user?.role) {
      case 'super_admin':
        return [
          { name: 'Dashboard Admin', to: '/admin/dashboard', icon: <Home size={20} /> },
        ];
      case 'owner':
        return [
          { name: 'Dashboard Owner', to: '/owner/dashboard', icon: <Home size={20} /> },
          { name: 'Manajemen UMKM', to: '/owner/umkm', icon: <Store size={20} /> },
          { name: 'Manajemen Staff', to: '/owner/staff', icon: <Users size={20} /> },
        ];
      case 'staff':
        return [
          { name: 'Dashboard Staff', to: '/staff/dashboard', icon: <Home size={20} /> },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
             <div className="logo-icon">FC</div>
             <h2>FoodCraft</h2>
          </div>
          <button className="close-btn md-hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {getNavLinks().map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-btn md-hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="page-title">Welcome, {user?.name || 'User'} 👋</h1>
          </div>
          <div className="topbar-right">
            <div className="user-profile">
              <div className="avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role?.replace('_', ' ')}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} />
              <span className="hide-mobile">Logout</span>
            </button>
          </div>
        </header>
        
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
};
