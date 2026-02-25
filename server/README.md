# Server（Express + MongoDB）

## 作用
提供鉴权、用户、角色、产品等后端 API，并执行 route/action 权限校验。

## 启动方式
```bash
cd server
yarn dev
```
默认 API 基础地址：`http://localhost:9001/api`

## 常用脚本
- `yarn dev`：使用 nodemon 启动开发服务。
- `yarn start`：使用 node 启动生产服务。
- `yarn init:app`：初始化权限、角色、管理员与产品种子数据。

## 核心架构
- `src/controllers/`：业务处理层。
- `src/routes/`：路由注册层。
- `src/middleware/auth.middleware.js`：
  - `protect`：校验 JWT（支持 cookie/Authorization）。
  - `attachPermissions`：挂载最新角色聚合权限。
  - `authorizeRouteAccess(route)`：页面/列表访问权限校验。
  - `authorizeRouteAction(route, action)`：写操作权限校验。
- `src/services/permission.service.js`：权限聚合与 route/action 判断工具。

## 会话与鉴权行为
- 登录后写入 HTTP-only cookie：`token`。
- 登出时清理 cookie（含 path/过期时间）。
- `/api/users/me` 是前端获取最新聚合权限的权威来源。

## 环境变量
使用 `server/.env`：
```env
PORT=9001
MONGO_URL=...
JWT_SECRET=...
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173
```

## 权限约定
权限项结构：
```ts
{ route: string; actions: ("read" | "write")[] }
```
- `route` 是否存在决定页面/菜单访问。
- `actions` 决定按钮能力和写接口授权。

## R2 Image Upload (Signed Direct Upload)
- New APIs:
  - `POST /api/uploads/sign/product-image`
  - `POST /api/uploads/sign/category-image`
- Request body:
```json
{
  "filename": "example.png",
  "contentType": "image/png",
  "size": 123456
}
```
- Response data:
```json
{
  "uploadUrl": "https://...",
  "publicUrl": "https://<bucket>.<accountid>.r2.dev/dev/products/2026/02/uuid.png",
  "objectKey": "dev/products/2026/02/uuid.png",
  "headers": {
    "Content-Type": "image/png"
  }
}
```

### Local setup
1. Copy `.env.example` to `.env` and fill all `R2_*` fields.
2. Ensure the admin origin is in `CORS_ORIGINS`.
3. Install dependencies in `server` (`pnpm install` or `yarn install`).
4. Start server and call sign APIs from authenticated admin session.
