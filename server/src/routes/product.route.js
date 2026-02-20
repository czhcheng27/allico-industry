import express from "express";
import {
  upsertProduct,
  getProductList,
  deleteProduct,
} from "../controllers/product.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/upsertProduct", protect, authorize(["admin"]), upsertProduct);
router.get(
  "/getProductList",
  protect,
  authorize(["admin", "manager"]),
  getProductList,
);
router.delete(
  "/deleteProduct/:id",
  protect,
  authorize(["admin"]),
  deleteProduct,
);

export default router;
