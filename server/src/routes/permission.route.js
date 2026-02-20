import express from "express";
import { syncPermissions } from "../controllers/permission.controller.js";

const router = express.Router();

router.post("/sync", syncPermissions);

export default router;
