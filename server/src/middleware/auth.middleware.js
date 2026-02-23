/* 更新说明（2026-02-20）： 鉴权中间件在 protect 基础上新增 attachPermissions 与路由级 action/access 守卫。 */
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import {
  aggregatePermissionsByRoles,
  hasRouteAccess,
  hasRouteAction,
} from "../services/permission.service.js";
import { sendError } from "../utils/response.js";

// 基础鉴权中间件：校验 JWT（支持 Authorization 和 cookie），并把用户挂到 req.user。
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, "Not authorized, no token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return sendError(res, "Not authorized, user not found", 401);
    }

    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return sendError(res, "Not authorized, token has expired", 401);
    }

    return sendError(res, "Not authorized, token is invalid", 401);
  }
};

// 权限挂载中间件：根据用户角色实时聚合权限，写入 req.userPermissions。
export const attachPermissions = async (req, res, next) => {
  if (!req.user) {
    return sendError(res, "Authorization error: User not authenticated", 401);
  }

  try {
    req.userPermissions = await aggregatePermissionsByRoles(req.user.roles || []);
    next();
  } catch (error) {
    console.error("Permission aggregation error:", error);
    return sendError(res, "Failed to resolve user permissions", 500);
  }
};

// 路由访问权限工厂：用于“是否可访问某页面/模块”的校验。
export const authorizeRouteAccess = (route) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authorization error: User not authenticated", 401);
    }

    if (!hasRouteAccess(req.userPermissions || [], route)) {
      return sendError(res, "Forbidden: route access denied", 403);
    }

    next();
  };
};

// 路由动作权限工厂：用于写操作等 action 级别权限校验（默认 write）。
export const authorizeRouteAction = (route, action = "write") => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authorization error: User not authenticated", 401);
    }

    if (!hasRouteAction(req.userPermissions || [], route, action)) {
      return sendError(res, "Forbidden: action permission denied", 403);
    }

    next();
  };
};

// 角色校验工厂（兼容旧逻辑）：在仍有角色硬编码的场景下可继续使用。
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Authorization error: User not authenticated", 401);
    }

    const hasPermission = allowedRoles.some((role) =>
      (req.user.roles || []).includes(role),
    );

    if (!hasPermission) {
      return sendError(
        res,
        "Forbidden: You do not have the required role to access this resource",
        403,
      );
    }

    next();
  };
};
