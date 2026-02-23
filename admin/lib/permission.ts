"use client";

/* 更新说明（2026-02-20）： 已显式拆分路由可见性（hasRouteAccess）与动作能力（hasRouteAction）两类权限判断。 */

import { createElement } from "react";
import { DashboardOutlined, DatabaseOutlined, TeamOutlined } from "@ant-design/icons";
import type { Permission } from "@/types/auth";
import type { MenuItem } from "@/types/menu";

function createMenuItem(
  label: string,
  key: string,
  icon?: MenuItem["icon"],
  children?: MenuItem[],
): MenuItem {
  return { label, key, icon, children };
}

export function getMenuConfig(): MenuItem[] {
  return [
    createMenuItem("Dashboard", "/dashboard", createElement(DashboardOutlined)),
    createMenuItem("Products", "/products", createElement(DatabaseOutlined)),
    createMenuItem("System Management", "/system-management", createElement(TeamOutlined), [
      createMenuItem("Users", "/system-management/user"),
      createMenuItem("Roles", "/system-management/role"),
    ]),
  ];
}

export function hasRoutePermission(
  permissions: Permission[],
  route: string,
  action: "read" | "write" = "read",
): boolean {
  return permissions.some(
    (permission) =>
      permission.route === route && permission.actions.includes(action),
  );
}

export function hasRouteAction(
  permissions: Permission[],
  route: string,
  action: "read" | "write" = "read",
): boolean {
  return hasRoutePermission(permissions, route, action);
}

export function hasRouteAccess(permissions: Permission[], route: string): boolean {
  return permissions.some((permission) => permission.route === route);
}

export function filterMenuByPermissions(
  menu: MenuItem[],
  permissions: Permission[],
): MenuItem[] {
  return menu
    .map((item) => {
      if (item.children?.length) {
        const children = filterMenuByPermissions(item.children, permissions);
        if (children.length > 0) {
          return { ...item, children };
        }
      }

      if (hasRouteAccess(permissions, item.key)) {
        return { ...item, children: undefined };
      }

      return null;
    })
    .filter((item): item is MenuItem => item !== null);
}
