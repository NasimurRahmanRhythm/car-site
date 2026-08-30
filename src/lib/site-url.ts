/**
 * Temporary home of the site until a custom domain is bought. It is the last
 * fallback rather than a hardcoded value so a single env var replaces it.
 */
const DEFAULT_SITE_URL = "https://car-site-bay.vercel.app";

/**
 * The site's own absolute origin, no trailing slash.
 *
 * Server-side only — `VERCEL_*` are not exposed to the browser bundle.
 *
 * Order matters: an explicit `NEXT_PUBLIC_SITE_URL` wins so a custom domain can
 * override Vercel's generated one; otherwise Vercel's stable production host is
 * used, then the per-deployment host (preview builds), then the default above.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost}`;

  return DEFAULT_SITE_URL;
}
