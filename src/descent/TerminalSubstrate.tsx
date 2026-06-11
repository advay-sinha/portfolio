"use client";

import dynamic from "next/dynamic";

import { useDescent } from "@/descent/DescentProvider";

/**
 * TerminalSubstrate — the client island that mounts FaultyTerminal as
 * the facility's atmospheric substrate (Phase 13.6: background
 * replacement only).
 *
 * Isolation reasoning: FaultyTerminal is WebGL + window-dependent, so
 * it loads behind `ssr: false` inside this "use client" leaf — the
 * page, chambers, and DeepVoid's shell stay server-rendered; the
 * client cost is exactly this wrapper. The component itself is used
 * AS-IS: no prop overrides, no re-theming, no toned-down variants —
 * it is the backdrop engine, not a Nexus-styled derivative.
 *
 * Tier gate: the static tier (reduced motion, and the no-JS document
 * by construction) never mounts it — an aggressively animated
 * substrate cannot honor reduced motion by pausing into a frozen
 * glitch frame; designed absence is the honest rung, and the void
 * background beneath remains the visually complete page.
 */

const FaultyTerminal = dynamic(() => import("@/components/FaultyTerminal"), {
  ssr: false,
});

// Same values as the component's own default — hoisted because the
// default `[2, 1]` is a fresh array identity per render, and it sits
// in the component's effect deps: every re-render (tier resolution,
// lazy-load settle) tears the WebGL context down and re-creates it,
// and the torn-down `loseContext()` can leave the surviving canvas
// dead. Stable identity = one effect run = one living context.
const GRID_MUL: [number, number] = [2, 1];

export function TerminalSubstrate() {
  const { tier } = useDescent();

  if (tier === "static") return null;

  // Props only — the component's public configuration API, untouched
  // internals. scale 1.5 is the density the effect was authored to be
  // seen at (the default 1 leaves the fbm field almost entirely under
  // its glyph threshold on a full viewport — an invisible backdrop is
  // a failed swap, not restraint).
  // pageLoadAnimation off: the facility's BootSequence owns arrival —
  // a second, per-cell fade-in underneath it is invisible at best and
  // competes at worst.
  //
  // Phase 13.7 calibration (props + compositing only):
  // - brightness 0.65 — the raw field at 1.0 reads as subject, not
  //   substrate; intensity is the component's own public dial.
  // - mix-blend-screen on the wrapper — the shader's opaque black
  //   clear stops flattening the void to #000; only the glyph light
  //   composites onto the facility's own dark, so the substrate sits
  //   IN the void instead of replacing it. DeepVoid's scrims handle
  //   readability and corridor depth above this layer.
  return (
    <div className="h-full w-full mix-blend-screen">
      <FaultyTerminal
        scale={1.5}
        gridMul={GRID_MUL}
        pageLoadAnimation={false}
        brightness={0.22}
      />
    </div>
  );
}
