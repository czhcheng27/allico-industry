import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import {
  cleanupUnreferencedManagedUrls,
  collectCategoryManagedImageUrls,
  finalizeDraftAssets,
} from "../services/upload-asset.service.js";
import { buildUniqueSlug, toSlugBase } from "../utils/slug.js";
import { sendSuccess, sendError } from "../utils/response.js";

const CATEGORY_SLUG_SCAN_LIMIT = 5000;
const CATEGORY_SLUG_SAVE_RETRY_LIMIT = 3;

function isDuplicateKeyError(error, key) {
  if (!error || error.code !== 11000) {
    return false;
  }

  if (error.keyPattern && error.keyPattern[key]) {
    return true;
  }

  const message = String(error.message || "");
  return message.includes(`${key}_1`);
}

async function findAvailableCategorySlug(baseSlug, excludeId = null) {
  const normalizedBase = toSlugBase(baseSlug, "category");

  for (let sequence = 1; sequence <= CATEGORY_SLUG_SCAN_LIMIT; sequence += 1) {
    const candidate = buildUniqueSlug(normalizedBase, sequence);
    const filter = excludeId
      ? { slug: candidate, _id: { $ne: excludeId } }
      : { slug: candidate };

    const exists = await Category.exists(filter);
    if (!exists) {
      return candidate;
    }
  }

  throw new Error("Unable to allocate unique category slug");
}

function normalizeSubcategories(input) {
  if (!Array.isArray(input)) {
    return {
      normalizedSubcategories: [],
      renameMap: new Map(),
    };
  }

  const dedupe = new Set();
  const renameMap = new Map();
  const normalizedSubcategories = [];

  input.forEach((item) => {
    const name = String(item?.name || "").trim();
    const rawSlug = String(item?.slug || "").trim();
    const slug = toSlugBase(rawSlug || name, "subcategory");

    if (!name || !slug || dedupe.has(slug)) {
      return;
    }

    dedupe.add(slug);
    const originalSlug = String(item?.originalSlug || "").trim().toLowerCase();

    if (originalSlug && originalSlug !== slug && !renameMap.has(originalSlug)) {
      renameMap.set(originalSlug, slug);
    }

    normalizedSubcategories.push({
      slug,
      name,
      originalSlug,
    });
  });

  return {
    normalizedSubcategories,
    renameMap,
  };
}

function getRemovedSubcategorySlugs(
  previousSubcategories = [],
  normalizedSubcategories = [],
  renameMap = new Map(),
) {
  const nextSlugSet = new Set(
    normalizedSubcategories.map((item) => String(item?.slug || "").trim()),
  );
  const renamedSourceSet = new Set(renameMap.keys());

  return previousSubcategories
    .map((item) => String(item?.slug || "").trim().toLowerCase())
    .filter(
      (slug) =>
        Boolean(slug) && !nextSlugSet.has(slug) && !renamedSourceSet.has(slug),
    );
}

function buildCategoryPayload(input, slug, normalizedSubcategories) {
  return {
    slug,
    name: String(input.name || "").trim(),
    shortName: String(input.shortName || "").trim(),
    description: String(input.description || "").trim(),
    cardImage: String(input.cardImage || "").trim(),
    icon: String(input.icon || "category").trim() || "category",
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 0,
    subcategories: normalizedSubcategories.map((item) => ({
      slug: item.slug,
      name: item.name,
    })),
  };
}

async function getSubcategoriesInUse({
  categorySlug,
  removedSubcategorySlugs,
}) {
  const normalizedCategory = String(categorySlug || "").trim();
  const normalizedRemoved = [...new Set(removedSubcategorySlugs)]
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);

  if (!normalizedCategory || normalizedRemoved.length === 0) {
    return [];
  }

  const inUse = await Product.distinct("subcategory", {
    category: normalizedCategory,
    subcategory: { $in: normalizedRemoved },
  });

  return inUse
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);
}

async function migrateRelatedProducts({
  previousCategorySlug,
  nextCategorySlug,
  subcategoryRenameMap,
}) {
  const previous = String(previousCategorySlug || "").trim();
  const next = String(nextCategorySlug || "").trim();

  if (!previous || !next) {
    return;
  }

  if (previous !== next) {
    await Product.updateMany(
      { category: previous },
      { $set: { category: next } },
    );
  }

  for (const [oldSlug, newSlug] of subcategoryRenameMap.entries()) {
    const from = String(oldSlug || "").trim().toLowerCase();
    const to = String(newSlug || "").trim().toLowerCase();

    if (!from || !to || from === to) {
      continue;
    }

    await Product.updateMany(
      { category: next, subcategory: from },
      { $set: { subcategory: to } },
    );
  }
}

function diffRemovedUrls(previousUrls = [], nextUrls = []) {
  const previousSet = new Set(previousUrls);
  const nextSet = new Set(nextUrls);
  return [...previousSet].filter((url) => !nextSet.has(url));
}

async function finalizeCategoryAssetLifecycle({
  uploadDraftId,
  userId,
  previousManagedUrls,
  nextManagedUrls,
}) {
  const normalizedDraftId = String(uploadDraftId || "").trim();
  const removedUrls = diffRemovedUrls(previousManagedUrls, nextManagedUrls);

  try {
    if (normalizedDraftId) {
      await finalizeDraftAssets({
        module: "categories",
        draftId: normalizedDraftId,
        userId: userId || null,
        usedUrls: nextManagedUrls,
      });
    }
  } catch (error) {
    console.error("Finalize category draft assets error:", error);
  }

  try {
    if (removedUrls.length > 0) {
      await cleanupUnreferencedManagedUrls({
        module: "categories",
        urls: removedUrls,
      });
    }
  } catch (error) {
    console.error("Cleanup removed category image assets error:", error);
  }
}

export const upsertCategory = async (req, res) => {
  const { id, uploadDraftId = "" } = req.body;
  const normalizedName = String(req.body.name || "").trim();
  const rawInputSlug = String(req.body.slug || "").trim();
  const categorySlugBase = toSlugBase(
    rawInputSlug || normalizedName,
    "category",
  );
  const { normalizedSubcategories, renameMap } = normalizeSubcategories(
    req.body.subcategories,
  );

  if (!normalizedName) {
    return sendError(res, "Missing required fields (name)", 400);
  }

  try {
    if (id && id !== "") {
      const category = await Category.findById(id);
      if (!category) {
        return sendError(res, "Category not found", 404);
      }

      const previousSlug = String(category.slug || "").trim().toLowerCase();
      const previousManagedUrls = collectCategoryManagedImageUrls(category);
      const removedSubcategorySlugs = getRemovedSubcategorySlugs(
        category.subcategories,
        normalizedSubcategories,
        renameMap,
      );
      const inUseRemovedSubcategories = await getSubcategoriesInUse({
        categorySlug: previousSlug,
        removedSubcategorySlugs,
      });

      if (inUseRemovedSubcategories.length > 0) {
        return sendError(
          res,
          `Cannot remove subcategories in use: ${inUseRemovedSubcategories.join(", ")}`,
          409,
        );
      }

      const slugChangedByInput = categorySlugBase !== previousSlug;
      let resolvedSlug = slugChangedByInput
        ? await findAvailableCategorySlug(categorySlugBase, id)
        : previousSlug;
      let latestSaveError = null;
      const payloadBase = buildCategoryPayload(
        req.body,
        resolvedSlug,
        normalizedSubcategories,
      );
      const nextManagedUrls = collectCategoryManagedImageUrls(payloadBase);

      for (let retry = 0; retry <= CATEGORY_SLUG_SAVE_RETRY_LIMIT; retry += 1) {
        try {
          Object.assign(category, { ...payloadBase, slug: resolvedSlug });
          await category.save();
          latestSaveError = null;
          break;
        } catch (error) {
          latestSaveError = error;
          const canRetrySlug =
            slugChangedByInput &&
            isDuplicateKeyError(error, "slug") &&
            retry < CATEGORY_SLUG_SAVE_RETRY_LIMIT;
          if (!canRetrySlug) {
            throw error;
          }

          resolvedSlug = await findAvailableCategorySlug(categorySlugBase, id);
        }
      }

      if (latestSaveError) {
        throw latestSaveError;
      }

      try {
        await migrateRelatedProducts({
          previousCategorySlug: previousSlug,
          nextCategorySlug: category.slug,
          subcategoryRenameMap: renameMap,
        });
      } catch (syncError) {
        console.error("Sync related category slugs error:", syncError);
      }

      await finalizeCategoryAssetLifecycle({
        uploadDraftId,
        userId: req.user?._id || null,
        previousManagedUrls,
        nextManagedUrls,
      });

      return sendSuccess(res, category, "Category updated successfully", 200);
    }

    let resolvedSlug = await findAvailableCategorySlug(categorySlugBase);
    let latestCreateError = null;
    let created = null;

    for (let retry = 0; retry <= CATEGORY_SLUG_SAVE_RETRY_LIMIT; retry += 1) {
      try {
        const payload = buildCategoryPayload(
          req.body,
          resolvedSlug,
          normalizedSubcategories,
        );
        created = await Category.create(payload);
        latestCreateError = null;
        break;
      } catch (error) {
        latestCreateError = error;
        const canRetrySlug =
          isDuplicateKeyError(error, "slug") &&
          retry < CATEGORY_SLUG_SAVE_RETRY_LIMIT;
        if (!canRetrySlug) {
          throw error;
        }

        resolvedSlug = await findAvailableCategorySlug(categorySlugBase);
      }
    }

    if (latestCreateError || !created) {
      throw latestCreateError || new Error("Create category failed");
    }

    const nextManagedUrls = collectCategoryManagedImageUrls(created);
    await finalizeCategoryAssetLifecycle({
      uploadDraftId,
      userId: req.user?._id || null,
      previousManagedUrls: [],
      nextManagedUrls,
    });
    return sendSuccess(res, created, "Category created successfully", 201);
  } catch (error) {
    console.error("Upsert Category Error:", error);
    if (isDuplicateKeyError(error, "slug")) {
      return sendError(res, "Failed to generate unique category slug", 409);
    }
    return sendError(res, "Server error", 500);
  }
};

export const getCategoryList = async (req, res) => {
  const keyword = String(req.query.keyword || "").trim();
  const filter = {};

  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { slug: { $regex: keyword, $options: "i" } },
      { shortName: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { "subcategories.name": { $regex: keyword, $options: "i" } },
    ];
  }

  try {
    const categories = await Category.find(filter).sort({
      sortOrder: 1,
      createdAt: 1,
    });

    return sendSuccess(
      res,
      {
        categories,
        total: categories.length,
      },
      "Category list fetched successfully",
      200,
    );
  } catch (error) {
    console.error("Get Category List Error:", error);
    return sendError(res, "Server error", 500);
  }
};

export const getCategoryBySlug = async (req, res) => {
  const slug = String(req.params.slug || "").trim();
  if (!slug) {
    return sendError(res, "Category slug is required", 400);
  }

  try {
    const category = await Category.findOne({ slug });
    if (!category) {
      return sendError(res, "Category not found", 404);
    }

    return sendSuccess(res, category, "Category fetched successfully", 200);
  } catch (error) {
    console.error("Get Category Error:", error);
    return sendError(res, "Server error", 500);
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return sendError(res, "Category ID is required", 400);
  }

  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return sendError(res, "Category not found", 404);
    }

    try {
      const managedUrls = collectCategoryManagedImageUrls(category);
      if (managedUrls.length > 0) {
        await cleanupUnreferencedManagedUrls({
          module: "categories",
          urls: managedUrls,
        });
      }
    } catch (cleanupError) {
      console.error("Cleanup category assets after deletion error:", cleanupError);
    }

    return sendSuccess(res, null, "Category deleted successfully", 200);
  } catch (error) {
    console.error("Delete Category Error:", error);
    if (error.name === "CastError") {
      return sendError(res, "Invalid category ID format", 400);
    }
    return sendError(res, "Server error", 500);
  }
};
