"use client";

/* 更新说明（2026-02-20）： auth store 已简化为仅维护 permissions，不再保存本地 token 字段。 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Permission } from "@/types/auth";

type AuthState = {
  permissions: Permission[];
  setPermissions: (permissions: Permission[]) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      permissions: [],
      setPermissions: (permissions) => set({ permissions }),
      clearAuth: () => set({ permissions: [] }),
    }),
    {
      name: "admin-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        permissions: state.permissions,
      }),
    },
  ),
);
