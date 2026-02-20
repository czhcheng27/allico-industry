// server/src/routes/user.route.js
import express from "express";
import {
  upsertUser,
  getUserList,
  deleteUser,
  getCurrentUser,
  resetPassword,
} from "../controllers/user.controller.js"; // 导入新的 upsertUser 函数
import { protect, authorize } from "../middleware/auth.middleware.js"; // 导入中间件

const router = express.Router();

// POST /api/users - 创建或更新用户
// 只有拥有 'admin' 角色的用户才能访问这个接口
router.post("/upsertUsers", protect, authorize(["admin"]), upsertUser);

// GET /api/users - 获取所有用户列表
router.get(
  "/getUserList",
  protect,
  authorize(["admin", "manager"]),
  getUserList
); // 假设管理员和经理可以查看用户列表

// DELETE /api/users/:id - 删除指定用户
router.delete("/deleteUser/:id", protect, authorize(["admin"]), deleteUser); // <-- 新增：只有管理员可以删除用户

router.get("/me", protect, getCurrentUser); // 添加此路由

// 重置用户密码路由
// 只有管理员 (admin) 角色可以访问此接口
router.put(
  "/:id/reset-password",
  protect, // 确保用户已登录
  authorize(["admin"]), // 确保用户拥有 'admin' 角色
  resetPassword
);

export default router;
