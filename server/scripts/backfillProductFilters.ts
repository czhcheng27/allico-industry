import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import mongoose from "mongoose";

import { Product } from "../src/models/product.model.js";
import {
  getStrapLengthBucket,
  syncManagedListSpecs,
} from "../src/config/catalog-filter.config.js";

const rawMongoUrl = process.env.MONGO_URL;
const MONGO_URL = rawMongoUrl
  ? rawMongoUrl.trim().replace(/^"|"$/g, "")
  : "mongodb://localhost:27017/allico-industry";

function normalizeText(value: unknown) {
  return String(value || "").trim();
}

function getSpecValue(product: {
  listSpecs?: Array<{ label?: string; value?: string }>;
}, labels: string[]) {
  const normalizedLabels = labels.map((item) => item.toLowerCase());
  const matched = (product.listSpecs || []).find((item) =>
    normalizedLabels.includes(normalizeText(item?.label).toLowerCase()),
  );

  return normalizeText(matched?.value);
}

function parseChainSize(raw: string) {
  const normalized = normalizeText(raw).replace(/[”"]/g, '"');
  if (normalized.includes("1/4")) {
    return "1-4";
  }
  if (normalized.includes("5/16")) {
    return "5-16";
  }
  if (normalized.includes("3/8")) {
    return "3-8";
  }
  if (normalized.includes("1/2")) {
    return "1-2";
  }
  if (normalized.match(/\b2\s*"/)) {
    return "2";
  }
  return "";
}

function parseHookWidth(raw: string) {
  const normalized = normalizeText(raw).replace(/[â€"]/g, '"');
  const matched = normalized.match(/(?:^|x\s*)(\d+(?:\.\d+)?)\s*"/i);
  if (!matched) {
    return "";
  }

  const width = Number(matched[1]);
  if (![1, 2, 3, 4].includes(width)) {
    return "";
  }

  return String(width);
}

function parseFeetLength(raw: string) {
  const normalized = normalizeText(raw).replace(/[’']/g, "'");
  const matched = normalized.match(/(\d+(?:\.\d+)?)\s*'/);
  return matched ? Number(matched[1]) : null;
}

function parseStrapLength(raw: string) {
  const normalized = normalizeText(raw).replace(/[”"]/g, '"').replace(/[’']/g, "'");
  const feetMatch = normalized.match(/x\s*(\d+(?:\.\d+)?)\s*'/i);
  if (feetMatch) {
    return Number(feetMatch[1]);
  }

  const inchMatch = normalized.match(/x\s*(\d+(?:\.\d+)?)\s*"/i);
  if (!inchMatch) {
    return null;
  }

  return Number(inchMatch[1]) / 12;
}

function parseStrapWidth(raw: string) {
  const normalized = normalizeText(raw).replace(/[”"]/g, '"');
  const matched = normalized.match(/^(\d+(?:\.\d+)?)\s*"/);
  return matched ? Number(matched[1]) : null;
}

function parseHookLengthFromSize(raw: string) {
  const normalized = normalizeText(raw).replace(/[”"]/g, '"');
  const segment = normalized.includes("x")
    ? normalized.split("x").pop() || ""
    : normalized;

  if (segment.includes("1/4")) {
    return 0.25;
  }
  if (segment.includes("5/16")) {
    return 0.3125;
  }
  if (segment.includes("3/8")) {
    return 0.375;
  }
  if (segment.includes("1/2")) {
    return 0.5;
  }

  const matched = segment.match(/(\d+(?:\.\d+)?)\s*"/i);
  return matched ? Number(matched[1]) : null;
}

function parseHookSizeCode(raw: string) {
  const normalized = normalizeText(raw).replace(/[Ã¢â‚¬Ââ€"]/g, '"').toLowerCase();
  if (!normalized) {
    return "";
  }

  const segments = normalized.includes("x")
    ? normalized.split(/x/i).map((item) => item.trim()).filter(Boolean).reverse()
    : [];
  const candidates = [...segments, normalized];

  for (const candidate of candidates) {
    if (candidate.includes("1/4")) {
      return "0.25";
    }
    if (candidate.includes("5/16")) {
      return "0.3125";
    }
    if (candidate.includes("3/8")) {
      return "0.375";
    }
    if (candidate.includes("1/2")) {
      return "0.5";
    }

    const matched = candidate.match(/(\d+(?:\.\d+)?)/);
    if (!matched) {
      continue;
    }

    const size = Number(matched[1]);
    if (size === 0.25) {
      return "0.25";
    }
    if (size === 0.3125) {
      return "0.3125";
    }
    if (size === 0.375) {
      return "0.375";
    }
    if (size === 0.5) {
      return "0.5";
    }
    if (size === 8) {
      return "8";
    }
    if (size === 15) {
      return "15";
    }
  }

  return "";
}

function inferProductType(product: {
  category?: string;
  subcategory?: string;
  name?: string;
  listSpecs?: Array<{ label?: string; value?: string }>;
}) {
  const category = normalizeText(product.category).toLowerCase();
  const subcategory = normalizeText(product.subcategory).toLowerCase();
  const name = normalizeText(product.name).toLowerCase();
  const sizeValue = getSpecValue(product, ["Size", "Chain Size", "Hook Size"]);

  if (category === "cargo-control" && subcategory === "binder-chains-transport-chain") {
    if (name.includes("bulk")) {
      return "bulk-chain";
    }
    if (parseFeetLength(sizeValue) !== null) {
      return "transport-chain";
    }
    if (name.includes("binder")) {
      return "binder";
    }
  }

  if (
    (category === "cargo-control" && subcategory === "winch-and-ratchet-straps") ||
    (category === "towing" && subcategory === "towing-straps")
  ) {
    return "strap";
  }

  if (category === "hooks-and-accessories" && subcategory === "hooks") {
    return "hook";
  }

  if (category === "towing" && subcategory === "towing-accessories") {
    if (name.includes("snatch")) {
      return "snatch-block";
    }
    if (name.includes("ratchet")) {
      return "ratchet";
    }
    if (name.includes("hook")) {
      return "hook";
    }
  }

  return "";
}

function inferFilterAttributes(
  product: {
    listSpecs?: Array<{ label?: string; value?: string }>;
  },
  productType: string,
) {
  const sizeValue = getSpecValue(product, ["Size", "Chain Size", "Hook Size"]);

  if (productType === "transport-chain") {
    const chainSizeCode = parseChainSize(sizeValue);
    const chainLengthFt = parseFeetLength(sizeValue);
    if (!chainSizeCode || chainLengthFt === null) {
      return null;
    }

    return {
      chainSizeCode,
      chainLengthFt,
    };
  }

  if (productType === "bulk-chain" || productType === "binder") {
    const chainSizeCode = parseChainSize(sizeValue);
    if (!chainSizeCode) {
      return null;
    }

    return {
      chainSizeCode,
    };
  }

  if (productType === "strap") {
    const strapWidthIn = parseStrapWidth(sizeValue);
    const strapLengthFt = parseStrapLength(sizeValue);
    if (strapWidthIn === null || strapLengthFt === null) {
      return null;
    }

    return {
      strapWidthIn,
      strapLengthFt,
      strapLengthBucket: getStrapLengthBucket(strapLengthFt) || "",
    };
  }

  if (productType === "hook") {
    const hookSizeCode =
      parseHookSizeCode(getSpecValue(product, ["Size", "Hook Size"])) ||
      parseHookSizeCode(getSpecValue(product, ["Hook Length", "Length"])) ||
      parseHookSizeCode(getSpecValue(product, ["Hook Width", "Width"])) ||
      "";
    if (!hookSizeCode) {
      return null;
    }

    return {
      hookSizeCode,
    };
  }

  if (productType === "snatch-block" || productType === "ratchet") {
    return {};
  }

  return null;
}

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    const products = await Product.find({});
    const bulkOperations: Array<{
      updateOne: {
        filter: { _id: mongoose.Types.ObjectId };
        update: Record<string, unknown>;
      };
    }> = [];
    const unresolved: string[] = [];

    for (const product of products) {
      const normalizedListSpecs = Array.isArray(product.listSpecs)
        ? product.listSpecs.map((item) => ({
            label: normalizeText(item?.label),
            value: normalizeText(item?.value),
          }))
        : [];
      const productSnapshot = {
        category: normalizeText(product.category),
        subcategory: normalizeText(product.subcategory),
        name: normalizeText(product.name),
        listSpecs: normalizedListSpecs,
      };

      const inferredProductType = inferProductType(productSnapshot);
      if (!inferredProductType) {
        unresolved.push(`${product.sku}: unable to infer productType`);
        continue;
      }

      const inferredFilterAttributes = inferFilterAttributes(
        productSnapshot,
        inferredProductType,
      );
      if (inferredFilterAttributes === null) {
        unresolved.push(`${product.sku}: unable to infer filterAttributes`);
        continue;
      }

      const nextListSpecs = syncManagedListSpecs(
        normalizedListSpecs,
        inferredProductType,
        inferredFilterAttributes,
      );

      bulkOperations.push({
        updateOne: {
          filter: { _id: product.id },
          update: {
            $set: {
              productType: inferredProductType,
              filterAttributes: inferredFilterAttributes,
              listSpecs: nextListSpecs,
            },
            $unset: {
              "filterAttributes.hookLengthIn": "",
            },
          },
        },
      });
    }

    if (bulkOperations.length > 0) {
      await Product.bulkWrite(bulkOperations);
    }

    console.log(`Updated ${bulkOperations.length} products.`);
    if (unresolved.length > 0) {
      console.log("Needs manual review:");
      unresolved.forEach((item) => {
        console.log(`- ${item}`);
      });
    }
  } catch (error) {
    console.error("Backfill product filters failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void main();
