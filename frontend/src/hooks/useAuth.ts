'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import type { Role, SignupRequest, User } from '@/types';

export function useAuth() {
  const router   = useRouter();
  const store    = useAuthStore();

  // ── Derived helpers ───────────────────────────────────────────────────────
  const isAdmin        = store.user?.role === 'ADMIN' || store.user?.role === 'SUPER_ADMIN';
  const isSuperAdmin   = store.user?.role === 'SUPER_ADMIN';
  const isSalesManager = store.user?.role === 'SALES_MANAGER';
  const isWarehouseMgr = store.user?.role === 'WAREHOUSE_MANAGER';
  const isAnalyst      = store.user?.role === 'ANALYST';

  const hasRole = useCallback(
    (...roles: Role[]) => !!store.user && roles.includes(store.user.role),
    [store.user]
  );

  const hasAnyRole = useCallback(
    (roles: Role[]) => !!store.user && roles.includes(store.user.role),
    [store.user]
  );

  // ── Full name ─────────────────────────────────────────────────────────────
  const fullName = store.user
    ? `${store.user.firstName} ${store.user.lastName}`
    : '';

  // ── Login with redirect ───────────────────────────────────────────────────
  const loginAndRedirect = useCallback(
    async (email: string, password: string) => {
      await store.login({ email, password });
      router.push('/');
    },
    [store, router]
  );

  // ── Logout with redirect ──────────────────────────────────────────────────
  const logoutAndRedirect = useCallback(() => {
    store.logout();
    router.push('/login');
  }, [store, router]);

  // ── Signup ────────────────────────────────────────────────────────────────
  const signup = useCallback(
    async (data: SignupRequest) => {
      await authApi.signup(data);
      router.push('/login?registered=1');
    },
    [router]
  );

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      if (store.user) {
        store.setUser({ ...store.user, ...updates });
      }
    },
    [store]
  );

  return {
    // State
    user:            store.user,
    token:           store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading:       store.isLoading,
    error:           store.error,
    fullName,

    // Role checks
    isAdmin,
    isSuperAdmin,
    isSalesManager,
    isWarehouseMgr,
    isAnalyst,
    hasRole,
    hasAnyRole,

    // Actions
    login:              store.login,
    loginAndRedirect,
    logout:             store.logout,
    logoutAndRedirect,
    signup,
    updateProfile,
    clearError:         store.clearError,
    fetchMe:            store.fetchMe,
    refreshAccessToken: store.refreshAccessToken,
  };
}
