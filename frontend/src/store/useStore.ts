import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  
  setUser: (user, token) => {
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: !!token });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));