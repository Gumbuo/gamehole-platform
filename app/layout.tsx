import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameHole - Free Game Hosting for Developers",
  description: "Host your games for free. No limits, no strings attached. Built for indie developers.",
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
