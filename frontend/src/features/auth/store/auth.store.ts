import { create } from 'zustand';
import type { AuthUser } from '../types/auth.types';

export type User = AuthUser;

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setSession: (accessToken: string, user: User) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,

  setSession: (accessToken, user) => set({ accessToken, user }),

  clearSession: () => set({ accessToken: null, user: null }),
}));