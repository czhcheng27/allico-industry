import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import mongoose from "mongoose";
import { Product } from "../src/models/product.model.js";

const HOT_SELLER_LABEL = "HOT SELLER";
const rawMongoUrl = process.env.MONGO_URL;
const MONGO_URL = rawMongoUrl
  ? rawMongoUrl.trim().replace(/^"|"$/g, "")
  : "mongodb://localhost:27017/allico-industry";

function isHotSellerLabel(value: unknown) {
  return String(value || "").trim().toUpperCase() === HOT_SELLER_LABEL;
}

function stripLegacyHotSellerTags(input: unknown) {
  if (!Array.isArray(input)) {
    return [];
  }

  const dedupe = new Set<string>();
  const normalized: string[] = [];

  input.forEach((item) => {
    const value = String(item || "").trim();
    const dedupeKey = value.toLowerCase();

    if (!value || isHotSellerLabel(value) || dedupe.has(dedupeKey)) {
      return;
    }

    dedupe.add(dedupeKey);
    normalized.push(value);
  });

  return normalized;
}

async function backfillProductDisplayOrder() {
  const products = await Product.find({}).sort({ category: 1, updatedAt: -1 });
  const groupedProducts = new Map<string, typeof products>();

  products.forEach((product) => {
    const category = String(product.category || "").trim();
    const current = groupedProducts.get(category) || [];
    current.push(product);
    groupedProducts.set(category, current);
  });

  const bulkOperations: Array<Record<string, unknown>> = [];

  groupedProducts.forEach((items, category) => {
    const hotSellerProducts: typeof items = [];
    const regularProducts: typeof items = [];

    items.forEach((product) => {
      const isHotSeller =
        Boolean(product.isHotSeller) ||
        isHotSellerLabel(product.badge) ||
        (Array.isArray(product.detailTags) &&
          product.detailTags.some((item) => isHotSellerLabel(item)));

      if (isHotSeller) {
        hotSellerProducts.push(product);
      } else {
        regularProducts.push(product);
      }
    });

    hotSellerProducts.forEach((product, index) => {
      bulkOperations.push({
        updateOne: {
          filter: { _id: product._id, category },
          update: {
            $set: {
              isHotSeller: true,
              displayOrder: index,
              badge: isHotSellerLabel(product.badge) ? "" : String(product.badge || "").trim(),
              detailTags: stripLegacyHotSellerTags(product.detailTags),
            },
          },
        },
      });
    });

    regularProducts.forEach((product, index) => {
      bulkOperations.push({
        updateOne: {
          filter: { _id: product._id, category },
          update: {
            $set: {
              isHotSeller: false,
              displayOrder: index,
              badge: isHotSellerLabel(product.badge) ? "" : String(product.badge || "").trim(),
              detailTags: stripLegacyHotSellerTags(product.detailTags),
            },
          },
        },
      });
    });
  });

  if (bulkOperations.length > 0) {
    await Product.bulkWrite(bulkOperations as never);
  }

  console.log(`Backfilled display order for ${products.length} products.`);
}

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
    await backfillProductDisplayOrder();
  } catch (error) {
    console.error("Backfill product display order failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

void main();
