import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthUser = {
  id?: string;
  name?: string;
  email: string;
};

type AuthState = {
  user: AuthUser | null;
  sessionToken: string | null;
  hydrated: boolean;

  setSession: (user: AuthUser, sessionToken: string) => void;
  clearSession: () => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      sessionToken: null,
      hydrated: false,

      setSession: (user, sessionToken) => set({ user, sessionToken }),
      clearSession: () => set({ user: null, sessionToken: null }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, sessionToken: state.sessionToken }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
