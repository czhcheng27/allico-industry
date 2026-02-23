"use client";

/* 更新说明（2026-02-20）： 壳层会在路由切换时刷新最新权限，仅 content loading，并在壳内处理 forbidden 跳转。 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Layout,
  Menu,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUserApi } from "@/lib/api";
import {
  filterMenuByPermissions,
  getMenuConfig,
  hasRouteAccess,
} from "@/lib/permission";
import { useOverlay } from "@/components/overlay/OverlayProvider";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";
import type { MenuItem } from "@/types/menu";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

function getOpenKey(menuItems: MenuItem[], pathname: string) {
  const openGroup = menuItems.find((item) =>
    item.children?.some((child) => child.key === pathname),
  );
  return openGroup?.key ? [openGroup.key] : [];
}

function hasMenuKey(menuItems: MenuItem[], key: string): boolean {
  return menuItems.some(
    (item) =>
      item.key === key ||
      (item.children ? hasMenuKey(item.children, key) : false),
  );
}

function findMenuItem(menuItems: MenuItem[], key: string): MenuItem | null {
  for (const item of menuItems) {
    if (item.key === key) {
      return item;
    }

    if (item.children?.length) {
      const found = findMenuItem(item.children, key);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const overlay = useOverlay();
  const [collapsed, setCollapsed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const requestIdRef = useRef(0);

  const permissions = useAuthStore((state) => state.permissions);
  const setPermissions = useAuthStore((state) => state.setPermissions);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const userInfo = useUserStore((state) => state.userInfo);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const logout = useUserStore((state) => state.logout);

  const menuItems = useMemo(
    () => filterMenuByPermissions(getMenuConfig(), permissions),
    [permissions],
  );
  const selectedKeys = useMemo(
    () => (hasMenuKey(menuItems, pathname) ? [pathname] : []),
    [menuItems, pathname],
  );
  const defaultOpenKeys = useMemo(
    () => getOpenKey(menuItems, pathname),
    [menuItems, pathname],
  );

  const redirectToLogin = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.assign("/login");
      return;
    }
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    let alive = true;
    const requestId = ++requestIdRef.current;

    const checkAuthAndPermission = async () => {
      setIsChecking(true);
      try {
        const response = await getCurrentUserApi();
        if (!alive || requestId !== requestIdRef.current) {
          return;
        }

        if (!response.success) {
          clearAuth();
          clearUser();
          redirectToLogin();
          return;
        }

        const latestPermissions = response.data.permissions || [];
        setPermissions(latestPermissions);
        setUser({
          username: response.data.username,
          role: response.data.roles?.[0] || "",
        });

        if (pathname !== "/forbidden" && !hasRouteAccess(latestPermissions, pathname)) {
          router.replace("/forbidden");
          return;
        }
      } catch (error) {
        if (!alive || requestId !== requestIdRef.current) {
          return;
        }

        console.error("Permission check failed:", error);
        clearAuth();
        clearUser();
        redirectToLogin();
      } finally {
        if (alive && requestId === requestIdRef.current) {
          setIsChecking(false);
        }
      }
    };

    void checkAuthAndPermission();

    return () => {
      alive = false;
    };
  }, [pathname, router, clearAuth, setPermissions, setUser, clearUser, redirectToLogin]);

  const handleLogout = () => {
    const modal = overlay?.modal;
    if (!modal) {
      void logout().finally(() => {
        redirectToLogin();
      });
      return;
    }

    modal.open(<div>Are you sure you want to logout?</div>, {
      title: "Logout",
      width: 420,
      okText: "Logout",
      onOk: async () => {
        await logout();
      },
      okCallback: () => {
        redirectToLogin();
      },
    });
  };

  return (
    <Layout className="admin-shell">
      <Sider trigger={null} collapsible collapsed={collapsed} width={248}>
        <div className="admin-brand">
          <div className="admin-brand-mark">A</div>
          {!collapsed && <span className="admin-brand-text">Allico Admin</span>}
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={selectedKeys}
          defaultOpenKeys={defaultOpenKeys}
          items={menuItems as never}
          onClick={(item) => {
            const key = String(item.key);
            const clicked = findMenuItem(menuItems, key);
            if (clicked?.children?.length) {
              return;
            }

            router.push(key);
          }}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
          />
          <div className="admin-header-right">
            <div className="admin-user-chip">
              <Avatar icon={<UserOutlined />} />
              <div className="admin-user-meta">
                <Text>{userInfo.username || "Admin"}</Text>
                <Text type="secondary">{userInfo.role || "admin"}</Text>
              </div>
            </div>
            <Tooltip title="Logout">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                danger
                onClick={handleLogout}
              />
            </Tooltip>
          </div>
        </Header>
        <Content className="admin-content">
          {isChecking ? (
            <div className="admin-content-loading">
              <Spin size="large" />
            </div>
          ) : (
            children
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
