// 登录业务逻辑
// server/src/controllers/auth.controller.js
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Role } from "../models/role.model.js";
import { comparePassword } from "../lib/hash.js";
import { signToken } from "../lib/jwt.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // const user = await User.findOne({
    //   $or: [{ username: identifier }, { email: identifier }],
    // });

    const user = await User.findOne({ email: identifier });

    if (!user) return sendError(res, "User not found", 401);

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return sendError(res, "Invalid password", 401);

    // --- 核心修改：登录时动态聚合用户权限 ---
    const userRoleNames = user.roles; // 获取用户的所有角色名称，例如 ['admin', 'manager']

    // 根据角色名称查询对应的角色文档，只选择 'permissions' 字段
    const rolesWithPermissions = await Role.find({
      roleName: { $in: userRoleNames },
    }).select("permissions -_id"); // 只获取权限字段，不获取 _id

    // 聚合所有角色的权限，处理重复项
    const aggregatedPermissionsMap = new Map();
    rolesWithPermissions.forEach((roleDoc) => {
      if (roleDoc.permissions && Array.isArray(roleDoc.permissions)) {
        roleDoc.permissions.forEach((perm) => {
          if (perm && perm.route && Array.isArray(perm.actions)) {
            if (aggregatedPermissionsMap.has(perm.route)) {
              const existingActions = aggregatedPermissionsMap.get(perm.route);
              const newActions = [
                ...new Set([...existingActions, ...perm.actions]),
              ]; // 合并并去重 action
              aggregatedPermissionsMap.set(perm.route, newActions);
            } else {
              aggregatedPermissionsMap.set(perm.route, perm.actions);
            }
          }
        });
      }
    });

    const userPermissions = Array.from(aggregatedPermissionsMap).map(
      ([route, actions]) => ({
        route,
        actions,
      })
    );

    const token = signToken({ userId: user._id, roles: user.roles });
    const decoded = jwt.decode(token); // 解码获取过期时间
    const expired = decoded.exp; // exp 是秒级 UNIX 时间戳

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
      200
    );
  } catch (err) {
    console.error("Login Error:", err);
    return sendError(res, "Server error", 500);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return sendSuccess(res, null, "Logout successful");
};
