// server/src/controllers/role.controller.js
import { Role } from "../models/role.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * @desc 创建或更新角色
 * @route POST /api/roles/upsertRole
 * @access Admin
 * @body {string} [id] - 可选的角色ID，如果为""或不传则为创建，有值则为编辑
 * @body {string} roleName - 角色名称 (必填，唯一)
 * @body {string} [description] - 角色描述 (可选)
 * @body {Array<Object>} [permissions] - 权限数组，每个元素包含 route (string) 和 actions (string[])
 */
export const upsertRole = async (req, res) => {
  const { id, roleName, description, permissions } = req.body;

  // 1. 基本输入验证
  if (!roleName) {
    return sendError(res, "Role name is required", 400);
  }

  try {
    let role;

    if (id && id !== "") {
      // **编辑角色流程**
      role = await Role.findById(id);
      if (!role) {
        return sendError(res, "Role not found", 404);
      }

      // 检查更新后的 roleName 是否与**其他**角色重复 (排除当前角色自身)
      const existingRoleByName = await Role.findOne({
        roleName,
        _id: { $ne: id },
      });
      if (existingRoleByName) {
        return sendError(res, "Role name already exists for another role", 409);
      }

      // 更新角色信息
      role.roleName = roleName;
      role.description = description || ""; // 确保 description 即使不传也是空字符串
      role.permissions = permissions || []; // 更新权限数组，如果前端没传就设为空数组
    } else {
      // **创建角色流程**
      // 检查 roleName 是否已存在
      const existingRole = await Role.findOne({ roleName });
      if (existingRole) {
        return sendError(res, "Role name already exists", 409);
      }

      // 创建新角色实例
      role = new Role({
        roleName,
        description: description || "",
        permissions: permissions || [], // 初始化权限数组
      });
    }

    // 保存角色到数据库（无论是新建还是更新）
    await role.save();

    // 返回成功响应
    return sendSuccess(
      res,
      role, // Mongoose Schema 中的 toJSON 会自动处理 _id 到 id 的转换
      id && id !== ""
        ? "Role updated successfully"
        : "Role created successfully",
      id && id !== "" ? 200 : 201 // 更新返回 200 OK，创建返回 201 Created
    );
  } catch (error) {
    console.error("Upsert Role Error:", error);
    if (error.code === 11000) {
      // MongoDB 唯一索引错误
      return sendError(
        res,
        "Duplicate entry for unique field (e.g., role name).",
        409
      );
    }
    return sendError(res, "Server error", 500);
  }
};

/**
 * @desc 获取所有角色列表 (带分页)
 * @route GET /api/roles?page=<number>&pageSize=<number>
 * @access Admin, Manager
 * @query {number} [page=1] - 当前页数
 * @query {number} [pageSize=10] - 每页数据量
 */
export const getRoles = async (req, res) => {
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

    // 1. 获取总角色数量 (用于计算总页数)
    const totalRoles = await Role.countDocuments({});

    // 2. 查询当前页的角色数据
    const roles = await Role.find({})
      .skip(skip) // 跳过前面页面已有的数据
      .limit(pageSize); // 限制返回的数据量为每页大小

    // 3. 计算总页数
    const totalPages = Math.ceil(totalRoles / pageSize);

    // 4. 返回成功响应，包含分页信息
    return sendSuccess(
      res,
      {
        roles, // 当前页的角色数据
        total: totalRoles, // 总角色数量
        page, // 当前页码
        pageSize, // 每页数据量
        totalPages, // 总页数
      },
      "Roles fetched successfully",
      200
    );
  } catch (error) {
    console.error("Get Roles Error:", error);
    return sendError(res, "Server error", 500);
  }
};

/**
 * @desc 删除角色
 * @route DELETE /api/roles/:id
 * @access Admin
 */
export const deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findById(id);
    if (!role) {
      return sendError(res, "Role not found", 404);
    }

    // 重要的安全检查：不允许删除 'admin' 角色
    if (role.roleName === "admin") {
      return sendError(res, "Deletion of 'admin' role is not allowed.", 403);
    }

    // 额外的检查：如果用户模型中的 roles 字段直接引用了角色名称，
    // 删除角色前可能需要检查是否有用户仍在使用此角色，以避免数据不一致。
    // 如果有用户使用此角色，可以阻止删除或将这些用户的此角色移除/替换。
    // 例如：const usersWithRole = await User.countDocuments({ roles: role.roleName });
    // if (usersWithRole > 0) {
    //   return sendError(res, `Cannot delete role '${role.roleName}' because ${usersWithRole} users still have it.`, 409);
    // }

    await Role.findByIdAndDelete(id);
    return sendSuccess(
      res,
      null,
      `Role '${role.roleName}' deleted successfully`,
      200
    );
  } catch (error) {
    console.error("Delete Role Error:", error);
    return sendError(res, "Server error", 500);
  }
};
