/* 更新说明（2026-02-20）： 登录/登出已对齐 cookie 会话方案，并使用动态角色权限聚合。 */
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { comparePassword } from "../lib/hash.js";
import { signToken } from "../lib/jwt.js";
import { aggregatePermissionsByRoles } from "../services/permission.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    if (!user) {
      return sendError(res, "User not found", 401);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid password", 401);
    }

    const userPermissions = await aggregatePermissionsByRoles(user.roles || []);
    const token = signToken({ userId: user._id, roles: user.roles });
    const decoded = jwt.decode(token);
    const expired = decoded?.exp || 0;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE_MS,
    });

    return sendSuccess(
      res,
      {
        token,
        expired,
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          roles: user.roles,
          permissions: userPermissions,
        },
      },
      "Login successful",
      200,
    );
  } catch (err) {
    console.error("Login Error:", err);
    return sendError(res, "Server error", 500);
  }
};

export const logout = (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  return sendSuccess(res, null, "Logout successful");
};
