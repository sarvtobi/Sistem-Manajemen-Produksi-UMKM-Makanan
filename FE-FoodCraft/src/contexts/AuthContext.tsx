import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { User, LoginCredentials, RegisterData, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getRedirectPath(role: string): string {
  switch (role) {
    case 'super_admin':
      return '/admin';
    case 'owner':
      return '/owner';
    case 'staff':
      return '/staff';
    default:
      return '/login';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/api/profile');
      setUser(response.data.data ?? response.data.user ?? response.data);
      setToken(storedToken);
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials: LoginCredentials) {
    const response = await api.post('/api/login', credentials);
    const newToken = response.data.data?.token ?? response.data.token;

    localStorage.setItem('token', newToken);
    setToken(newToken);

    // Fetch user profile
    const profileRes = await api.get('/api/profile');
    const userData: User = profileRes.data.data ?? profileRes.data.user ?? profileRes.data;
    setUser(userData);

    // Redirect based on role
    navigate(getRedirectPath(userData.role));
  }

  async function register(data: RegisterData) {
    const response = await api.post('/api/register', data);
    const newToken = response.data.data?.token ?? response.data.token;

    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);

      const profileRes = await api.get('/api/profile');
      const userData: User = profileRes.data.data ?? profileRes.data.user ?? profileRes.data;
      setUser(userData);

      navigate(getRedirectPath(userData.role));
    } else {
      // If register doesn't return token, redirect to login
      navigate('/login');
    }
  }

  async function logout() {
    try {
      await api.post('/api/logout');
    } catch {
      // Ignore logout error
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      navigate('/login');
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
