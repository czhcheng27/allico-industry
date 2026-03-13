"use client";

/* 更新说明（2026-03-13）：浏览器请求统一改走同域 /api 代理，避免 Railway 默认域名下跨子域 cookie 无法被 middleware 读取。 */

import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";

const http = axios.create({
  baseURL: "/api",
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
