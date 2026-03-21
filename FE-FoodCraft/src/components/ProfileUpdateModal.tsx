import { useState, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';
import Modal from './Modal';
import type { User } from '../types';

interface ProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProfileUpdateModal({ isOpen, onClose, onSuccess }: ProfileUpdateModalProps) {
  const { user, login, token } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload: any = { name, email };
      if (password) {
        payload.password = password;
      }

      const res = await api.put('/api/profile', payload);
      
      const updatedUser: User = res.data.user || res.data.data;
      if (token && updatedUser) {
        login(token, updatedUser); 
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Gagal memperbarui profil. Silakan coba lagi.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Profil">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pname" className="block text-sm font-medium text-slate-300 mb-1.5">
            Nama Lengkap
          </label>
          <input
            id="pname"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>

        <div>
          <label htmlFor="pemail" className="block text-sm font-medium text-slate-300 mb-1.5">
            Email
          </label>
          <input
            id="pemail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>

        <div>
          <label htmlFor="ppassword" className="block text-sm font-medium text-slate-300 mb-1.5">
            Password (Opsional)
          </label>
          <input
            id="ppassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kosongkan jika tidak ingin mengubah"
            className="w-full px-4 py-3 rounded-xl bg-surface-light border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50"
          >
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
