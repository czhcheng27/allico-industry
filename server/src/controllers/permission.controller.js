import { Permission } from "../models/permission.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

// 假设你有角色和权限关联的Model和操作函数
import { assignPermissionToRole } from "../services/role.service.js";

export const syncPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return sendError(res, "Invalid permissions format");
    }

    for (const perm of permissions) {
      // 查找是否已有这条权限记录（根据 route 唯一识别）
      const existing = await Permission.findOne({ route: perm.route });

      if (!existing) {
        // 新权限，initialized 默认为 false
        const newPerm = new Permission({
          ...perm,
          initialized: false,
        });
        await newPerm.save();
      } else {
        // 权限已存在，更新 actions 和 defaultRoles，但不修改 initialized
        existing.actions = perm.actions;
        existing.defaultRoles = perm.defaultRoles;
        await existing.save();
      }
    }

    // 处理所有未初始化的权限，给 defaultRoles 分配权限
    const uninitializedPerms = await Permission.find({ initialized: false });

    for (const perm of uninitializedPerms) {
      for (const roleName of perm.defaultRoles || []) {
        // 角色分配权限（这里实现你自己业务的权限赋予逻辑）
        await assignPermissionToRole(roleName, perm.route, perm.actions);
      }
      perm.initialized = true;
      await perm.save();
    }

    return sendSuccess(
      res,
      null,
      "Permissions synced and initialized successfully"
    );
  } catch (err) {
    console.error("Permission sync error:", err);
    return sendError(res, "Failed to sync permissions");
  }
};
