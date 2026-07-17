import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { siteUrl } from "./site";

export function generateMetadata(): Metadata {
  const origin = siteUrl();

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
      images: [{ url: new URL("/og.jpg", origin).toString(), width: 1920, height: 1080, alt: "GrailRoute Pokémon TCG route toward a Charizard grail" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "GrailRoute — Trade your way to the grail",
      description: "Vault, route, and settle collectible ownership on Robinhood Chain.",
      images: [new URL("/og.jpg", origin).toString()],
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
