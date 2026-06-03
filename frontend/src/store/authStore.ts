'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@/lib/api';
import type { AuthResponse, User, LoginRequest } from '@/types';
import toast from 'react-hot-toast';

// ── State Interface ───────────────────────────────────────────────────────────
interface AuthState {
  user:             User | null;
  token:            string | null;
  refreshToken:     string | null;
  isAuthenticated:  boolean;
  isLoading:        boolean;
  error:            string | null;

  // Actions
  login:               (credentials: LoginRequest) => Promise<void>;
  logout:              () => void;
  setUser:             (user: User) => void;
  setToken:            (token: string, refreshToken: string) => void;
  refreshAccessToken:  () => Promise<void>;
  clearError:          () => void;
  fetchMe:             () => Promise<void>;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      refreshToken:    null,
      isAuthenticated: false,
      isLoading:       false,
      error:           null,

      // ── Login ────────────────────────────────────────────────────────────
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials) as AuthResponse;
          const { token, refreshToken, user } = response;

          // Persist tokens to localStorage for axios interceptor
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', token);
            localStorage.setItem('refresh_token', refreshToken);
          }

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading:       false,
            error:           null,
          });

          toast.success(`Welcome back, ${user.firstName}!`);
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Invalid credentials. Please try again.';
          set({ isLoading: false, error: message, isAuthenticated: false });
          toast.error(message);
          throw err;
        }
      },

      // ── Logout ───────────────────────────────────────────────────────────
      logout: () => {
        try { authApi.logout(); } catch { /* ignore */ }

        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }

        set({
          user:            null,
          token:           null,
          refreshToken:    null,
          isAuthenticated: false,
          error:           null,
        });

        toast.success('Logged out successfully.');
        if (typeof window !== 'undefined') window.location.href = '/login';
      },

      // ── Set User ──────────────────────────────────────────────────────────
      setUser: (user: User) => set({ user }),

      // ── Set Tokens ────────────────────────────────────────────────────────
      setToken: (token: string, refreshToken: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
          localStorage.setItem('refresh_token', refreshToken);
        }
        set({ token, refreshToken });
      },

      // ── Refresh Access Token ──────────────────────────────────────────────
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await authApi.refresh(refreshToken) as Pick<AuthResponse, 'token' | 'refreshToken'>;
          const { token: newToken, refreshToken: newRefresh } = response;
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', newToken);
            localStorage.setItem('refresh_token', newRefresh);
          }
          set({ token: newToken, refreshToken: newRefresh });
        } catch {
          get().logout();
        }
      },

      // ── Fetch current user ────────────────────────────────────────────────
      fetchMe: async () => {
        try {
          const user = await authApi.getMe() as User;
          set({ user, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },

      // ── Clear Error ───────────────────────────────────────────────────────
      clearError: () => set({ error: null }),
    }),
    {
      name:    'auth-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem:    () => null,
          setItem:    () => {},
          removeItem: () => {},
        }
      ),
      // Only persist non-sensitive state shape; tokens live in localStorage
      partialize: (state) => ({
        user:            state.user,
        token:           state.token,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
