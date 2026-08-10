import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iWiki Knowledge Dashboard",
  description: "Prototype dashboard quản trị kho tri thức nội bộ iWiki.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "iWiki Knowledge Dashboard",
    description: "Knowledge health at a glance",
    url: "https://iwiki-knowledge-dashboard.ikame-global-8100.chatgpt.site",
    images: [{ url: "/og.png", width: 2184, height: 1165 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "iWiki Knowledge Dashboard",
    description: "Knowledge health at a glance",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
