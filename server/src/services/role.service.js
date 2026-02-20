import { Role } from "../models/role.model.js";

/**
 * 给指定角色添加或更新某条权限（路由+动作）
 * @param {string} roleName - 角色名，比如 "admin"
 * @param {string} route - 路由路径，比如 "/dashboard"
 * @param {string[]} actions - 权限动作数组，比如 ["read", "write"]
 */
export async function assignPermissionToRole(roleName, route, actions) {
  const role = await Role.findOne({ roleName });

  if (!role) {
    // 角色不存在，视业务需要抛错或创建
    console.warn(`Role ${roleName} not found!`);
    return;
  }

  // 找到角色中是否已有该路由权限
  const permIndex = role.permissions.findIndex((p) => p.route === route);

  if (permIndex === -1) {
    // 新增权限
    role.permissions.push({ route, actions });
  } else {
    // 合并动作，不重复
    const oldActions = role.permissions[permIndex].actions || [];
    const newActions = Array.from(new Set([...oldActions, ...actions]));
    role.permissions[permIndex].actions = newActions;
  }

  await role.save();
}
