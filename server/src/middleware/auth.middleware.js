// server/src/middleware/auth.middleware.js
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response.js";
import { User } from "../models/user.model.js"; // 导入用户模型

/**
 * @desc 保护路由：验证 JWT token 是否有效并附加用户到请求对象
 * @param {Object} req - Express Request object
 * @param {Object} res - Express Response object
 * @param {Function} next - Express next middleware function
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. 从请求头或 cookie 中获取 token
  // 优先从 Authorization 头部获取 Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // 其次从 cookie 中获取 token
  else if (req.cookies.token) {
    token = req.cookies.token;
  }
  // 如果你还有其他获取 token 的方式，可以在这里添加

  if (!token) {
    return sendError(res, "Not authorized, no token provided", 401);
  }

  try {
    // 2. 验证 token
    // decoded 将包含 { userId: '...', roles: [...] }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. 查找用户并附加到请求对象（不包含密码）
    // 这一步确保 token 对应的用户是真实存在的
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return sendError(res, "Not authorized, user not found", 401); // token 有效但用户不存在
    }

    // 4. 继续执行下一个中间件或路由处理函数
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    // 根据错误的类型返回不同的信息，例如 token 过期、无效等
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Not authorized, token has expired", 401);
    }
    return sendError(res, "Not authorized, token is invalid", 401);
  }
};

/**
 * @desc 授权特定角色访问路由
 * @param {Array<string>} allowedRoles - 允许访问的角色列表 (例如 ['admin', 'manager'])
 * @returns {Function} Express middleware function
 */
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    // 确保 protect 中间件已运行并设置了 req.user
    if (!req.user) {
      return sendError(res, "Authorization error: User not authenticated", 401);
    }

    // 检查用户是否具有任一允许的角色
    const hasPermission = allowedRoles.some((role) =>
      req.user.roles.includes(role)
    );

    if (!hasPermission) {
      return sendError(
        res,
        "Forbidden: You do not have the required role to access this resource",
        403
      );
    }

    // 用户有权限，继续执行下一个中间件或路由处理函数
    next();
  };
};
