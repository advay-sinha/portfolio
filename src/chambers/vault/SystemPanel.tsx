import Link from "next/link";

import { Schematic } from "@/chambers/vault/Schematic";
import type { SystemRecord } from "@/content/systems";
import { cn } from "@/lib/utils";
import { MonoLabel } from "@/primitives/MonoLabel";
import { Panel } from "@/primitives/Panel";
import { StatusDot } from "@/primitives/StatusDot";

/**
 * SystemPanel — one operational system as a vault artifact.
 *
 * Built on the Panel primitive (L2 anatomy). Reading order is the
 * storytelling law: designation → name → constraint (the lead — the
 * pressure that created the system, never the feature list) → schematic
 * → infrastructure line → dossier entry. Stack renders as one mono
 * infrastructure readout, not badge chips; status words are engineering
 * states (operational / experimental), never achievement language.
 *
 * Focus states (two distinct regimes, CSS-owned):
 * - Resting/stacked (mobile, static tier, no track): a normal
 *   interactive panel — hover raises to panel-raised + glow border.
 * - On the lateral track (ancestor [data-track-active]): VaultTrack
 *   assigns data-focused; the focused panel takes L4 (raised, glow
 *   border, 24px glow shadow) and unfocused panels recede to 60%
 *   presence. GSAP never touches these properties — it writes x to the
 *   track element only; focus transfer is a discrete attribute flip
 *   that CSS transitions answer. No tilt, no scale, no float.
 *
 * The dossier link is a real anchor (next/link): it works JS-disabled,
 * carries the facility's hover vocabulary in CSS only, and reads as an
 * archive operation, not a call-to-action.
 */

const STATUS_TONE = {
  operational: "ok",
  experimental: "warn",
} as const;

export interface SystemPanelProps {
  system: SystemRecord;
  className?: string;
}

export function SystemPanel({ system, className }: SystemPanelProps) {
  const tone =
    system.status === "archived" ? "warn" : STATUS_TONE[system.status];

  return (
    <Panel
      as="article"
      id={`sys-${system.slug}`}
      label={system.designation}
      meta={system.role}
      status={
        <>
          <StatusDot tone={tone} />
          {system.status}
        </>
      }
      interactive
      data-system-panel
      data-focused="true"
      className={cn(
        // Discrete focus-transfer response — only meaningful on the track.
        "[transition:var(--transition-panel-elevate),var(--transition-opacity-resolve)]",
        "group-data-[track-active]/track:data-[focused=false]:opacity-60",
        "group-data-[track-active]/track:data-[focused=true]:z-(--z-focus)",
        "group-data-[track-active]/track:data-[focused=true]:bg-(--nexus-panel-raised)",
        "group-data-[track-active]/track:data-[focused=true]:border-(color:--nexus-glow-dim)",
        "group-data-[track-active]/track:data-[focused=true]:[box-shadow:var(--glow-focus)]",
        className
      )}
    >
      <div className="flex flex-col gap-(--space-md)">
        <h3 className="text-(length:--text-h3) leading-(--leading-heading) [font-weight:var(--weight-medium)]">
          {system.title}
        </h3>

        {/* Constraint-first: the pressure, not the pitch. */}
        <p className="max-w-(--measure-body) text-(color:--nexus-muted)">
          {system.constraint}
        </p>

        {system.schematicId !== null && (
          <Schematic
            id={system.schematicId}
            className="h-auto w-full border-y-(length:--hairline-width) border-(color:--nexus-hairline) py-(--space-sm)"
          />
        )}

        <MonoLabel as="p" className="flex flex-wrap gap-x-(--space-2xs)">
          <span className="opacity-60">infra:</span>
          {system.stack.join(" · ")}
        </MonoLabel>

        {system.dossier !== undefined && (
          <Link
            href={`/systems/${system.slug}`}
            className={cn(
              "self-start text-(length:--text-mono) text-(color:--nexus-muted) [font-family:var(--font-machine)]",
              "[transition:color_var(--motion-instant)_var(--ease-out-facility)]",
              "hover:text-(color:--nexus-glow) focus-visible:text-(color:--nexus-glow)"
            )}
          >
            &gt; open dossier
          </Link>
        )}
      </div>
    </Panel>
  );
}
