'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Modal Registry ────────────────────────────────────────────────────────────
type ModalName =
  | 'createProduct'
  | 'editProduct'
  | 'createOrder'
  | 'editOrder'
  | 'orderDetails'
  | 'createSupplier'
  | 'editSupplier'
  | 'createWarehouse'
  | 'editWarehouse'
  | 'stockAdjustment'
  | 'createUser'
  | 'createPurchaseOrder'
  | 'reportGenerator';

interface ModalState {
  isOpen:  boolean;
  data?:   unknown;
}

type ModalsMap = Partial<Record<ModalName, ModalState>>;

// ── UI State Interface ────────────────────────────────────────────────────────
interface UiState {
  sidebarCollapsed: boolean;
  currentPage:      string;
  theme:            'dark' | 'light';
  modals:           ModalsMap;
  searchQuery:      string;
  isGlobalLoading:  boolean;

  // Actions
  toggleSidebar:     () => void;
  setSidebarCollapsed:(collapsed: boolean) => void;
  setCurrentPage:    (page: string) => void;
  setTheme:          (theme: 'dark' | 'light') => void;
  openModal:         (name: ModalName, data?: unknown) => void;
  closeModal:        (name: ModalName) => void;
  closeAllModals:    () => void;
  isModalOpen:       (name: ModalName) => boolean;
  getModalData:      (name: ModalName) => unknown;
  setSearchQuery:    (q: string) => void;
  setGlobalLoading:  (loading: boolean) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      currentPage:      'Dashboard',
      theme:            'dark',
      modals:           {},
      searchQuery:      '',
      isGlobalLoading:  false,

      // ── Sidebar ─────────────────────────────────────────────────────────
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed: boolean) =>
        set({ sidebarCollapsed: collapsed }),

      // ── Page ─────────────────────────────────────────────────────────────
      setCurrentPage: (page: string) => set({ currentPage: page }),

      // ── Theme ─────────────────────────────────────────────────────────────
      setTheme: (theme: 'dark' | 'light') => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },

      // ── Modals ────────────────────────────────────────────────────────────
      openModal: (name: ModalName, data?: unknown) =>
        set((state) => ({
          modals: {
            ...state.modals,
            [name]: { isOpen: true, data },
          },
        })),

      closeModal: (name: ModalName) =>
        set((state) => ({
          modals: {
            ...state.modals,
            [name]: { isOpen: false, data: undefined },
          },
        })),

      closeAllModals: () => set({ modals: {} }),

      isModalOpen: (name: ModalName) => get().modals[name]?.isOpen ?? false,

      getModalData: (name: ModalName) => get().modals[name]?.data,

      // ── Search ────────────────────────────────────────────────────────────
      setSearchQuery: (q: string) => set({ searchQuery: q }),

      // ── Global Loading ────────────────────────────────────────────────────
      setGlobalLoading: (loading: boolean) => set({ isGlobalLoading: loading }),
    }),
    {
      name:    'ui-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem:    () => null,
          setItem:    () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme:            state.theme,
      }),
    }
  )
);
