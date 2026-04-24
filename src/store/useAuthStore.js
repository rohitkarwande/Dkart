import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  profile: null, // Holds role, company_name, etc.
  isLoading: false,
  
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ 
    profile: {
      ...profile,
      // HACKATHON: Give 10 free credits by default if null
      credits_balance: profile?.credits_balance ?? 10
    } 
  }),
  setLoading: (isLoading) => set({ isLoading }),
  
  // HACKATHON SIMULATED ACTIONS
  deductCredit: () => set((state) => ({
    profile: {
      ...state.profile,
      credits_balance: Math.max(0, (state.profile?.credits_balance || 0) - 1)
    }
  })),
  
  addCredits: (amount) => set((state) => ({
    profile: {
      ...state.profile,
      credits_balance: (state.profile?.credits_balance || 0) + amount
    }
  })),

  upgradeToPro: () => set((state) => ({
    profile: {
      ...state.profile,
      plan_tier: 'pro'
    }
  })),

  logout: () => set({ user: null, profile: null }),
}));
