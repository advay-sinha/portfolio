import type { CSSProperties } from "react";

import { TerminalSubstrate } from "@/descent/TerminalSubstrate";

/**
 * DeepVoid — G0, the fixed backdrop of the facility.
 *
 * Phase 13.6: the structural hairline grid, the lattice, and the
 * atmospheric lift are replaced by the FaultyTerminal substrate — the
 * component IS the backdrop engine now (used as-is via
 * TerminalSubstrate; see that module for the isolation and tier
 * reasoning). The environment changed; the architecture did not:
 *
 * - Same external shape: one fixed, pointer-events-none, aria-hidden
 *   container at --z-deep-void painted with --nexus-void. Everything
 *   above it (fog at z-fog, planes at z-plane, rail at z-overlay)
 *   stacks exactly as before.
 * - Static tier / no-JS: the substrate never mounts; this shell's
 *   void background is the complete backdrop, exactly the color the
 *   page had before any enhancement.
 *
 * Phase 13.7 — atmosphere calibration (compositing only; the shader
 * is untouched):
 *
 * 1. The substrate composites with mix-blend-screen (set in
 *    TerminalSubstrate): the shader's opaque black framebuffer stops
 *    repainting the void to pure black — only glyph light lands on
 *    the facility's own void color. Blend relationship, not re-theme.
 * 2. READABILITY SCRIM (static): a radial void layer densest over the
 *    center column where chamber content lives (~72%), thinning to
 *    ~40% at the periphery. Text always sits on a calm backdrop; the
 *    edges keep environmental texture — the eye reads systems first
 *    and only FEELS the environment around them.
 * 3. DEPTH SCRIM (engine-coupled): a full void layer whose opacity
 *    consumes the engine's existing --grid-strength write —
 *    calc(0.2 × (1.5 − strength)). Chambers (1.0) hold the substrate
 *    one step dimmer; corridors (1.2–1.5) let it through, so passages
 *    read deeper exactly where fog already condenses; the C4 vacuum
 *    (0.35) strips it down hardest. Corridor depth perception returns
 *    through a dial the engine was already writing — zero engine
 *    changes, zero new effects.
 *
 * Static tier: --grid-strength rests at its token default (1), the
 * scrims settle to constant void-on-void, and no canvas exists.
 *
 * Compositing: `isolation: isolate` + `contain: strict` fence the
 * substrate's repaints inside this fixed layer so the canvas never
 * invalidates the scrolling document above it.
 */

// color-mix stops instead of a fade-to-transparent: the scrim must
// hold a floor at the periphery too (0.68), or the edges read as a
// second, brighter scene. Center 0.9 over brightness 0.22 leaves ~2%
// effective field luminance behind content and ~7% at the periphery —
// the facility is computationally alive without the eye being able to
// say why. Calibrated against rendered frames, twice reduced.
const readabilityScrimStyle: CSSProperties = {
  background:
    "radial-gradient(72% 80% at 50% 50%, " +
    "color-mix(in srgb, var(--nexus-void) 90%, transparent) 0%, " +
    "color-mix(in srgb, var(--nexus-void) 68%, transparent) 100%)",
};

const depthScrimStyle: CSSProperties = {
  backgroundColor: "var(--nexus-void)",
  opacity: "calc(0.2 * (1.5 - var(--grid-strength)))",
};

export function DeepVoid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-(--z-deep-void) bg-(--nexus-void)"
      style={{ isolation: "isolate", contain: "strict" }}
    >
      <TerminalSubstrate />
      <div className="absolute inset-0" style={readabilityScrimStyle} />
      <div className="absolute inset-0" style={depthScrimStyle} />
    </div>
  );
}
