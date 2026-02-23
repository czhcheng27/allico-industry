"use client";

/* 更新说明（2026-02-20）： user store 现在仅维护用户信息与登录态，登录/登出通过权限 store 同步状态。 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { loginApi, logoutApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { UserInfo } from "@/types/auth";

type LoginParams = {
  identifier: string;
  password: string;
};

type UserState = {
  isAuthenticated: boolean;
  userInfo: UserInfo;
  isLoggingIn: boolean;
  setUser: (userInfo: UserInfo) => void;
  clearUser: () => void;
  login: (params: LoginParams) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userInfo: { username: "", role: "" },
      isLoggingIn: false,
      setUser: (userInfo) => set({ userInfo, isAuthenticated: true }),
      clearUser: () =>
        set({ isAuthenticated: false, userInfo: { username: "", role: "" } }),
      login: async (params) => {
        set({ isLoggingIn: true });
        try {
          const response = await loginApi(params);
          if (!response.success) {
            return false;
          }

          const payload = response.data;
          const role = payload.user.roles?.[0] ?? "";
          set({
            isAuthenticated: true,
            userInfo: { username: payload.user.username, role },
          });

          useAuthStore.getState().setPermissions(payload.user.permissions || []);
          return true;
        } catch (error) {
          console.error("Login failed:", error);
          return false;
        } finally {
          set({ isLoggingIn: false });
        }
      },
      logout: async () => {
        try {
          await logoutApi();
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          useAuthStore.getState().clearAuth();
          set({ isAuthenticated: false, userInfo: { username: "", role: "" } });
        }
      },
    }),
    {
      name: "admin-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userInfo: state.userInfo,
      }),
    },
  ),
);
