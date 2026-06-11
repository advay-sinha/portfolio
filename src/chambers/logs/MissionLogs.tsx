import { LogSpine } from "@/chambers/logs/LogSpine";
import {
  FAILURE_TRACE_COUNT,
  LOGS,
  type LogEntry,
  type LogSeverity,
} from "@/content/logs";
import { Reveal, RevealGroup } from "@/motion/RevealGroup";
import { cn } from "@/lib/utils";
import { MonoLabel } from "@/primitives/MonoLabel";

/**
 * MissionLogs — DEPTH.03, the archive (homepage-experience §4.3).
 * Time replaces space; the facility shows its scars.
 *
 * Server component: semantic chronology only. The one behavior —
 * scrub-linked spine progression — lives in the LogSpine island it
 * composes. Rendered alone (or JS-disabled), this is a complete,
 * fully lit archive read top to bottom.
 *
 * Layout reasoning — an archive line, not a "timeline component":
 * one vertical hairline spine on the left; every entry hangs right of
 * it in a single left-aligned chronology (no cards, no alternating
 * zig-zag, no panel chrome — entries are typographic records separated
 * by space). Mono carries the operational layer (timestamp, system,
 * tags, outcome); Grotesk speaks only the operation titles. Reading
 * order inside an entry is timestamp-first: when it happened, where,
 * what kind, how bad — then what it was.
 *
 * Severity is typographic, never chromatic (critical events use
 * restraint): info recedes, warning holds the muted register, critical
 * takes full text color. No badges, no alert banners, no red.
 * Failure notes are preserved traces, prefixed `!` in mono — evidence,
 * not drama.
 *
 * Ambient: the dimmest on the page — glow-dim at half presence, low
 * (strata-spec §6: the archive is nearly dark; the visitor descends
 * toward less light).
 *
 * Arrival (one RevealGroup; logs are the slow chamber — entries use
 * the deliberate panel rise): marker (0), heading (1), sub-readout (2),
 * spine resolves (3, cinematic — first structure to finish forming),
 * entries settle sequentially (4–9; six entries = the stagger cap).
 * Failures arrive with the same treatment as everything else.
 * Entry de-emphasis during the scrub is bidirectional camera state
 * owned by LogSpine + CSS — reveals fire once, scrub state replays.
 */

const SEVERITY_CLASS: Record<LogSeverity, string> = {
  /* Urgency is brightness, not color. */
  info: "opacity-60",
  warning: "",
  critical: "text-(color:--nexus-text)",
};

export function MissionLogs() {
  const subReadout = [
    `${LOGS.length} operations`,
    FAILURE_TRACE_COUNT > 0 ? `${FAILURE_TRACE_COUNT} failure traces` : null,
  ]
    .filter((part) => part !== null)
    .join(" · ");

  return (
    <section aria-labelledby="logs-title" className="relative w-full">
      {/* L1 ambient — barely visible, low: the nearly-dark archive.
          Half presence of glow-dim ≈ the 8%-strength beacon law. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-(--z-ambient) opacity-50 animate-[nexus-drift_20s_var(--ease-linear)_infinite] [animation-play-state:var(--ambient-play-state)]"
        style={{
          background:
            "radial-gradient(36% 30% at 28% 82%, var(--nexus-glow-dim), transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-(--layout-max) grid-cols-12 gap-x-(--layout-gutter) px-(--layout-margin)">
        <RevealGroup className="col-span-12 flex flex-col gap-(--space-md) md:col-span-8 md:col-start-2">
          <div className="flex flex-col gap-(--space-2xs)">
            <Reveal kind="mono" step={0}>
              <MonoLabel as="p">DEPTH.03 · SYS.LOGS / 03</MonoLabel>
            </Reveal>
            <Reveal kind="panel" step={1}>
              <h2
                id="logs-title"
                className="text-(length:--text-h2) leading-(--leading-heading) [font-weight:var(--weight-medium)]"
              >
                Mission Logs
              </h2>
            </Reveal>
            <Reveal kind="mono" step={2}>
              <MonoLabel as="p">{subReadout}</MonoLabel>
            </Reveal>
          </div>

          <Reveal kind="resolve" step={3} className="pt-(--space-xl)">
            <LogSpine>
              <ol className="flex flex-col gap-(--space-2xl) pl-(--space-lg)">
                {LOGS.map((log, i) => (
                  <LogRecord key={log.id} log={log} step={4 + i} />
                ))}
              </ol>
            </LogSpine>
          </Reveal>
        </RevealGroup>
      </div>
    </section>
  );
}

/**
 * One archived operation. The <li> carries the scrub state (CSS
 * answers LogSpine's data-log-state flips); the Reveal inside it owns
 * the one-time entrance — different nodes, no shared writers.
 */
function LogRecord({ log, step }: { log: LogEntry; step: number }) {
  return (
    <li
      data-log-entry
      className={cn(
        "group/entry relative",
        "[transition:var(--transition-opacity-resolve)]",
        // De-emphasis exists only while the spine scrub is live; the
        // document default is fully lit. Prior logs remain visible.
        "group-data-[spine-active]/logs:data-[log-state=past]:opacity-75",
        "group-data-[spine-active]/logs:data-[log-state=ahead]:opacity-45"
      )}
    >
      {/* Spine node — operational clarity transfers to the current record. */}
      <span
        aria-hidden
        className={cn(
          "absolute top-(--space-3xs) left-[calc(var(--space-lg)*-1)] size-1.5 -translate-x-1/2 rounded-(--radius-full)",
          "border border-(color:--nexus-hairline) bg-(--nexus-panel)",
          "[transition:var(--transition-panel-elevate)]",
          "group-data-[log-state=current]/entry:border-(color:--nexus-glow-dim) group-data-[log-state=current]/entry:bg-(--nexus-glow-dim)"
        )}
      />

      <Reveal kind="panel" step={step}>
        <article
          aria-label={`${log.id} — ${log.title}`}
          className="flex flex-col gap-(--space-2xs)"
        >
          {/* Timestamp-first reading order: when · where · kind · weight. */}
          <MonoLabel
            as="p"
            className="flex flex-wrap items-baseline gap-x-(--space-2xs)"
          >
            <time dateTime={log.timestamp}>
              {log.timestamp.replace("-", ".")}
            </time>
            <span aria-hidden>·</span>
            <span>{log.system}</span>
            <span aria-hidden>·</span>
            <span className="opacity-60">[{log.type}]</span>
            <span className={cn("ml-auto", SEVERITY_CLASS[log.severity])}>
              {log.severity}
            </span>
          </MonoLabel>

          <h3 className="text-(length:--text-h3) leading-(--leading-heading) [font-weight:var(--weight-medium)]">
            {log.title}
          </h3>

          <p className="max-w-(--measure-body) text-(color:--nexus-muted)">
            {log.summary}
          </p>

          <p className="max-w-(--measure-body) text-(length:--text-mono) leading-(--leading-mono) [font-family:var(--font-machine)]">
            <span className="text-(color:--nexus-muted)">&gt; outcome:</span>{" "}
            {log.outcome}
          </p>

          {log.failureNote !== undefined && (
            <p className="max-w-(--measure-body) text-(length:--text-mono) leading-(--leading-mono) text-(color:--nexus-muted) [font-family:var(--font-machine)]">
              <span aria-hidden>! </span>
              {log.failureNote}
            </p>
          )}
        </article>
      </Reveal>
    </li>
  );
}
