import type { NextConfig } from "next";

// Wallet UIs are a clickjacking target: an attacker who can frame this page can
// bait a user into approving a transaction they cannot see. frame-ancestors and
// X-Frame-Options are the load-bearing entries here.
//
// No nonce-based CSP on purpose: nonces require per-request rendering, which
// would undo static generation. Next's inline bootstrap therefore needs
// 'unsafe-inline' for scripts, so the strict-dynamic directives below
// (object-src, base-uri, form-action) carry the weight instead.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // EIP-6963 wallets announce their icons as data: URIs.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self'",
  "connect-src 'self' https://rpc.mainnet.chain.robinhood.com https://rpc.testnet.chain.robinhood.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
