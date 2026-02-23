import { Category } from "../models/category.model.js";
import { sendSuccess, sendError } from "../utils/response.js";

function normalizeSubcategories(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  const dedupe = new Set();
  const normalized = [];

  input.forEach((item) => {
    const slug = String(item?.slug || "").trim();
    const name = String(item?.name || "").trim();

    if (!slug || !name || dedupe.has(slug)) {
      return;
    }

    dedupe.add(slug);
    normalized.push({ slug, name });
  });

  return normalized;
}

function buildCategoryPayload(input) {
  return {
    slug: String(input.slug || "").trim(),
    name: String(input.name || "").trim(),
    shortName: String(input.shortName || "").trim(),
    description: String(input.description || "").trim(),
    cardImage: String(input.cardImage || "").trim(),
    icon: String(input.icon || "category").trim(),
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 0,
    subcategories: normalizeSubcategories(input.subcategories),
  };
}

export const upsertCategory = async (req, res) => {
  const { id } = req.body;
  const payload = buildCategoryPayload(req.body);

  if (!payload.slug || !payload.name) {
    return sendError(res, "Missing required fields (slug, name)", 400);
  }

  try {
    if (id && id !== "") {
      const category = await Category.findById(id);
      if (!category) {
        return sendError(res, "Category not found", 404);
      }

      const duplicate = await Category.findOne({
        slug: payload.slug,
        _id: { $ne: id },
      });
      if (duplicate) {
        return sendError(res, "Category slug already exists", 409);
      }

      Object.assign(category, payload);
      await category.save();

      return sendSuccess(res, category, "Category updated successfully", 200);
    }

    const duplicate = await Category.findOne({ slug: payload.slug });
    if (duplicate) {
      return sendError(res, "Category slug already exists", 409);
    }

    const created = await Category.create(payload);
    return sendSuccess(res, created, "Category created successfully", 201);
  } catch (error) {
    console.error("Upsert Category Error:", error);
    if (error.code === 11000) {
      return sendError(res, "Duplicate entry for category slug", 409);
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

    return sendSuccess(res, null, "Category deleted successfully", 200);
  } catch (error) {
    console.error("Delete Category Error:", error);
    if (error.name === "CastError") {
      return sendError(res, "Invalid category ID format", 400);
    }
    return sendError(res, "Server error", 500);
  }
};
