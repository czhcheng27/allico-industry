import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import permissionRoutes from "./routes/permission.route.js";
import userRoutes from "./routes/user.route.js";
import roleRoutes from "./routes/role.route.js";
import productRoutes from "./routes/product.route.js";
import categoryRoutes from "./routes/category.route.js";
import uploadRoutes from "./routes/upload.route.js";

const app = express();

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://allico-industry-client-production.up.railway.app",
];
const envOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      console.warn("CORS blocked:", origin);
      callback(null, false);
    },
    credentials: true,
  }),
);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    code: 200,
    success: true,
    message: "ok",
    data: null,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/permission", permissionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/uploads", uploadRoutes);

export default app;
