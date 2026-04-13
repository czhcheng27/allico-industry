import express from "express";
import {
  deleteCategory,
  getCategoryBySlug,
  getCategoryDisplayOrder,
  getCategoryList,
  saveCategoryDisplayOrder,
  upsertCategory,
} from "../controllers/category.controller.js";
import {
  protect,
  attachPermissions,
  authorizeRouteAccess,
  authorizeRouteAction,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/public/getCategoryList", getCategoryList);
router.get("/public/getCategory/:slug", getCategoryBySlug);

router.post(
  "/upsertCategory",
  protect,
  attachPermissions,
  authorizeRouteAction("/categories", "write"),
  upsertCategory,
);
router.get(
  "/getCategoryList",
  protect,
  attachPermissions,
  authorizeRouteAccess("/categories"),
  getCategoryList,
);
router.get(
  "/getCategory/:slug",
  protect,
  attachPermissions,
  authorizeRouteAccess("/categories"),
  getCategoryBySlug,
);
router.get(
  "/getDisplayOrder",
  protect,
  attachPermissions,
  authorizeRouteAccess("/categories/display-order"),
  getCategoryDisplayOrder,
);
router.post(
  "/saveDisplayOrder",
  protect,
  attachPermissions,
  authorizeRouteAction("/categories/display-order", "write"),
  saveCategoryDisplayOrder,
);
router.delete(
  "/deleteCategory/:id",
  protect,
  attachPermissions,
  authorizeRouteAction("/categories", "write"),
  deleteCategory,
);

export default router;
