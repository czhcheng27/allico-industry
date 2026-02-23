/* 更新说明（2026-02-20）： 当前用户接口返回最新聚合权限，用户 CRUD 与 route/action 授权保持一致。 */
// server/src/controllers/user.controller.js
import { User } from "../models/user.model.js";
import { hashPassword } from "../lib/hash.js";
import { aggregatePermissionsByRoles } from "../services/permission.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * @desc 创建或更新用户
 * @route POST /api/users
 * @access Admin
 * @body {string} [id] - 可选的用户ID，如果为""或不传则为创建，有值则为编辑
 * @body {string} username - 用户名
 * @body {string} email - 邮箱
 * @body {string[]} roles - 角色数组
 * @body {string} [password] - 密码 (创建时必填，编辑时可选)
 */
export const upsertUser = async (req, res) => {
  const { id, username, email, roles, password } = req.body;

  // 1. 基本输入验证
  if (!username || !email || !Array.isArray(roles)) {
    return sendError(
      res,
      "Missing required fields (username, email, roles) or invalid roles format",
      400
    );
  }

  // 只有在创建新用户时，密码才是必填的
  if ((!id || id === "") && !password) {
    return sendError(res, "Password is required for new user creation", 400);
  }

  try {
    let user;

    if (id && id !== "") {
      // **编辑用户流程**
      user = await User.findById(id);
      if (!user) {
        return sendError(res, "User not found", 404);
      }

      // 2. 检查更新后的 email 是否与**其他**用户重复 (排除当前用户自身)
      const existingUserByEmail = await User.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingUserByEmail) {
        return sendError(res, "Email already exists for another user", 409);
      }
      // 移除了对 username 的重复检查

      // 更新用户信息
      user.username = username;
      user.email = email;
      user.roles = roles;

      // 只有当提供了新密码时才加密并更新
      if (password) {
        user.password = await hashPassword(password);
      }
    } else {
      // **创建用户流程**
      // 2. 检查 email 是否已存在 (这里也可以依赖 Mongoose 的 unique 错误捕获)
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return sendError(res, "Email already exists", 409);
      }
      // 移除了对 username 的重复检查

      // 3. 加密密码 (此时 password 必传，前面已验证)
      const hashedPassword = await hashPassword(password);

      // 4. 创建新用户实例
      user = new User({
        username,
        email,
        password: hashedPassword,
        roles: roles,
        permissions: [],
      });
    }

    // 5. 保存用户到数据库（无论是新建还是更新）
    await user.save();

    // 6. 返回成功响应
    // const responseData = user.toObject({ getters: true });
    // delete responseData.password; // 移除密码哈希
    // const responseData = {
    //   _id: user._id,
    //   username: user.username,
    //   email: user.email,
    //   roles: user.roles,
    //   createdAt: user.createdAt,
    //   updatedAt: user.updatedAt,
    // };

    return sendSuccess(
      res,
      user,
      id && id !== ""
        ? "User updated successfully"
        : "User created successfully",
      id && id !== "" ? 200 : 201
    );
  } catch (err) {
    console.error("Upsert User Error:", err);
    // 捕获 MongoDB 的唯一索引错误，并返回 409 Conflict
    if (err.code === 11000) {
      // 可以进一步解析 err.message 来判断是哪个字段重复，但通常返回通用消息即可
      return sendError(
        res,
        "Duplicate entry for unique field (e.g., email).",
        409
      );
    }
    return sendError(res, "Server error", 500);
  }
};

/**
 * @desc 获取用户列表 (带分页)
 * @route GET /api/users?page=<number>&pageSize=<number>
 * @access Admin (或根据你的策略决定哪些角色可以获取列表)
 * @query {number} page - 当前页数 (默认为 1)
 * @query {number} pageSize - 每页数据量 (默认为 10)
 */
export const getUserList = async (req, res) => {
  // 从查询参数中获取 page 和 pageSize
  // 使用 parseInt 转换为数字，并设置默认值
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  // 计算跳过的文档数量 (offset)
  const skip = (page - 1) * pageSize;

  try {
    // 设置响应头，禁止缓存动态数据
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    // 1. 获取总用户数量 (用于计算总页数)
    const totalUsers = await User.countDocuments({});

    // 2. 查询当前页的用户数据
    const users = await User.find({})
      .select("-password") // 不返回密码hash
      .skip(skip) // 跳过前面页面已有的数据
      .limit(pageSize); // 限制返回的数据量为每页大小

    // 3. 计算总页数
    const totalPages = Math.ceil(totalUsers / pageSize);

    // 4. 返回成功响应，包含分页信息
    return sendSuccess(
      res,
      {
        users, // 当前页的用户数据
        total: totalUsers, // 总用户数量
        page, // 当前页码
        pageSize, // 每页数据量
        totalPages, // 总页数
      },
      "User list fetched successfully",
      200
    );
  } catch (err) {
    console.error("Get User List Error:", err);
    return sendError(res, "Server error", 500);
  }
};

/**
 * @desc 删除用户
 * @route DELETE /api/users/:id
 * @access Admin
 * @param {string} id - URL 参数中的用户 ID
 */
export const deleteUser = async (req, res) => {
  const userId = req.params.id; // 从 URL 参数中获取用户 ID

  // 1. 基本验证：确保提供了用户 ID
  if (!userId) {
    return sendError(res, "User ID is required for deletion", 400);
  }

  try {
    // 2. 先查找用户，而不是直接删除，以便检查其角色
    const userToDelete = await User.findById(userId);

    // 检查用户是否存在
    if (!userToDelete) {
      return sendError(res, "User not found", 404);
    }

    // **新增容错：不允许删除管理员用户**
    // 检查被删除用户的角色列表是否包含 'admin'
    if (userToDelete.roles.includes("admin")) {
      // 额外的检查：防止管理员删除自己，但更重要的是防止删除任何管理员账户
      // 更好的做法是，即使是管理员自己，也不能通过这个接口删除任何 admin 账户
      return sendError(res, "Deletion of admin users is not allowed.", 403); // 403 Forbidden
    }

    // 3. 如果通过了管理员检查，则执行删除操作
    await User.findByIdAndDelete(userId); // 使用 findByIdAndDelete 实际执行删除

    // 4. 返回成功响应
    return sendSuccess(
      res,
      null,
      `User ${userToDelete.username} deleted successfully`,
      200
    );
  } catch (err) {
    console.error("Delete User Error:", err);
    // 捕获无效 ID 格式的错误 (例如，ObjectId 格式不正确)
    if (err.name === "CastError" && err.path === "_id") {
      return sendError(res, "Invalid user ID format", 400);
    }
    return sendError(res, "Server error", 500);
  }
};

/**
 * @desc 获取当前登录用户的信息及最新权限
 * @route GET /api/users/me
 * @access Authenticated User (受 JWT 中间件保护)
 */
export const getCurrentUser = async (req, res) => {
  try {
    // 设置响应头，禁止缓存用户权限信息
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    // 假设你的认证中间件已将 user._id 存储在 req.user.userId
    const userId = req.user._id;

    // 从数据库中获取用户（不包含密码）
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return sendError(res, "用户未找到", 404);
    }

    // --- 动态权限聚合（与 login 逻辑相同）---
    const userPermissions = await aggregatePermissionsByRoles(user.roles || []);
    // --- 动态权限聚合结束 ---

    return sendSuccess(
      res,
      {
        _id: user._id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        permissions: userPermissions, // **关键：返回最新的聚合权限**
      },
      "当前用户信息获取成功",
      200
    );
  } catch (err) {
    console.error("获取当前用户错误:", err);
    return sendError(res, "服务器错误", 500);
  }
};

/**
 * @desc 重置用户密码为用户名
 * @route PUT /api/users/:id/reset-password
 * @access Admin
 * @param {string} id - URL 参数中的用户 ID
 */
export const resetPassword = async (req, res) => {
  const userId = req.params.id; // 从 URL 参数中获取用户 ID

  // 1. 基本验证：确保提供了用户 ID
  if (!userId) {
    return sendError(res, "User ID is required for password reset", 400);
  }

  try {
    // 2. 查找用户
    const user = await User.findById(userId);

    // 检查用户是否存在
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // 3. **新增容错：不允许重置管理员用户的密码**
    // 再次强调，出于安全考虑，通常不应该允许通过这种方式随意重置管理员密码。
    // 如果需要重置管理员密码，应该有更严格的验证流程（例如，只有超级管理员才能操作，或者需要多因素认证）。
    // 这里是为了防止误操作，但请根据实际安全需求调整。
    if (user.roles.includes("admin")) {
      return sendError(
        res,
        "Password reset for admin users is not allowed.",
        403
      );
    }

    // 4. 获取要重置的新密码（即用户的用户名）
    const newPassword = user.username;

    // 5. 对新密码进行哈希处理
    const hashedPassword = await hashPassword(newPassword);

    // 6. 更新用户密码并保存
    user.password = hashedPassword;
    await user.save();

    // 7. 返回成功响应
    return sendSuccess(
      res,
      null, // 通常重置密码不需要返回用户数据
      `User ${user.username}'s password has been reset to their username successfully`,
      200
    );
  } catch (err) {
    console.error("Reset User Password Error:", err);
    // 捕获无效 ID 格式的错误 (例如，ObjectId 格式不正确)
    if (err.name === "CastError" && err.path === "_id") {
      return sendError(res, "Invalid user ID format", 400);
    }
    return sendError(res, "Server error during password reset", 500);
  }
};

