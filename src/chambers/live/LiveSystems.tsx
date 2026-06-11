import { TelemetryPanel, type TelemetryRow } from "@/chambers/live/TelemetryPanel";
import {
  GITHUB_USER,
  LIVE_ENABLED,
  TELEMETRY_SOURCES,
  type TelemetrySourceId,
} from "@/content/telemetry-sources";
import { getTelemetry, type Telemetry } from "@/lib/telemetry";
import { Reveal, RevealGroup } from "@/motion/RevealGroup";
import { MonoLabel } from "@/primitives/MonoLabel";
import { StatusDot } from "@/primitives/StatusDot";

/**
 * LiveSystems — DEPTH.04, the engine room (homepage-experience §4.4).
 * After history, proof of the present tense.
 *
 * Async server component: telemetry is fetched here, server-side,
 * through the same aggregation the /api/telemetry route serves (ISR,
 * 60s revalidate — the chamber and the API cannot disagree). No client
 * polling, no loading spinners, no fake realtime: the page regenerates
 * with data ≤60s stale, matching the in-universe source lines.
 *
 * Omission contract (real data law, strata-spec §16): the chamber
 * renders only panels whose source actually answered. If every source
 * degrades, it returns null — quietly omitting itself with no
 * empty-state UI. Layout survives by construction: the stratum's
 * height comes from the scroll map, never from content measurement,
 * so omission leaves a band of honest dark void, not a broken page.
 *
 * Composition (strata-spec §3.1): focal mass right — telemetry group
 * cols 5–12, source notes cols 2–4. The source-notes column lists the
 * configured origins; each panel carries its own `> source:` line.
 *
 * Tone: infrastructural, not analytical. Panels state deployment
 * lineage and repository activity as absolute timestamps and counts —
 * no charts, no deltas, no dashboard energy. The facility is most
 * awake here, and says so only through light (the strongest cyan
 * ambient on the page) and the quiet tick of its readouts.
 *
 * Arrival: marker (0), heading (1), source notes (2), then the panel
 * group resolves as a single unit (3, cinematic opacity only — the
 * infrastructure was already running; nothing "loads into existence").
 */

const SOURCE_DETAIL: Record<TelemetrySourceId, string> = Object.fromEntries(
  TELEMETRY_SOURCES.map((s) => [s.id, s.detail])
) as Record<TelemetrySourceId, string>;

/** Absolute UTC stamp — never relative time (relative lies as it stales). */
function formatUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 16);
  return `${date} · ${time} utc`;
}

export async function LiveSystems() {
  if (!LIVE_ENABLED) return null;

  const telemetry = await getTelemetry();
  // Every source degraded — the chamber quietly omits itself.
  if (telemetry === null) return null;

  return (
    <section aria-labelledby="live-title" className="relative w-full">
      {/* L1 ambient — the strongest cyan on the page, center: the
          facility is most awake here. Slow drift, frozen under
          reduced motion. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-(--z-ambient) animate-[nexus-drift_14s_var(--ease-linear)_infinite] [animation-play-state:var(--ambient-play-state)]"
        style={{
          background:
            "radial-gradient(46% 42% at 52% 55%, var(--nexus-glow-dim), transparent 74%)",
        }}
      />

      <RevealGroup className="relative mx-auto grid w-full max-w-(--layout-max) grid-cols-12 gap-x-(--layout-gutter) gap-y-(--space-xl) px-(--layout-margin)">
        <div className="col-span-12 flex flex-col gap-(--space-2xs) md:col-span-8 md:col-start-5">
          <Reveal kind="mono" step={0}>
            <MonoLabel as="p">DEPTH.04 · SYS.LIVE / 04</MonoLabel>
          </Reveal>
          <Reveal kind="panel" step={1}>
            <h2
              id="live-title"
              className="text-(length:--text-h2) leading-(--leading-heading) [font-weight:var(--weight-medium)]"
            >
              Live Systems
            </h2>
          </Reveal>
        </div>

        {/* Source notes — cols 2–4. The chamber's observability ledger. */}
        <Reveal
          kind="mono"
          step={2}
          className="col-span-12 md:col-span-3 md:col-start-2"
        >
          <MonoLabel
            as="p"
            className="flex flex-col gap-(--space-3xs) border-t-(length:--hairline-width) border-(color:--nexus-hairline) pt-(--space-sm)"
          >
            <span className="opacity-60">telemetry sources</span>
            {TELEMETRY_SOURCES.map((source) => (
              <span key={source.id}>{source.label}</span>
            ))}
            <span className="normal-case opacity-60">
              &gt; aggregated · revalidated 60s
            </span>
          </MonoLabel>
        </Reveal>

        {/* Telemetry group — cols 5–12, resolving already-running. */}
        <Reveal
          kind="resolve"
          step={3}
          className="col-span-12 md:col-span-8 md:col-start-5"
        >
          <div className="grid grid-cols-1 gap-(--layout-gutter) lg:grid-cols-2">
            {telemetry.deployment !== null && (
              <DeploymentPanel telemetry={telemetry} />
            )}
            {telemetry.repository !== null && (
              <RepositoryPanel telemetry={telemetry} />
            )}
          </div>
        </Reveal>
      </RevealGroup>
    </section>
  );
}

function DeploymentPanel({ telemetry }: { telemetry: Telemetry }) {
  const deployment = telemetry.deployment;
  if (deployment === null) return null;

  const rows: TelemetryRow[] = [
    { term: "environment", value: deployment.env },
    ...(deployment.commit !== null
      ? [{ term: "commit", value: deployment.commit }]
      : []),
    ...(deployment.branch !== null
      ? [{ term: "branch", value: deployment.branch }]
      : []),
    { term: "read at", value: formatUtc(telemetry.generatedAt) },
  ];

  return (
    <TelemetryPanel
      label="TELEMETRY.DEPLOY"
      meta="build lineage"
      status={
        <>
          <StatusDot tone="ok" />
          deployed
        </>
      }
      rows={rows}
      source={SOURCE_DETAIL.build}
    />
  );
}

function RepositoryPanel({ telemetry }: { telemetry: Telemetry }) {
  const repository = telemetry.repository;
  if (repository === null) return null;

  const rows: TelemetryRow[] = [
    ...(repository.publicRepos !== null
      ? [
          {
            term: "public repositories",
            value: String(repository.publicRepos),
          },
        ]
      : []),
    ...repository.recent.map((repo) => ({
      term: repo.name.toLowerCase(),
      value: formatUtc(repo.pushedAt),
    })),
  ];

  return (
    <TelemetryPanel
      label="TELEMETRY.REPO"
      meta={`${GITHUB_USER} · last pushes`}
      status={
        <>
          <StatusDot tone="ok" />
          active
        </>
      }
      rows={rows}
      source={SOURCE_DETAIL.github}
    />
  );
}
