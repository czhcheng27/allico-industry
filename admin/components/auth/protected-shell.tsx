"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Layout,
  Menu,
  Modal,
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
  hasRoutePermission,
} from "@/lib/permission";
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

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);

  const token = useAuthStore((state) => state.token);
  const permissions = useAuthStore((state) => state.permissions);
  const setPermissions = useAuthStore((state) => state.setPermissions);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const userInfo = useUserStore((state) => state.userInfo);
  const setUser = useUserStore((state) => state.setUser);
  const logout = useUserStore((state) => state.logout);

  const menuItems = useMemo(
    () => filterMenuByPermissions(getMenuConfig(), permissions),
    [permissions],
  );
  const defaultOpenKeys = useMemo(
    () => getOpenKey(menuItems, pathname),
    [menuItems, pathname],
  );

  const checkAuthAndPermission = useCallback(async () => {
    if (!token) {
      router.replace("/login");
      return;
    }

    setIsChecking(true);
    try {
      const response = await getCurrentUserApi();
      if (!response.success) {
        clearAuth();
        router.replace("/login");
        return;
      }

      const latestPermissions = response.data.permissions || [];
      setPermissions(latestPermissions);
      setUser({
        username: response.data.username,
        role: response.data.roles?.[0] || "",
      });

      if (!hasRoutePermission(latestPermissions, pathname, "read")) {
        router.replace("/403");
        return;
      }
    } catch (error) {
      console.error("Permission check failed:", error);
      clearAuth();
      router.replace("/login");
    } finally {
      setIsChecking(false);
      setHasCheckedOnce(true);
    }
  }, [token, router, clearAuth, setPermissions, setUser, pathname]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    checkAuthAndPermission();
  }, [isHydrated, checkAuthAndPermission]);

  const handleLogout = () => {
    Modal.confirm({
      title: "Logout",
      content: "Are you sure you want to logout?",
      okText: "Logout",
      okButtonProps: { danger: true },
      onOk: async () => {
        await logout();
        router.replace("/login");
      },
    });
  };

  if (!isHydrated || (!hasCheckedOnce && isChecking)) {
    return (
      <div className="admin-center-screen">
        <Spin size="large" />
      </div>
    );
  }

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
          selectedKeys={[pathname]}
          defaultOpenKeys={defaultOpenKeys}
          items={menuItems as never}
          onClick={(item) => router.push(item.key)}
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
