import { Product } from "../models/product.model.js";
import {
  cleanupUnreferencedManagedUrls,
  collectProductManagedImageUrls,
  finalizeDraftAssets,
} from "../services/upload-asset.service.js";
import { sendSuccess, sendError } from "../utils/response.js";

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

function normalizeGallery(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((item) => typeof item === "string" && item.trim())
    .map((item) => item.trim());
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
    listSpecs = [],
    detail = null,
    uploadDraftId = "",
  } = req.body;

  if (!slug || !name || !category || !sku || !price || !image) {
    return sendError(
      res,
      "Missing required fields (slug, name, category, sku, price, image)",
      400,
    );
  }

  const normalizedPayload = {
    slug: String(slug).trim(),
    name: String(name).trim(),
    category: String(category).trim(),
    subcategory: String(subcategory || "").trim(),
    sku: String(sku).trim(),
    price: String(price).trim(),
    image: String(image).trim(),
    galleryImages: normalizeGallery(galleryImages),
    status,
    badge: String(badge || "").trim(),
    listSpecs: normalizeSpecs(listSpecs),
    detail,
  };

  const nextManagedUrls = collectProductManagedImageUrls(normalizedPayload);

  try {
    const duplicateQuery = [
      { slug: normalizedPayload.slug },
      { sku: normalizedPayload.sku },
    ];

    if (id) {
      const product = await Product.findById(id);
      if (!product) {
        return sendError(res, "Product not found", 404);
      }

      const previousManagedUrls = collectProductManagedImageUrls(product);

      const duplicate = await Product.findOne({
        $or: duplicateQuery,
        _id: { $ne: id },
      });
      if (duplicate) {
        return sendError(res, "Slug or SKU already exists", 409);
      }

      Object.assign(product, normalizedPayload);
      await product.save();
      await finalizeProductAssetLifecycle({
        uploadDraftId,
        userId: req.user?._id || null,
        previousManagedUrls,
        nextManagedUrls,
      });

      return sendSuccess(res, product, "Product updated successfully", 200);
    }

    const duplicate = await Product.findOne({ $or: duplicateQuery });
    if (duplicate) {
      return sendError(res, "Slug or SKU already exists", 409);
    }

    const created = await Product.create(normalizedPayload);
    await finalizeProductAssetLifecycle({
      uploadDraftId,
      userId: req.user?._id || null,
      previousManagedUrls: [],
      nextManagedUrls,
    });
    return sendSuccess(res, created, "Product created successfully", 201);
  } catch (err) {
    console.error("Upsert Product Error:", err);
    if (err.code === 11000) {
      return sendError(res, "Duplicate entry for slug or sku", 409);
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
