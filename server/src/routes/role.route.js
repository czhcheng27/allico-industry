// server/src/routes/role.route.js
import express from "express";
import {
  upsertRole,
  getRoles,
  deleteRole,
} from "../controllers/role.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// 所有角色管理接口都需要管理员权限
router.post("/upsertRole", protect, authorize(["admin"]), upsertRole);
router.get("/getRoleList", protect, authorize(["admin", "manager"]), getRoles); // 经理也可以查看角色列表
router.delete("/deleteRole/:id", protect, authorize(["admin"]), deleteRole);

export default router;
