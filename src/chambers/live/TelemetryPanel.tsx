import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { MonoLabel } from "@/primitives/MonoLabel";
import { Panel } from "@/primitives/Panel";

/**
 * TelemetryPanel — one piece of infrastructure, quietly monitored.
 *
 * Built on the Panel primitive (L2 anatomy). Pure presentation; the
 * data arrives server-fetched from LiveSystems. Rows are a mono <dl>
 * with tabular numerals — readouts, never KPIs: no charts, no graphs,
 * no counters, no trend arrows. A panel states what is, with the
 * timestamp that makes the statement honest.
 *
 * The source line (`> source: …`) is observability applied to the
 * portfolio itself (homepage-experience §4.4). It rests at reduced
 * presence and resolves on hover/focus — CSS only, and never hidden:
 * touch and reduced-pointer visitors read it at rest (the touch law —
 * critical info is never hover-only — satisfied by keeping it legible
 * at its resting opacity).
 *
 * Liveness: one low-frequency state tick in the header — a hairline
 * square that blinks once per cycle, sub-attention, CSS-owned, frozen
 * under reduced motion via --ambient-play-state.
 */

export interface TelemetryRow {
  term: string;
  value: string;
}

export interface TelemetryPanelProps {
  /** Mono designation, e.g. "TELEMETRY.DEPLOY". */
  label: string;
  /** Muted metadata beside the label. */
  meta?: string;
  /** Right-aligned status slot — StatusDot + state word. */
  status?: ReactNode;
  rows: readonly TelemetryRow[];
  /** In-universe source line from content/telemetry-sources.ts. */
  source: string;
  className?: string;
}

export function TelemetryPanel({
  label,
  meta,
  status,
  rows,
  source,
  className,
}: TelemetryPanelProps) {
  return (
    <Panel
      as="article"
      label={label}
      meta={
        <span className="inline-flex items-baseline gap-(--space-2xs)">
          {meta}
          {/* Low-frequency state tick — the panel is being read. */}
          <span
            aria-hidden
            className="inline-block size-1 self-center bg-(--nexus-muted) opacity-25 animate-[nexus-tick_14s_var(--ease-linear)_infinite] [animation-play-state:var(--ambient-play-state)]"
          />
        </span>
      }
      status={status}
      interactive
      className={cn("group/telemetry", className)}
    >
      <div className="flex flex-col gap-(--space-sm)">
        <dl className="flex flex-col gap-(--space-3xs)">
          {rows.map((row) => (
            <div
              key={row.term}
              className="flex flex-wrap items-baseline gap-x-(--space-sm)"
            >
              <MonoLabel as="dt" className="opacity-60">
                {row.term}
              </MonoLabel>
              <dd className="ml-auto text-right text-(length:--text-mono) leading-(--leading-mono) tabular-nums [font-family:var(--font-machine)]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <MonoLabel
          as="p"
          className={cn(
            "border-t-(length:--hairline-width) border-(color:--nexus-hairline) pt-(--space-2xs)",
            "normal-case opacity-40 [transition:var(--transition-opacity-resolve)]",
            "group-hover/telemetry:opacity-100 group-focus-within/telemetry:opacity-100"
          )}
        >
          {source}
        </MonoLabel>
      </div>
    </Panel>
  );
}
