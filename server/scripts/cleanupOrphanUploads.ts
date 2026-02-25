import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import mongoose from "mongoose";
import { cleanupStaleUploadAssets } from "../src/services/upload-asset.service.js";

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

const rawMongoUrl = process.env.MONGO_URL;
const MONGO_URL = rawMongoUrl
  ? rawMongoUrl.trim().replace(/^"|"$/g, "")
  : "mongodb://127.0.0.1:27017/allico-industry";

const stagedMaxAgeHours = parsePositiveInt(
  process.env.UPLOAD_ASSET_STAGED_TTL_HOURS,
  24,
);
const cleanupBatch = parsePositiveInt(process.env.UPLOAD_ASSET_CLEANUP_BATCH, 200);

async function runCleanup() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URL);
      console.log("Connected to MongoDB");
    }

    const summary = await cleanupStaleUploadAssets({
      stagedMaxAgeHours,
      limit: cleanupBatch,
    });

    console.log("Upload assets cleanup completed:", summary);
  } catch (error) {
    console.error("Upload assets cleanup failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void runCleanup();
