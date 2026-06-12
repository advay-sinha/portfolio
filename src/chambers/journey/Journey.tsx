import { LogSpine } from "@/chambers/logs/LogSpine";
import { JOURNEY, JOURNEY_SPAN, type JourneyEntry } from "@/content/journey";
import { Reveal, RevealGroup } from "@/motion/RevealGroup";
import { cn } from "@/lib/utils";
import { MonoLabel } from "@/primitives/MonoLabel";

/**
 * Journey — DEPTH.03, the chronology (Phase 14: the archive chamber
 * now records the engineer's history, not project operations).
 * Time replaces space; the ledger shows where he's been.
 *
 * Server component: semantic chronology only. The one behavior —
 * scrub-linked spine progression — lives in the LogSpine island it
 * composes (unchanged: the spine never cared what the records say).
 * Rendered alone (or JS-disabled), this is a complete archive read
 * top to bottom.
 *
 * Layout law carried over verbatim from the operations ledger: one
 * vertical hairline spine, every record hangs right of it in a single
 * left-aligned chronology — no cards, no alternating zig-zag, no
 * timeline bubbles, no panel chrome. Mono carries the operational
 * layer (span, organization, record type); Grotesk speaks only the
 * record titles. Reading order is span-first: when, where, what kind —
 * then what it was.
 *
 * Emphasis is typographic, never chromatic: high-weight records (the
 * shipped role, the win, the present) take full text color on their
 * type tag; education and tenure records hold the muted register.
 * No badges, no medals, no resume styling.
 */

const WEIGHT_CLASS: Record<JourneyEntry["weight"], string> = {
  standard: "opacity-60",
  high: "text-(color:--nexus-text)",
};

export function Journey() {
  const subReadout = `${JOURNEY.length} records · ${JOURNEY_SPAN}`;

  return (
    <section aria-labelledby="logs-title" className="relative w-full">
      {/* L1 ambient — barely visible, low: the nearly-dark archive. */}
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
              <MonoLabel as="p">DEPTH.03 · JOURNEY / 03</MonoLabel>
            </Reveal>
            <Reveal kind="panel" step={1}>
              <h2
                id="logs-title"
                className="text-(length:--text-h2) leading-(--leading-heading) [font-weight:var(--weight-medium)]"
              >
                Journey
              </h2>
            </Reveal>
            <Reveal kind="mono" step={2}>
              <MonoLabel as="p">{subReadout}</MonoLabel>
            </Reveal>
          </div>

          <Reveal kind="resolve" step={3} className="pt-(--space-xl)">
            <LogSpine>
              <ol className="flex flex-col gap-(--space-2xl) pl-(--space-lg)">
                {JOURNEY.map((entry, i) => (
                  <JourneyRecord
                    key={entry.id}
                    entry={entry}
                    // Stagger cap: later records share the last beat —
                    // the archive settles as one, it doesn't drip.
                    step={4 + Math.min(i, 5)}
                  />
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
 * One archived record. The <li> carries the scrub state (CSS answers
 * LogSpine's data-log-state flips); the Reveal inside it owns the
 * one-time entrance — different nodes, no shared writers.
 */
function JourneyRecord({ entry, step }: { entry: JourneyEntry; step: number }) {
  return (
    <li
      data-log-entry
      className={cn(
        "group/entry relative",
        "[transition:var(--transition-opacity-resolve)]",
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
          aria-label={`${entry.id} — ${entry.title}`}
          className="flex flex-col gap-(--space-2xs)"
        >
          {/* Span-first reading order: when · where · what kind. */}
          <MonoLabel
            as="p"
            className="flex flex-wrap items-baseline gap-x-(--space-2xs)"
          >
            <time dateTime={entry.timestamp}>{entry.span}</time>
            <span aria-hidden>·</span>
            <span>{entry.org}</span>
            <span
              className={cn("ml-auto", WEIGHT_CLASS[entry.weight])}
            >
              [{entry.type}]
            </span>
          </MonoLabel>

          <h3 className="text-(length:--text-h3) leading-(--leading-heading) [font-weight:var(--weight-medium)]">
            {entry.title}
          </h3>

          <p className="max-w-(--measure-body) text-(color:--nexus-muted)">
            {entry.summary}
          </p>

          {entry.outcome !== undefined && (
            <p className="max-w-(--measure-body) text-(length:--text-mono) leading-(--leading-mono) [font-family:var(--font-machine)]">
              <span className="text-(color:--nexus-muted)">&gt; status:</span>{" "}
              {entry.outcome}
            </p>
          )}
        </article>
      </Reveal>
    </li>
  );
}
