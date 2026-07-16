/**
 * Canonical public origin, resolved at build time.
 *
 * Reading this from request headers would opt every route out of static
 * generation, so the value comes from configuration instead:
 *
 *   1. NEXT_PUBLIC_SITE_URL          — explicit override for any host
 *   2. VERCEL_PROJECT_PRODUCTION_URL — supplied automatically by Vercel
 *   3. localhost                     — local development
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelHost) return `https://${vercelHost}`;

  return "http://localhost:3000";
}
