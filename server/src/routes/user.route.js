/* 更新说明（2026-02-20）： 用户路由已从角色硬编码切换为 route/action 权限中间件。 */
import express from "express";
import {
  upsertUser,
  getUserList,
  deleteUser,
  getCurrentUser,
  resetPassword,
} from "../controllers/user.controller.js";
import {
  protect,
  attachPermissions,
  authorizeRouteAccess,
  authorizeRouteAction,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/upsertUsers",
  protect,
  attachPermissions,
  authorizeRouteAction("/system-management/user", "write"),
  upsertUser,
);

router.get(
  "/getUserList",
  protect,
  attachPermissions,
  authorizeRouteAccess("/system-management/user"),
  getUserList,
);

router.delete(
  "/deleteUser/:id",
  protect,
  attachPermissions,
  authorizeRouteAction("/system-management/user", "write"),
  deleteUser,
);

router.get("/me", protect, getCurrentUser);

router.put(
  "/:id/reset-password",
  protect,
  attachPermissions,
  authorizeRouteAction("/system-management/user", "write"),
  resetPassword,
);

export default router;
