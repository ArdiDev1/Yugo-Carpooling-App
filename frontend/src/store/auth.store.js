import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user:  null,
      token: null,
      role:  null,   // "driver" | "passenger"

      setUser:    (user, token) => set({ user, token, role: user?.role ?? null }),
      clearAuth:  ()            => set({ user: null, token: null, role: null }),
      updateUser: (patch)       => set((state) => ({ user: { ...state.user, ...patch } })),
    }),
    {
      name:        "carpool-auth",
      partialize:  (state) => ({ user: state.user, token: state.token, role: state.role }),
    }
  )
);
