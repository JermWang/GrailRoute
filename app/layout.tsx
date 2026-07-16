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
    description: "Vault authenticated Pokémon cards, route digital titles, and prepare for atomic settlement on Robinhood Chain.",
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
    },
    openGraph: {
      title: "GrailRoute — Trade your way to the grail",
      description: "Vault authenticated Pokémon cards and route toward the exact collectible you want on Robinhood Chain.",
      type: "website",
      images: [{ url: new URL("/og.png", origin).toString(), width: 1920, height: 1080, alt: "GrailRoute Pokémon TCG route toward a Charizard grail" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "GrailRoute — Trade your way to the grail",
      description: "Vault, route, and settle collectible ownership on Robinhood Chain.",
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
