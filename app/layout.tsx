import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Smart Calendar - Editorial Planning",
  description: "Plan smarter. Work faster with AI-powered editorial calendar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
