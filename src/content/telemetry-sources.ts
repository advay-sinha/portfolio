/**
 * telemetry-sources.ts — which real telemetry sources exist
 * (implementation-architecture §2: drives Live chamber inclusion).
 *
 * HONESTY LAW: a source listed here must be a real, queryable origin.
 * The Live chamber ships only while this array is non-empty
 * (homepage-experience §4.4: if nothing live exists, the section does
 * not ship — no fake telemetry, ever). The CI honesty gate fails the
 * build if Live is enabled with zero configured sources.
 *
 * Source lines below render in-universe on panel hover
 * (`> source: github rest api · revalidated 60s`) — observability
 * applied to the portfolio itself.
 */

export type TelemetrySourceId = "github" | "build";

export interface TelemetrySourceSpec {
  id: TelemetrySourceId;
  /** Mono label for the source-notes column. */
  label: string;
  /** In-universe source line, shown on panel hover/focus. */
  detail: string;
}

/** GitHub account every vault record maps to (content/systems.ts). */
export const GITHUB_USER = "advay-sinha";

/** ISR window — matches the in-universe "revalidated 60s" line. */
export const TELEMETRY_REVALIDATE_S = 60;

/** Hard ceiling on any single upstream fetch. Degrade, never hang. */
export const TELEMETRY_TIMEOUT_MS = 3500;

export const TELEMETRY_SOURCES: readonly TelemetrySourceSpec[] = [
  {
    id: "github",
    label: "github rest api",
    detail: "> source: github rest api · revalidated 60s",
  },
  {
    id: "build",
    label: "build metadata",
    detail: "> source: vercel build env · stamped at deploy",
  },
];

export const LIVE_ENABLED = TELEMETRY_SOURCES.length > 0;
