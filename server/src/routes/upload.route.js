import express from "express";
import {
  discardCategoryImageDraft,
  discardProductImageDraft,
  signCategoryImageUpload,
  signProductImageUpload,
} from "../controllers/upload.controller.js";
import {
  protect,
  attachPermissions,
  authorizeRouteAction,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/sign/product-image",
  protect,
  attachPermissions,
  authorizeRouteAction("/products", "write"),
  signProductImageUpload,
);

router.post(
  "/sign/category-image",
  protect,
  attachPermissions,
  authorizeRouteAction("/categories", "write"),
  signCategoryImageUpload,
);

router.post(
  "/discard/product-draft",
  protect,
  attachPermissions,
  authorizeRouteAction("/products", "write"),
  discardProductImageDraft,
);

router.post(
  "/discard/category-draft",
  protect,
  attachPermissions,
  authorizeRouteAction("/categories", "write"),
  discardCategoryImageDraft,
);

export default router;
