import express from "express";
import {
  deleteCategory,
  getCategoryBySlug,
  getCategoryList,
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
router.delete(
  "/deleteCategory/:id",
  protect,
  attachPermissions,
  authorizeRouteAction("/categories", "write"),
  deleteCategory,
);

export default router;
