import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Agent SDK - 第六章：远程与多 Provider",
  description:
    "一个可运行的教程章节，用统一抽象层对比本地 Provider 与远程风格 Provider 的执行差异。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
