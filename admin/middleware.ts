/* 更新说明（2026-03-13）：middleware 现基于 admin 同域会话 cookie 调用上游 /users/me，兼容 Railway 默认分配域名。 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-session";
import { buildServerApiUrl } from "@/lib/server-api";

type PermissionAction = "read" | "write";

type Permission = {
  route: string;
  actions: PermissionAction[];
};

type CurrentUserResponse = {
  success: boolean;
  data: {
    permissions?: Permission[];
  } | null;
};

const EXACT_PERMISSION_ROUTES = new Set(["/products/display-order"]);

// 统一路径格式，避免因为末尾斜杠导致权限判断不一致。
function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
}

// 判断某条路由是否在当前权限列表中（仅按 route 存在性判断）。
function hasRouteAccess(permissions: Permission[], route: string): boolean {
  const normalizedRoute = normalizePath(route);
  return permissions.some(
    (permission) => normalizePath(permission.route) === normalizedRoute,
  );
}

// 从权限数组中提取可访问 route 列表，并做标准化处理。
function getPermissionRoutes(permissions: Permission[]): string[] {
  return permissions
    .map((permission) => normalizePath(permission.route))
    .filter((route) => route.startsWith("/") && route !== "/");
}

// 计算用户首个可访问页面：直接取权限列表中的第一个 route，不再依赖环境变量顺序配置。
function getFirstAccessibleRoute(permissions: Permission[]): string {
  const permissionRoutes = getPermissionRoutes(permissions);
  return permissionRoutes[0] || "/forbidden";
}

// 将当前 pathname 映射为“最接近的权限路由”，用于子路径场景（例如 /a/b/c 匹配 /a/b）。
function resolvePermissionRoute(pathname: string, permissions: Permission[]): string {
  const normalizedPath = normalizePath(pathname);
  const permissionRoutes = getPermissionRoutes(permissions);

  if (permissionRoutes.includes(normalizedPath)) {
    return normalizedPath;
  }

  if (EXACT_PERMISSION_ROUTES.has(normalizedPath)) {
    return normalizedPath;
  }

  const matched = permissionRoutes
    .filter((route) => normalizedPath.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length);

  return matched[0] || normalizedPath;
}

// 在 middleware 侧通过 admin 同域 cookie 调用上游 /users/me，获取当前登录态与最新权限。
async function fetchCurrentUser(
  request: NextRequest,
): Promise<CurrentUserResponse["data"] | null> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(buildServerApiUrl("/users/me"), {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as CurrentUserResponse;
    if (!payload.success || !payload.data) {
      return null;
    }

    return payload.data;
  } catch (error) {
    console.error("Middleware auth check failed:", error);
    return null;
  }
}

// 统一创建重定向响应，清空 query，避免带入无关参数。
function buildRedirectResponse(request: NextRequest, targetPath: string) {
  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  url.search = "";
  return NextResponse.redirect(url);
}

// 后台核心路由守卫：处理未登录跳转、登录后首页分发、无权限转 forbidden。
export async function middleware(request: NextRequest) {
  const pathname = normalizePath(request.nextUrl.pathname);
  const isLoginRoute = pathname === "/login";
  const isRootRoute = pathname === "/";
  const isForbiddenRoute = pathname === "/forbidden" || pathname.startsWith("/forbidden/");

  const currentUser = await fetchCurrentUser(request);

  if (isLoginRoute) {
    if (!currentUser) {
      return NextResponse.next();
    }

    const targetPath = getFirstAccessibleRoute(currentUser.permissions || []);
    return buildRedirectResponse(request, targetPath);
  }

  if (!currentUser) {
    return buildRedirectResponse(request, "/login");
  }

  const permissions = currentUser.permissions || [];

  if (isRootRoute) {
    const targetPath = getFirstAccessibleRoute(permissions);
    return buildRedirectResponse(request, targetPath);
  }

  if (isForbiddenRoute) {
    return NextResponse.next();
  }

  const permissionRoute = resolvePermissionRoute(pathname, permissions);
  if (!hasRouteAccess(permissions, permissionRoute)) {
    return buildRedirectResponse(request, "/forbidden");
  }

  return NextResponse.next();
}

// 指定 middleware 生效范围，排除 Next 静态资源与 favicon。
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
