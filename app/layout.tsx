import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Editorial Calendar — Smart Content Planning",
  description:
    "Plan smarter. Create faster. Ship content on time with the AI-powered editorial calendar.",
  keywords: ["editorial calendar", "content planning", "AI calendar", "smart scheduling"],
  authors: [{ name: "Editorial Calendar Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
