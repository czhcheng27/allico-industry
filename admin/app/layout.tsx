/* 更新说明（2026-02-20）： 根布局已全局挂载 OverlayProvider，后台任意页面都可调用统一的 modal/drawer 能力。 */
import type { Metadata } from "next";
import "antd/dist/reset.css";
import "./globals.css";
import { OverlayProvider } from "@/components/overlay/OverlayProvider";

// 后台站点级元信息，会写入页面 <head>。
export const metadata: Metadata = {
  title: "Allico Admin",
  description: "Admin console for product and permission management",
};

// 根布局：全局引入样式并挂载 OverlayProvider，让所有页面可使用统一弹层能力。
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <OverlayProvider>{children}</OverlayProvider>
      </body>
    </html>
  );
}
