# Admin（Next.js）

## 作用
管理后台应用，覆盖 `dashboard/products/system-management` 页面，使用 cookie 会话鉴权，并基于 route/action 做权限控制。

## 启动方式
```bash
cd admin
yarn dev
```
默认地址：`http://localhost:3000`

## 核心架构
- `middleware.ts`：服务端路由守卫，通过 cookie + `/users/me` 进行前置鉴权。
- `components/auth/protected-shell.tsx`：保持侧栏和顶部稳定显示，只在 content 区域 loading，无权限时跳转壳内 `/forbidden`。
- `lib/permission.ts`：
  - `hasRouteAccess`：页面/菜单可见性判断。
  - `hasRouteAction`：按钮/操作能力判断。
- `components/auth/permission-button.tsx`：按钮级权限控制（默认 `action=write`）。
- `components/overlay/*`：全局 modal/drawer 容器，统一 CRUD 弹窗交互。

## 权限约定
权限项结构：
```ts
{ route: string; actions: ("read" | "write")[] }
```
- 页面访问只看 `route` 是否存在。
- `read/write` 仅用于按钮与写接口权限。

## 环境变量
使用 `admin/.env`：
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:9001/api
API_BASE_URL=http://localhost:9001/api
```
首页落地页由 `/users/me` 返回的可访问权限列表决定（取第一个可访问 route）。

## 说明
- 路由切换不使用全屏 loading，只在 content 区域显示加载态。
- 无权限页面在壳内渲染：`app/(admin)/forbidden/page.tsx`。
