export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'owner' | 'staff';
  created_at?: string;
  updated_at?: string;
}

export interface UMKM {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Staff {
  id: number;
  user_id: number;
  umkm_id: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}
