import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  repairer: null,
  admin: null,

  loading: true,

  setUser: (data) => set({ user: data }),
  setRepairer: (data) => set({ repairer: data }),
  setAdmin: (data) => set({ admin: data }),

  clearUser: () => set({ user: null }),
  clearRepairer: () => set({ repairer: null }),
  clearAdmin: () => set({ admin: null }),

  setloading: (val) => set({ loading: val }),
}));
