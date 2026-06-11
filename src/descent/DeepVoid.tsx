import type { CSSProperties } from "react";

/**
 * DeepVoid — G0, the fixed backdrop of the facility (strata-spec §10).
 *
 * Server component, CSS-only rendering. The deepest layer of the global
 * stack: the void color, a structural hairline grid at --grid-interval,
 * and one near-invisible atmospheric lift.
 *
 * Implementation reasoning:
 * - `repeating-linear-gradient` hairlines instead of an image, canvas,
 *   or WebGL: zero requests, zero per-frame work, resolution-independent,
 *   and the line color/interval stay bound to tokens.css. The grid is
 *   drafting-table character (design-system §1), not decoration.
 * - Grid opacity is `calc(var(--grid-strength) * 0.5)`. --grid-strength
 *   is the per-chamber dial (implementation-architecture §5) that the
 *   corridor choreography (C1 densification, C4 strip-down) will drive
 *   through one custom property — no per-chamber grid copies.
 * - DOM is three layers for one reason: the radial mask must NOT move
 *   with the grid. The mask lives on a static container; the grid layer
 *   inside it is the engine's translate target (data-descent="grid").
 *   G0 moves at 0.97× scroll (strata-spec §10): the engine translates
 *   this layer by the 3% differential, wrapped modulo the grid interval
 *   so a bounded offset reads as endless depth. The layer bleeds one
 *   full interval vertically (and 4% horizontally) so the wrap never
 *   exposes an edge.
 * - The atmosphere layer is one radial of --nexus-hairline at 0.35 — an
 *   effective ~4% lift at center. L0 ambience, not a light source:
 *   chamber beacons (L1) are owned by planes and never live here.
 *
 * Performance reasoning:
 * - position: fixed + pure backgrounds: painted once, then composited.
 *   The grid translate is transform-only on a pre-painted layer — no
 *   repaint, no layout, driven by a quickSetter outside React.
 *
 * Ownership: the engine (GSAP) writes transform to the grid layer and
 * --grid-strength later; nothing else ever animates here. This file
 * stays a paint target — it never gains client logic.
 */

const hairline = "var(--nexus-hairline)";
const lineWidth = "var(--hairline-width)";
const interval = "var(--grid-interval)";

const gridStyle: CSSProperties = {
  // Bleed: one grid interval vertically (the translate wrap range),
  // 4% horizontally (reserved for any future lateral component).
  inset: `calc(${interval} * -1) -4%`,
  backgroundImage: [
    `repeating-linear-gradient(to right, ${hairline} 0, ${hairline} ${lineWidth}, transparent ${lineWidth}, transparent ${interval})`,
    `repeating-linear-gradient(to bottom, ${hairline} 0, ${hairline} ${lineWidth}, transparent ${lineWidth}, transparent ${interval})`,
  ].join(", "),
  opacity: "calc(var(--grid-strength) * 0.5)",
};

const maskStyle: CSSProperties = {
  maskImage:
    "radial-gradient(120% 100% at 50% 44%, black 55%, transparent 100%)",
  WebkitMaskImage:
    "radial-gradient(120% 100% at 50% 44%, black 55%, transparent 100%)",
};

const atmosphereStyle: CSSProperties = {
  background:
    "radial-gradient(80% 64% at 50% 40%, var(--nexus-hairline), transparent 70%)",
  opacity: 0.35,
};

export function DeepVoid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-(--z-deep-void) bg-(--nexus-void)"
    >
      <div className="absolute inset-0" style={atmosphereStyle} />
      <div className="absolute inset-0" style={maskStyle}>
        <div data-descent="grid" className="absolute" style={gridStyle} />
      </div>
    </div>
  );
}
