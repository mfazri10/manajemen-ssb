import { create } from 'zustand';

interface AuthState {
  activeAkademiId: string | null;
  roles: string[];
  permissions: string[];
  setActiveAkademiId: (id: string | null) => void;
  setRolesAndPermissions: (roles: string[], permissions: string[]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  activeAkademiId: typeof window !== 'undefined' ? localStorage.getItem('activeAkademiId') : null,
  roles: [],
  permissions: [],
  setActiveAkademiId: (id) => {
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem('activeAkademiId', id);
      } else {
        localStorage.removeItem('activeAkademiId');
      }
    }
    set({ activeAkademiId: id });
  },
  setRolesAndPermissions: (roles, permissions) => set({ roles, permissions }),
}));
