export const routeConfig = [
  {
    route: "/dashboard",
    actions: ["read", "write"],
    defaultRoles: ["admin", "manager"],
  },
  {
    route: "/products",
    actions: ["read", "write"],
    defaultRoles: ["admin", "manager"],
  },
  {
    route: "/system-management/user",
    actions: ["read", "write"],
    defaultRoles: ["admin"],
  },
  {
    route: "/system-management/role",
    actions: ["read", "write"],
    defaultRoles: ["admin", "manager"],
  },
];
