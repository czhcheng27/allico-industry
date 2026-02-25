import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import {
  cleanupUnreferencedManagedUrls,
  collectProductManagedImageUrls,
  finalizeDraftAssets,
} from "../services/upload-asset.service.js";
import { buildUniqueSlug, toSlugBase } from "../utils/slug.js";
import { sendSuccess, sendError } from "../utils/response.js";

const GALLERY_LIMIT = 8;
const DETAIL_TAG_LIMIT = 4;
const DETAIL_TAG_MAX_LENGTH = 24;
const SLUG_SCAN_LIMIT = 5000;
const SLUG_SAVE_RETRY_LIMIT = 3;

function normalizeSpecs(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter(
      (item) =>
        item &&
        typeof item.label === "string" &&
        typeof item.value === "string" &&
        item.label.trim() &&
        item.value.trim(),
    )
    .map((item) => ({
      label: item.label.trim(),
      value: item.value.trim(),
    }));
}

function normalizeGallery(input, mainImage = "") {
  if (!Array.isArray(input)) {
    return [];
  }

  const normalizedMainImage = String(mainImage || "").trim();
  const dedupe = new Set();
  const normalized = [];

  for (const item of input) {
    if (typeof item !== "string") {
      continue;
    }

    const value = item.trim();
    if (!value || value === normalizedMainImage || dedupe.has(value)) {
      continue;
    }

    dedupe.add(value);
    normalized.push(value);
    if (normalized.length >= GALLERY_LIMIT) {
      break;
    }
  }

  return normalized;
}

function normalizeDetailTags(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  const dedupe = new Set();
  const normalized = [];

  for (const item of input) {
    if (typeof item !== "string") {
      continue;
    }

    const value = item.trim().slice(0, DETAIL_TAG_MAX_LENGTH).trim();
    if (!value) {
      continue;
    }

    const dedupeKey = value.toLowerCase();
    if (dedupe.has(dedupeKey)) {
      continue;
    }

    dedupe.add(dedupeKey);
    normalized.push(value);
    if (normalized.length >= DETAIL_TAG_LIMIT) {
      break;
    }
  }

  return normalized;
}

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

async function findAvailableProductSlug(baseSlug, excludeId = null) {
  const normalizedBase = toSlugBase(baseSlug, "product");

  for (let sequence = 1; sequence <= SLUG_SCAN_LIMIT; sequence += 1) {
    const candidate = buildUniqueSlug(normalizedBase, sequence);
    const filter = excludeId
      ? { slug: candidate, _id: { $ne: excludeId } }
      : { slug: candidate };

    const exists = await Product.exists(filter);
    if (!exists) {
      return candidate;
    }
  }

  throw new Error("Unable to allocate unique product slug");
}

async function validateCategoryAndSubcategory(categorySlug, subcategorySlug) {
  const normalizedCategory = String(categorySlug || "").trim();
  const normalizedSubcategory = String(subcategorySlug || "").trim();
  const category = await Category.findOne({ slug: normalizedCategory }).select(
    "slug subcategories",
  );

  if (!category) {
    return {
      error: "Invalid category: category does not exist",
      subcategory: "",
    };
  }

  const categorySubcategories = Array.isArray(category.subcategories)
    ? category.subcategories
    : [];

  if (categorySubcategories.length === 0) {
    return {
      error: "",
      subcategory: "",
    };
  }

  if (!normalizedSubcategory) {
    return {
      error: "Subcategory is required for the selected category",
      subcategory: "",
    };
  }

  const matched = categorySubcategories.some(
    (item) => String(item?.slug || "").trim() === normalizedSubcategory,
  );
  if (!matched) {
    return {
      error: "Invalid subcategory: does not belong to the selected category",
      subcategory: "",
    };
  }

  return {
    error: "",
    subcategory: normalizedSubcategory,
  };
}

async function syncRelatedProductSlugs({
  previousSlug,
  nextSlug,
  currentProductId,
}) {
  if (!previousSlug || !nextSlug || previousSlug === nextSlug) {
    return 0;
  }

  const affected = await Product.find({
    _id: { $ne: currentProductId },
    "detail.relatedSlugs": previousSlug,
  }).select("_id detail");

  if (affected.length === 0) {
    return 0;
  }

  const bulkOperations = [];

  for (const product of affected) {
    const detail =
      product.detail && typeof product.detail === "object"
        ? { ...product.detail }
        : {};

    const currentRelatedSlugs = Array.isArray(detail.relatedSlugs)
      ? detail.relatedSlugs
      : [];
    const nextRelatedSlugs = [];
    const dedupe = new Set();

    currentRelatedSlugs.forEach((item) => {
      const slug = String(item || "").trim();
      if (!slug) {
        return;
      }

      const replaced = slug === previousSlug ? nextSlug : slug;
      if (dedupe.has(replaced)) {
        return;
      }

      dedupe.add(replaced);
      nextRelatedSlugs.push(replaced);
    });

    detail.relatedSlugs = nextRelatedSlugs;
    bulkOperations.push({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { detail } },
      },
    });
  }

  if (bulkOperations.length > 0) {
    await Product.bulkWrite(bulkOperations);
  }

  return bulkOperations.length;
}

function diffRemovedUrls(previousUrls = [], nextUrls = []) {
  const previousSet = new Set(previousUrls);
  const nextSet = new Set(nextUrls);
  return [...previousSet].filter((url) => !nextSet.has(url));
}

async function finalizeProductAssetLifecycle({
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
        module: "products",
        draftId: normalizedDraftId,
        userId: userId || null,
        usedUrls: nextManagedUrls,
      });
    }
  } catch (error) {
    console.error("Finalize product draft assets error:", error);
  }

  try {
    if (removedUrls.length > 0) {
      await cleanupUnreferencedManagedUrls({
        module: "products",
        urls: removedUrls,
      });
    }
  } catch (error) {
    console.error("Cleanup removed product image assets error:", error);
  }
}

export const upsertProduct = async (req, res) => {
  const {
    id,
    slug,
    name,
    category,
    subcategory = "",
    sku,
    price,
    image,
    galleryImages = [],
    status = "In Stock",
    badge = "",
    detailTags = [],
    listSpecs = [],
    detail = null,
    uploadDraftId = "",
  } = req.body;

  if (!name || !category || !sku || !price || !image) {
    return sendError(
      res,
      "Missing required fields (name, category, sku, price, image)",
      400,
    );
  }

  try {
    const normalizedName = String(name || "").trim();
    const normalizedCategory = String(category || "").trim();
    const normalizedSku = String(sku || "").trim();
    const normalizedPrice = String(price || "").trim();
    const normalizedImage = String(image || "").trim();
    const normalizedBadge = String(badge || "").trim();
    const normalizedStatus = status === "Low Stock" ? "Low Stock" : "In Stock";
    const normalizedSubcategory = String(subcategory || "").trim();

    if (
      !normalizedName ||
      !normalizedCategory ||
      !normalizedSku ||
      !normalizedPrice ||
      !normalizedImage
    ) {
      return sendError(
        res,
        "Missing required fields (name, category, sku, price, image)",
        400,
      );
    }

    const categoryValidation = await validateCategoryAndSubcategory(
      normalizedCategory,
      normalizedSubcategory,
    );
    if (categoryValidation.error) {
      return sendError(res, categoryValidation.error, 400);
    }

    const normalizedPayloadBase = {
      name: normalizedName,
      category: normalizedCategory,
      subcategory: categoryValidation.subcategory,
      sku: normalizedSku,
      price: normalizedPrice,
      image: normalizedImage,
      status: normalizedStatus,
      badge: normalizedBadge,
      detailTags: normalizeDetailTags(detailTags),
      listSpecs: normalizeSpecs(listSpecs),
      detail,
    };

    if (id) {
      const product = await Product.findById(id);
      if (!product) {
        return sendError(res, "Product not found", 404);
      }

      const previousSlug = String(product.slug || "").trim();
      const previousManagedUrls = collectProductManagedImageUrls(product);

      const duplicateSku = await Product.findOne({
        sku: normalizedSku,
        _id: { $ne: id },
      });
      if (duplicateSku) {
        return sendError(res, "SKU already exists", 409);
      }

      const rawInputSlug = String(slug || "").trim();
      const requestedSlug = rawInputSlug
        ? toSlugBase(rawInputSlug, normalizedName || "product")
        : previousSlug;
      const slugChangedByInput = requestedSlug !== previousSlug;
      const slugBase = slugChangedByInput ? requestedSlug : previousSlug;

      let resolvedSlug = slugChangedByInput
        ? await findAvailableProductSlug(slugBase, id)
        : previousSlug;
      let latestSaveError = null;
      const payload = {
        ...normalizedPayloadBase,
        slug: resolvedSlug,
        galleryImages: normalizeGallery(galleryImages, normalizedImage),
      };
      const nextManagedUrls = collectProductManagedImageUrls(payload);

      for (let retry = 0; retry <= SLUG_SAVE_RETRY_LIMIT; retry += 1) {
        try {
          Object.assign(product, { ...payload, slug: resolvedSlug });
          await product.save();
          latestSaveError = null;
          break;
        } catch (error) {
          latestSaveError = error;
          if (isDuplicateKeyError(error, "sku")) {
            return sendError(res, "SKU already exists", 409);
          }

          const canRetrySlug =
            slugChangedByInput &&
            isDuplicateKeyError(error, "slug") &&
            retry < SLUG_SAVE_RETRY_LIMIT;
          if (!canRetrySlug) {
            throw error;
          }

          resolvedSlug = await findAvailableProductSlug(slugBase, id);
        }
      }

      if (latestSaveError) {
        throw latestSaveError;
      }

      if (previousSlug !== product.slug) {
        try {
          await syncRelatedProductSlugs({
            previousSlug,
            nextSlug: product.slug,
            currentProductId: product._id,
          });
        } catch (syncError) {
          console.error("Sync related product slugs error:", syncError);
        }
      }

      await finalizeProductAssetLifecycle({
        uploadDraftId,
        userId: req.user?._id || null,
        previousManagedUrls,
        nextManagedUrls,
      });

      return sendSuccess(res, product, "Product updated successfully", 200);
    }

    const duplicateSku = await Product.findOne({ sku: normalizedSku });
    if (duplicateSku) {
      return sendError(res, "SKU already exists", 409);
    }

    const requestedSlug = toSlugBase(
      String(slug || "").trim() || normalizedName,
      "product",
    );
    const slugBase = requestedSlug;
    let resolvedSlug = await findAvailableProductSlug(slugBase);
    let latestCreateError = null;
    let created = null;

    for (let retry = 0; retry <= SLUG_SAVE_RETRY_LIMIT; retry += 1) {
      try {
        const payload = {
          ...normalizedPayloadBase,
          slug: resolvedSlug,
          galleryImages: normalizeGallery(galleryImages, normalizedImage),
        };

        created = await Product.create(payload);
        latestCreateError = null;
        break;
      } catch (error) {
        latestCreateError = error;
        if (isDuplicateKeyError(error, "sku")) {
          return sendError(res, "SKU already exists", 409);
        }

        const canRetrySlug =
          isDuplicateKeyError(error, "slug") && retry < SLUG_SAVE_RETRY_LIMIT;
        if (!canRetrySlug) {
          throw error;
        }

        resolvedSlug = await findAvailableProductSlug(slugBase);
      }
    }

    if (latestCreateError || !created) {
      throw latestCreateError || new Error("Create product failed");
    }

    const nextManagedUrls = collectProductManagedImageUrls(created);
    await finalizeProductAssetLifecycle({
      uploadDraftId,
      userId: req.user?._id || null,
      previousManagedUrls: [],
      nextManagedUrls,
    });
    return sendSuccess(res, created, "Product created successfully", 201);
  } catch (err) {
    console.error("Upsert Product Error:", err);
    if (isDuplicateKeyError(err, "sku")) {
      return sendError(res, "SKU already exists", 409);
    }
    if (isDuplicateKeyError(err, "slug")) {
      return sendError(res, "Failed to generate unique slug", 409);
    }

    return sendError(res, "Server error", 500);
  }
};

export const getProductList = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const pageSize = Math.max(1, Number.parseInt(req.query.pageSize, 10) || 10);
  const keyword = String(req.query.keyword || "").trim();
  const category = String(req.query.category || "").trim();
  const status = String(req.query.status || "").trim();

  const filter = {};
  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { slug: { $regex: keyword, $options: "i" } },
      { sku: { $regex: keyword, $options: "i" } },
    ];
  }
  if (category) {
    filter.category = category;
  }
  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * pageSize;

  try {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(pageSize),
    ]);

    return sendSuccess(
      res,
      {
        products,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      "Product list fetched successfully",
      200,
    );
  } catch (err) {
    console.error("Get Product List Error:", err);
    return sendError(res, "Server error", 500);
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return sendError(res, "Product ID is required", 400);
  }

  try {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return sendError(res, "Product not found", 404);
    }

    try {
      const managedUrls = collectProductManagedImageUrls(product);
      if (managedUrls.length > 0) {
        await cleanupUnreferencedManagedUrls({
          module: "products",
          urls: managedUrls,
        });
      }
    } catch (cleanupError) {
      console.error("Cleanup product assets after deletion error:", cleanupError);
    }

    return sendSuccess(res, null, "Product deleted successfully", 200);
  } catch (err) {
    console.error("Delete Product Error:", err);
    if (err.name === "CastError") {
      return sendError(res, "Invalid product ID format", 400);
    }
    return sendError(res, "Server error", 500);
  }
};
