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
    title: "GrailRoute — Connect your Pokémon collection onchain",
    description: "Connect an EVM wallet and access real tokenized Pokémon TCG assets on Robinhood Chain.",
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
    },
    openGraph: {
      title: "GrailRoute — Your Pokémon collection, onchain",
      description: "Connect an EVM wallet to read real tokenized Pokémon TCG assets on Robinhood Chain.",
      type: "website",
      images: [{ url: new URL("/og.png", origin).toString(), width: 1200, height: 630, alt: "GrailRoute verified Pokémon TCG trading route" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "GrailRoute — Your Pokémon collection, onchain",
      description: "Real wallets. Real assets. No placeholders.",
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
