"use client";

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

      if (hasRoutePermission(permissions, item.key, "read")) {
        return { ...item, children: undefined };
      }

      return null;
    })
    .filter((item): item is MenuItem => item !== null);
}
