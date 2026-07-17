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

  // These values are baked in at build time. A production build with no
  // resolvable origin silently ships localhost inside og:image, twitter:image,
  // robots.txt and sitemap.xml — every social preview breaks and crawlers get
  // pointed at a dev host. Make that loud rather than silent.
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "\n[grailroute] WARNING: neither NEXT_PUBLIC_SITE_URL nor VERCEL_PROJECT_PRODUCTION_URL is set.\n" +
        "  Metadata, Open Graph images, robots.txt and sitemap.xml will be built with\n" +
        "  http://localhost:3000. Set NEXT_PUBLIC_SITE_URL before deploying.\n",
    );
  }

  return "http://localhost:3000";
}
