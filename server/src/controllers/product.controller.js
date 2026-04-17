import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import {
  cleanupUnreferencedManagedUrls,
  collectProductManagedImageUrls,
  finalizeDraftAssets,
} from "../services/upload-asset.service.js";
import {
  getProductTypeDefinitions,
  normalizeFilterAttributes,
  syncManagedListSpecs,
} from "../config/catalog-filter.config.js";
import { buildUniqueSlug, toSlugBase } from "../utils/slug.js";
import { sendSuccess, sendError } from "../utils/response.js";

const GALLERY_LIMIT = 8;
const DETAIL_TAG_LIMIT = 4;
const DETAIL_TAG_MAX_LENGTH = 24;
const SLUG_SCAN_LIMIT = 5000;
const SLUG_SAVE_RETRY_LIMIT = 3;
const HOT_SELLER_LABEL = "HOT SELLER";

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

function normalizeIdList(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function isHotSellerLabel(value) {
  return String(value || "").trim().toUpperCase() === HOT_SELLER_LABEL;
}

function normalizeHotSellerFlag(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }

  return false;
}

function getDisplayOrderValue(value) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function compareProductsForDisplay(a, b) {
  const aHotSeller = Boolean(a?.isHotSeller);
  const bHotSeller = Boolean(b?.isHotSeller);

  if (aHotSeller !== bHotSeller) {
    return aHotSeller ? -1 : 1;
  }

  const aDisplayOrder = getDisplayOrderValue(a?.displayOrder);
  const bDisplayOrder = getDisplayOrderValue(b?.displayOrder);

  if (aDisplayOrder !== null && bDisplayOrder !== null) {
    if (aDisplayOrder !== bDisplayOrder) {
      return aDisplayOrder - bDisplayOrder;
    }
  } else if (aDisplayOrder !== null) {
    return -1;
  } else if (bDisplayOrder !== null) {
    return 1;
  }

  const aUpdatedAt = new Date(a?.updatedAt || 0).getTime();
  const bUpdatedAt = new Date(b?.updatedAt || 0).getTime();
  if (aUpdatedAt !== bUpdatedAt) {
    return bUpdatedAt - aUpdatedAt;
  }

  return String(a?._id || a?.id || "").localeCompare(
    String(b?._id || b?.id || ""),
  );
}

function splitProductsForDisplay(products) {
  const orderedProducts = [...products].sort(compareProductsForDisplay);

  return {
    orderedProducts,
    hotSellerProducts: orderedProducts.filter((product) => Boolean(product.isHotSeller)),
    regularProducts: orderedProducts.filter((product) => !product.isHotSeller),
  };
}

function toDetailObject(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  return { ...input };
}

function normalizeDetailFeatures(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.reduce((normalized, item) => {
    if (typeof item !== "string") {
      return normalized;
    }

    const value = item.trim();
    if (!value) {
      return normalized;
    }

    normalized.push(value);
    return normalized;
  }, []);
}

function mergeProductDetail(previousDetail, incomingDetail) {
  const nextDetail = toDetailObject(previousDetail);
  const inputDetail = toDetailObject(incomingDetail);

  Object.entries(inputDetail).forEach(([key, value]) => {
    if (key === "description" || key === "features") {
      return;
    }

    if (value === undefined) {
      delete nextDetail[key];
      return;
    }

    nextDetail[key] = value;
  });

  if (Object.prototype.hasOwnProperty.call(inputDetail, "description")) {
    const normalizedDescription = String(inputDetail.description || "").trim();
    if (normalizedDescription) {
      nextDetail.description = normalizedDescription;
    } else {
      delete nextDetail.description;
    }
  }

  if (Object.prototype.hasOwnProperty.call(inputDetail, "features")) {
    const normalizedFeatures = normalizeDetailFeatures(inputDetail.features);
    if (normalizedFeatures.length > 0) {
      nextDetail.features = normalizedFeatures;
    } else {
      delete nextDetail.features;
    }
  }

  return Object.keys(nextDetail).length > 0 ? nextDetail : null;
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

async function getNextDisplayOrder(category, isHotSeller, excludeId = null) {
  const normalizedCategory = String(category || "").trim();
  if (!normalizedCategory) {
    return 0;
  }

  const filter = {
    category: normalizedCategory,
    isHotSeller: Boolean(isHotSeller),
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const products = await Product.find(filter).select("displayOrder updatedAt");
  const sortedProducts = [...products].sort(compareProductsForDisplay);
  const highestDisplayOrder = sortedProducts.reduce((max, product) => {
    const displayOrder = getDisplayOrderValue(product.displayOrder);
    return displayOrder === null ? max : Math.max(max, displayOrder);
  }, -1);

  return highestDisplayOrder + 1;
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
  const hasIncomingDetail = Object.prototype.hasOwnProperty.call(req.body || {}, "detail");
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
    productType = "",
    filterAttributes = null,
    detail,
    isHotSeller = false,
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
    const normalizedDetailTags = normalizeDetailTags(detailTags);
    const normalizedIsHotSeller = normalizeHotSellerFlag(isHotSeller);
    const normalizedSpecs = normalizeSpecs(listSpecs);

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

    if (
      isHotSellerLabel(normalizedBadge) ||
      normalizedDetailTags.some((tag) => isHotSellerLabel(tag))
    ) {
      return sendError(
        res,
        "Use the Hot Seller toggle instead of typing HOT SELLER in badge or detail tags",
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

    const productTypeDefinitions = getProductTypeDefinitions(
      normalizedCategory,
      categoryValidation.subcategory,
    );
    const normalizedRequestedProductType = String(productType || "").trim().toLowerCase();

    if (productTypeDefinitions.length > 1 && !normalizedRequestedProductType) {
      return sendError(
        res,
        "Product type is required for the selected subcategory",
        400,
      );
    }

    const normalizedCatalogAttributes = normalizeFilterAttributes({
      categorySlug: normalizedCategory,
      subcategorySlug: categoryValidation.subcategory,
      productType: normalizedRequestedProductType,
      input: filterAttributes,
    });

    if (
      productTypeDefinitions.length > 0 &&
      !normalizedCatalogAttributes.productType
    ) {
      return sendError(
        res,
        "Invalid product type for the selected subcategory",
        400,
      );
    }

    if (normalizedCatalogAttributes.error) {
      return sendError(res, normalizedCatalogAttributes.error, 400);
    }

    const normalizedPayloadBase = {
      name: normalizedName,
      category: normalizedCategory,
      subcategory: categoryValidation.subcategory,
      productType: normalizedCatalogAttributes.productType,
      sku: normalizedSku,
      price: normalizedPrice,
      image: normalizedImage,
      status: normalizedStatus,
      badge: normalizedBadge,
      detailTags: normalizedDetailTags,
      filterAttributes: normalizedCatalogAttributes.filterAttributes,
      listSpecs: syncManagedListSpecs(
        normalizedSpecs,
        normalizedCatalogAttributes.productType,
        normalizedCatalogAttributes.filterAttributes,
      ),
      isHotSeller: normalizedIsHotSeller,
    };

    if (id) {
      const product = await Product.findById(id);
      if (!product) {
        return sendError(res, "Product not found", 404);
      }

      const previousSlug = String(product.slug || "").trim();
      const previousManagedUrls = collectProductManagedImageUrls(product);
      const previousCategory = String(product.category || "").trim();
      const previousIsHotSeller = Boolean(product.isHotSeller);
      const previousDisplayOrder = getDisplayOrderValue(product.displayOrder);

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
      const normalizedDetail = hasIncomingDetail
        ? mergeProductDetail(product.detail, detail)
        : product.detail;
      const shouldReassignDisplayOrder =
        previousCategory !== normalizedCategory ||
        previousIsHotSeller !== normalizedIsHotSeller ||
        previousDisplayOrder === null;
      const nextDisplayOrder = shouldReassignDisplayOrder
        ? await getNextDisplayOrder(normalizedCategory, normalizedIsHotSeller, id)
        : previousDisplayOrder;
      const payload = {
        ...normalizedPayloadBase,
        slug: resolvedSlug,
        galleryImages: normalizeGallery(galleryImages, normalizedImage),
        detail: normalizedDetail,
        displayOrder: nextDisplayOrder,
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
    const normalizedDetail = hasIncomingDetail
      ? mergeProductDetail(null, detail)
      : null;
    const nextDisplayOrder = await getNextDisplayOrder(
      normalizedCategory,
      normalizedIsHotSeller,
    );

    for (let retry = 0; retry <= SLUG_SAVE_RETRY_LIMIT; retry += 1) {
      try {
        const payload = {
          ...normalizedPayloadBase,
          slug: resolvedSlug,
          galleryImages: normalizeGallery(galleryImages, normalizedImage),
          detail: normalizedDetail,
          displayOrder: nextDisplayOrder,
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
  const isPublicRequest = String(req.originalUrl || "").includes("/public/");

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

    if (isPublicRequest && category) {
      const products = await Product.find(filter);
      const { orderedProducts } = splitProductsForDisplay(products);
      const total = orderedProducts.length;

      return sendSuccess(
        res,
        {
          products: orderedProducts.slice(skip, skip + pageSize),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
        "Product list fetched successfully",
        200,
      );
    }

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

export const getDisplayOrder = async (req, res) => {
  const category = String(req.query.category || "").trim();

  if (!category) {
    return sendError(res, "Category is required", 400);
  }

  try {
    const products = await Product.find({ category });
    const { hotSellerProducts, regularProducts } = splitProductsForDisplay(products);

    return sendSuccess(
      res,
      {
        category,
        hotSellerProducts,
        regularProducts,
        total: products.length,
      },
      "Product display order fetched successfully",
      200,
    );
  } catch (error) {
    console.error("Get Product Display Order Error:", error);
    return sendError(res, "Server error", 500);
  }
};

export const saveDisplayOrder = async (req, res) => {
  const category = String(req.body.category || "").trim();
  const hotSellerProductIds = normalizeIdList(req.body.hotSellerProductIds);
  const regularProductIds = normalizeIdList(req.body.regularProductIds);
  const combinedIds = [...hotSellerProductIds, ...regularProductIds];
  const uniqueIds = new Set(combinedIds);

  if (!category) {
    return sendError(res, "Category is required", 400);
  }

  if (uniqueIds.size !== combinedIds.length) {
    return sendError(res, "Product IDs must be unique within the arrangement", 400);
  }

  try {
    const categoryProducts = await Product.find({ category }).select("_id");
    const categoryProductIds = categoryProducts.map((product) => String(product._id));
    const categoryProductIdSet = new Set(categoryProductIds);

    if (categoryProductIds.length !== combinedIds.length) {
      return sendError(
        res,
        "Display order payload must include every product in the selected category",
        400,
      );
    }

    const invalidId = combinedIds.find((productId) => !categoryProductIdSet.has(productId));
    if (invalidId) {
      return sendError(
        res,
        "Display order payload contains products outside the selected category",
        400,
      );
    }

    if (combinedIds.length === 0) {
      return sendSuccess(
        res,
        {
          category,
          total: 0,
        },
        "Product display order saved successfully",
        200,
      );
    }

    const bulkOperations = [
      ...hotSellerProductIds.map((productId, index) => ({
        updateOne: {
          filter: { _id: productId, category },
          update: {
            $set: {
              isHotSeller: true,
              displayOrder: index,
            },
          },
        },
      })),
      ...regularProductIds.map((productId, index) => ({
        updateOne: {
          filter: { _id: productId, category },
          update: {
            $set: {
              isHotSeller: false,
              displayOrder: index,
            },
          },
        },
      })),
    ];

    await Product.bulkWrite(bulkOperations);

    return sendSuccess(
      res,
      {
        category,
        total: combinedIds.length,
      },
      "Product display order saved successfully",
      200,
    );
  } catch (error) {
    console.error("Save Product Display Order Error:", error);
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
