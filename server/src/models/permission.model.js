import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
  route: { type: String, required: true, unique: true },
  actions: { type: [String], default: ["write"] },
  defaultRoles: { type: [String], default: [] },
  initialized: { type: Boolean, default: false },
});

export const Permission = mongoose.model("Permission", permissionSchema);
