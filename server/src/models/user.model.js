// 用户模型
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    roles: [String],
    permissions: [
      {
        route: { type: String, required: true },
        actions: { type: [String], enum: ["read", "write"], default: [] },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      // <--- 添加 toJSON 配置
      virtuals: true, // 启用虚拟属性，例如 Mongoose 默认的 'id'
      transform: (doc, ret) => {
        // 对返回的 JSON 对象进行转换
        ret.id = ret._id; // 将 _id 的值赋给 id 属性
        delete ret._id; // 删除 _id 属性
        delete ret.__v; // 删除 __v（版本键）属性
        delete ret.password; // 删除 password 属性，不在响应中返回密码哈希
        return ret;
      },
    },
    toObject: {
      // <--- 可选：也配置 toObject，确保当调用 .toObject() 时也生效
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

export const User = mongoose.model("User", userSchema);
