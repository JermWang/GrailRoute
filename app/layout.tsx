import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "GrailRoute — Trade your way to the grail",
    description: "Discover and settle verified multi-party trading card routes on Robinhood Chain.",
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
    },
    openGraph: {
      title: "GrailRoute — Trade your way to the grail",
      description: "A smarter path from the cards you own to the card you want.",
      type: "website",
      images: [{ url: new URL("/og.png", origin).toString(), width: 1200, height: 630, alt: "GrailRoute verified trading card route" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "GrailRoute — Trade your way to the grail",
      description: "Verified cards. One atomic route.",
      images: [new URL("/og.png", origin).toString()],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
