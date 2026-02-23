"use client";

/* 更新说明（2026-02-20）： PermissionButton 仅按 route action 权限控制显示，默认动作为 write。 */

import { Button, type ButtonProps } from "antd";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { hasRouteAction } from "@/lib/permission";

type PermissionButtonProps = ButtonProps & {
  action?: "read" | "write";
  route?: string;
};

export function PermissionButton({
  action = "write",
  route,
  ...props
}: PermissionButtonProps) {
  const pathname = usePathname();
  const permissions = useAuthStore((state) => state.permissions);
  const targetRoute = route || pathname;

  if (!hasRouteAction(permissions, targetRoute, action)) {
    return null;
  }

  return <Button {...props} />;
}
