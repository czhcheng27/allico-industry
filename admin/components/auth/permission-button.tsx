"use client";

import { Button, type ButtonProps } from "antd";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { hasRoutePermission } from "@/lib/permission";

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

  if (!hasRoutePermission(permissions, targetRoute, action)) {
    return null;
  }

  return <Button {...props} />;
}
