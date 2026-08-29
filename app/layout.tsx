import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kalëthon — Poise in motion",
  description: "Premium British sportswear for tennis, golf, padel, pickleball and everyday life, with private camera-assisted virtual try-on.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
