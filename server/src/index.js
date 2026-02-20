// 启动服务器并连接数据库
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import http from "http";
import app from "./app.js";
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";

// 获取当前文件所在的目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 9001;

async function startServer() {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log("✅ Server is running on PORT:", PORT);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1); // 退出进程，避免继续启动服务
  }
}

startServer();
