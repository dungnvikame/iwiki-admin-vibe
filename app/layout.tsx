import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iWiki Knowledge Dashboard",
  description: "Prototype dashboard quản trị kho tri thức nội bộ iWiki.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
