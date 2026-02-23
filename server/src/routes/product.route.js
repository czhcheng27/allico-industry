/* 更新说明（2026-02-20）： 产品路由已按列表读取与写操作分别接入 route/action 权限中间件。 */
import express from "express";
import {
  upsertProduct,
  getProductList,
  deleteProduct,
} from "../controllers/product.controller.js";
import {
  protect,
  attachPermissions,
  authorizeRouteAccess,
  authorizeRouteAction,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/public/getProductList",
  getProductList,
);

router.post(
  "/upsertProduct",
  protect,
  attachPermissions,
  authorizeRouteAction("/products", "write"),
  upsertProduct,
);
router.get(
  "/getProductList",
  protect,
  attachPermissions,
  authorizeRouteAccess("/products"),
  getProductList,
);
router.delete(
  "/deleteProduct/:id",
  protect,
  attachPermissions,
  authorizeRouteAction("/products", "write"),
  deleteProduct,
);

export default router;
