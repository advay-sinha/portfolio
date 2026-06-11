/**
 * site.ts — canonical site identity for metadata, sitemap, robots.
 *
 * URL resolution order: explicit NEXT_PUBLIC_SITE_URL, then Vercel's
 * production-domain env (stamped at deploy — mechanically true), then
 * localhost. Never hardcode a domain the deployment doesn't prove.
 */

const fromEnv =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL !== undefined
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export const SITE_URL = fromEnv ?? "http://localhost:3000";

export const SITE_NAME = "SYSTEMS NEXUS";

export const SITE_DESCRIPTION =
  "An engineering facility documenting real systems work — " +
  "architecture records, operation logs, live telemetry.";
