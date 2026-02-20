"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Permission } from "@/types/auth";

type AuthState = {
  token: string;
  expired: number;
  permissions: Permission[];
  setAuth: (token: string, expired: number) => void;
  setPermissions: (permissions: Permission[]) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: "",
      expired: 0,
      permissions: [],
      setAuth: (token, expired) => set({ token, expired }),
      setPermissions: (permissions) => set({ permissions }),
      clearAuth: () => set({ token: "", expired: 0, permissions: [] }),
    }),
    {
      name: "admin-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        expired: state.expired,
        permissions: state.permissions,
      }),
    },
  ),
);
