// server/src/models/role.model.js
import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true, // 角色名称必须唯一
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    permissions: [
      {
        route: { type: String, required: true },
        // actions 应该是一个字符串数组，包含 "read" 和 "write"
        actions: { type: [String], enum: ["read", "write"], default: [] },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      // 同样配置 toJSON，让返回前端时包含 id 并删除 _id, __v
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Role = mongoose.model("Role", roleSchema);
