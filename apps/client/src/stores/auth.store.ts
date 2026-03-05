import { create } from 'zustand';
import type { IUser } from '@/types';
import type { AuthTokens } from '@/types/auth.types.js';

interface AuthStore {
  user: IUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: IUser, tokens: AuthTokens) => void;
  setUser: (user: IUser) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, tokens) => {
    localStorage.setItem('eventpulse_user', JSON.stringify(user));
    localStorage.setItem('eventpulse_tokens', JSON.stringify(tokens));
    set({ user, tokens, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => {
    localStorage.setItem('eventpulse_user', JSON.stringify(user));
    set({ user });
  },

  clearAuth: () => {
    localStorage.removeItem('eventpulse_user');
    localStorage.removeItem('eventpulse_tokens');
    set({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  initialize: () => {
    const storedUser = localStorage.getItem('eventpulse_user');
    const storedTokens = localStorage.getItem('eventpulse_tokens');

    if (storedUser && storedTokens) {
      set({
        user: JSON.parse(storedUser),
        tokens: JSON.parse(storedTokens),
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },
}));
