/* 更新说明（2026-02-20）： 权限聚合与 route/action 判断已集中到服务层，保证鉴权口径一致。 */
import { Role } from "../models/role.model.js";

export async function aggregatePermissionsByRoles(roleNames = []) {
  if (!Array.isArray(roleNames) || roleNames.length === 0) {
    return [];
  }

  const rolesWithPermissions = await Role.find({
    roleName: { $in: roleNames },
  }).select("permissions -_id");

  const permissionMap = new Map();

  rolesWithPermissions.forEach((roleDoc) => {
    (roleDoc.permissions || []).forEach((permission) => {
      if (!permission?.route || !Array.isArray(permission.actions)) {
        return;
      }

      const existingActions = permissionMap.get(permission.route) || [];
      const mergedActions = [...new Set([...existingActions, ...permission.actions])];
      permissionMap.set(permission.route, mergedActions);
    });
  });

  return Array.from(permissionMap).map(([route, actions]) => ({
    route,
    actions,
  }));
}

export function hasRouteAccess(permissions = [], route) {
  return permissions.some((permission) => permission?.route === route);
}

export function hasRouteAction(permissions = [], route, action = "read") {
  return permissions.some(
    (permission) =>
      permission?.route === route &&
      Array.isArray(permission.actions) &&
      permission.actions.includes(action),
  );
}
