import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Agent SDK - Memory and Skills",
  description: "A runnable tutorial chapter for exploring memory injection and skill presets.",
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
