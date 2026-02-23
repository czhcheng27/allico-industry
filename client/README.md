# Client（Next.js）

## 作用
面向业务/访客侧的前端应用（与 admin 后台分离）。

## 启动方式
```bash
cd client
yarn dev
```
默认地址：`http://localhost:3001`（或 Next 自动分配的可用端口）。

## 目录结构（常用）
- `app/`：路由页面与布局。
- `components/`：通用 UI 组件。
- `lib/`：请求封装与公共工具。
- `public/`：静态资源。

## 说明
- 请保持 client 与 admin 的 UI 逻辑和权限逻辑隔离。
- API 地址与运行时配置建议仅通过 `client` 目录下的环境变量维护。
