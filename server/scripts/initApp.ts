import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import mongoose from "mongoose";

import { User } from "../src/models/user.model.js";
import { Role } from "../src/models/role.model.js";
import { Permission } from "../src/models/permission.model.js";
import { Product } from "../src/models/product.model.js";
import { Category } from "../src/models/category.model.js";
import { hashPassword } from "../src/lib/hash.js";
import { routeConfig } from "../src/config/route.config";
import { productSeedList } from "../src/config/product.seed.js";
import { categorySeedList } from "../src/config/category.seed.js";

const rawMongoUrl = process.env.MONGO_URL;
const MONGO_URL = rawMongoUrl
  ? rawMongoUrl.trim().replace(/^"|"$/g, "")
  : "mongodb://localhost:27017/allico-industry";

async function syncPermissionsInDB() {
  for (const item of routeConfig) {
    await Permission.updateOne(
      { route: item.route },
      {
        $set: {
          actions: item.actions,
          defaultRoles: item.defaultRoles,
          initialized: true,
        },
      },
      { upsert: true },
    );
  }
}

async function getAllPermissions() {
  return Permission.find({}, { route: 1, actions: 1, _id: 0 }).lean();
}

async function ensureAdminRole(allPermissions: Array<{ route: string; actions: string[] }>) {
  const adminRoleName = "admin";
  let adminRole = await Role.findOne({ roleName: adminRoleName });

  if (!adminRole) {
    adminRole = new Role({
      roleName: adminRoleName,
      description: "Default super admin role",
      permissions: allPermissions,
    });
    await adminRole.save();
    return;
  }

  let updated = false;
  const permissionMap = new Map(
    adminRole.permissions.map((item) => [item.route, item.actions] as const),
  );

  for (const permission of allPermissions) {
    const existing = permissionMap.get(permission.route);
    if (
      !existing ||
      existing.length !== permission.actions.length ||
      !existing.every((action) => permission.actions.includes(action))
    ) {
      const index = adminRole.permissions.findIndex(
        (item) => item.route === permission.route,
      );
      if (index >= 0) {
        adminRole.permissions[index].actions = permission.actions;
      } else {
        adminRole.permissions.push(permission);
      }
      updated = true;
    }
  }

  if (updated) {
    await adminRole.save();
  }
}

async function ensureAdminUser(allPermissions: Array<{ route: string; actions: string[] }>) {
  const adminUsername = "admin";
  const adminPassword = "admin";
  const adminEmail = "admin";

  const existing = await User.findOne({ username: adminUsername });
  if (existing) {
    existing.permissions = allPermissions;
    existing.roles = ["admin"];
    await existing.save();
    return;
  }

  const hashedPassword = await hashPassword(adminPassword);
  await User.create({
    username: adminUsername,
    password: hashedPassword,
    email: adminEmail,
    roles: ["admin"],
    permissions: allPermissions,
  });
}

async function seedProducts() {
  for (const item of productSeedList) {
    await Product.updateOne(
      { sku: item.sku },
      { $set: item },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }
}

async function seedCategories() {
  for (const item of categorySeedList) {
    await Category.updateOne(
      { slug: item.slug },
      { $set: item },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }
}

async function initApp() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URL);
      console.log("Connected to MongoDB");
    }

    await syncPermissionsInDB();
    console.log("Permissions synced to DB");

    const allPermissions = await getAllPermissions();
    await ensureAdminRole(allPermissions);
    await ensureAdminUser(allPermissions);
    await seedCategories();
    await seedProducts();

    console.log("Init completed: admin role/user, categories and products are ready");
  } catch (error) {
    console.error("Init failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

initApp();
