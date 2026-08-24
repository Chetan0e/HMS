import { create } from 'zustand';
import { User } from '../types';
import { apiFetch } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user_data') || 'null'),
  token: localStorage.getItem('access_token'),
  isLoading: false,

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_data', JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      set({ isLoading: true });
      const user = await apiFetch<User>('/auth/me');
      localStorage.setItem('user_data', JSON.stringify(user));
      set({ user, isLoading: false });
    } catch (e) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      set({ user: null, token: null, isLoading: false });
    }
  }
}));
