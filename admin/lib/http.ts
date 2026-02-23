"use client";

/* 更新说明（2026-02-20）： Axios 已改为 cookie 会话模式（withCredentials），并在 401 时同时清理 auth/user 状态。 */

import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9001/api",
  timeout: 20_000,
  withCredentials: true,
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      useUserStore.getState().clearUser();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default http;
