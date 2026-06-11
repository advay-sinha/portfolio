import { getTelemetry } from "@/lib/telemetry";

/**
 * /api/telemetry — the aggregated, public face of the facility's
 * real telemetry (implementation-architecture §2, §14).
 *
 * Aggregated response only: upstream calls, tokens, and per-source
 * shapes never leave lib/telemetry.ts. 60s revalidation matches the
 * in-universe "revalidated 60s" source line. Hard timeouts and
 * graceful degradation live in the aggregator; this handler only
 * translates "nothing real exists" into 204 — silence, not an error.
 */

export const revalidate = 60;

export async function GET() {
  const telemetry = await getTelemetry();

  if (telemetry === null) {
    // Every source degraded. No body, no fake payload.
    return new Response(null, { status: 204 });
  }

  return Response.json(telemetry, {
    headers: {
      "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
