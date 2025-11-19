import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "GameHole - Free Game Hosting for Developers",
  description: "Host your games for free. No limits, no strings attached. Built for indie developers.",
  openGraph: {
    title: "GameHole.ink - Upload Your Games",
    description: "Free game hosting for developers. No limits, no strings attached.",
    url: "https://gamehole.ink",
    siteName: "GameHole.ink",
    images: [
      {
        url: "https://gamehole.ink/og-image-v2.png",
        width: 1200,
        height: 630,
        alt: "GameHole.ink - Upload Your Games",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GameHole.ink - Upload Your Games",
    description: "Free game hosting for developers. No limits, no strings attached.",
    images: ["https://gamehole.ink/og-image-v2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
