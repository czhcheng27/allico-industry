/* 更新说明（2026-02-20）： 角色路由已从角色硬编码切换为 route/action 权限中间件。 */
import express from "express";
import {
  upsertRole,
  getRoles,
  deleteRole,
} from "../controllers/role.controller.js";
import {
  protect,
  attachPermissions,
  authorizeRouteAccess,
  authorizeRouteAction,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/upsertRole",
  protect,
  attachPermissions,
  authorizeRouteAction("/system-management/role", "write"),
  upsertRole,
);
router.get(
  "/getRoleList",
  protect,
  attachPermissions,
  authorizeRouteAccess("/system-management/role"),
  getRoles,
);
router.delete(
  "/deleteRole/:id",
  protect,
  attachPermissions,
  authorizeRouteAction("/system-management/role", "write"),
  deleteRole,
);

export default router;
