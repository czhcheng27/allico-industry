"use client";

import type { AxiosResponse } from "axios";
import http from "@/lib/http";
import type { Permission } from "@/types/auth";
import type { ApiResponse } from "@/types/api";
import type { Product } from "@/types/product";

type LoginPayload = {
  token: string;
  expired: number;
  user: {
    _id: string;
    email: string;
    username: string;
    roles: string[];
    permissions: Permission[];
  };
};

export type UserRecord = {
  id: string;
  username: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
};

export type RoleRecord = {
  id: string;
  roleName: string;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
};

export type CategorySubcategory = {
  slug: string;
  name: string;
};

export type CategoryRecord = {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  description?: string;
  cardImage?: string;
  icon?: string;
  sortOrder: number;
  subcategories: CategorySubcategory[];
  createdAt: string;
  updatedAt: string;
};

async function unwrap<T>(
  request: Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<ApiResponse<T>> {
  const response = await request;
  return response.data;
}

export const loginApi = (params: { identifier: string; password: string }) =>
  unwrap<LoginPayload>(http.post("/auth/login", params));

export const logoutApi = () => unwrap<null>(http.post("/auth/logout"));

export const getCurrentUserApi = () =>
  unwrap<{
    _id: string;
    email: string;
    username: string;
    roles: string[];
    permissions: Permission[];
  }>(http.get("/users/me"));

export const getUserListApi = (params: { page: number; pageSize: number }) =>
  unwrap<{
    users: UserRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>(http.get("/users/getUserList", { params }));

export const upsertUserApi = (params: {
  id?: string;
  username: string;
  email: string;
  roles: string[];
  password?: string;
}) => unwrap<UserRecord>(http.post("/users/upsertUsers", params));

export const deleteUserApi = (id: string) =>
  unwrap<null>(http.delete(`/users/deleteUser/${id}`));

export const resetUserPasswordApi = (id: string) =>
  unwrap<null>(http.put(`/users/${id}/reset-password`));

export const getRoleListApi = (params: { page: number; pageSize: number }) =>
  unwrap<{
    roles: RoleRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>(http.get("/roles/getRoleList", { params }));

export const upsertRoleApi = (params: {
  id?: string;
  roleName: string;
  description?: string;
  permissions: Permission[];
}) => unwrap<RoleRecord>(http.post("/roles/upsertRole", params));

export const deleteRoleApi = (id: string) =>
  unwrap<null>(http.delete(`/roles/deleteRole/${id}`));

export const getCategoryListApi = (params?: { keyword?: string }) =>
  unwrap<{
    categories: CategoryRecord[];
    total: number;
  }>(http.get("/categories/getCategoryList", { params }));

export const upsertCategoryApi = (params: {
  id?: string;
  slug: string;
  name: string;
  shortName?: string;
  description?: string;
  cardImage?: string;
  icon?: string;
  sortOrder?: number;
  subcategories: CategorySubcategory[];
}) => unwrap<CategoryRecord>(http.post("/categories/upsertCategory", params));

export const deleteCategoryApi = (id: string) =>
  unwrap<null>(http.delete(`/categories/deleteCategory/${id}`));

export const getProductListApi = (params: {
  page: number;
  pageSize: number;
  keyword?: string;
  category?: string;
  status?: string;
}) =>
  unwrap<{
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>(http.get("/products/getProductList", { params }));

export const upsertProductApi = (
  params: Partial<Product> & Record<string, unknown>,
) => unwrap<Product>(http.post("/products/upsertProduct", params));

export const deleteProductApi = (id: string) =>
  unwrap<null>(http.delete(`/products/deleteProduct/${id}`));
