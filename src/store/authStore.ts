import { UserProfile } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: UserProfile | null;
  register: (name: string, currency: string) => void;
  logout: () => void; // For dev testing
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      register: (name, currency) =>
        set({
          user: { name, currency, isRegistered: true },
        }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
