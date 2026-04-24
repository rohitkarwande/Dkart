import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  profile: null, // Holds role, company_name, etc.
  isLoading: false,
  
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  
  logout: () => set({ user: null, profile: null }),
}));
