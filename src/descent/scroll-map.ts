/**
 * scroll-map.ts — THE source of truth for the descent
 * (implementation-architecture §4.1; strata-spec §9 encoded verbatim).
 *
 * Pure data. No runtime logic, no DOM, no imports from React/GSAP.
 * Every consumer — plane phases, fog veil, drift, document layout,
 * future nav/anchor/pin systems — derives from this module so a
 * corridor length is a one-line data edit, never a hunt through
 * component code.
 *
 * Units: segment lengths are vh (viewport-heights). The page lays its
 * planes and corridor spacers out at exactly these lengths, so scroll
 * position divided by 1vh maps 1:1 onto this table — the camera reads
 * real document height, it never fakes one (implementation-architecture §5).
 *
 * Extensibility:
 * - Chamber choreography (pins, spines) reads `pin` metadata from here;
 *   the pin itself is owned by VaultTrack later. The reserve second pin
 *   (interaction-principles §4) stays unused by construction: only one
 *   segment carries pin metadata.
 * - When chambers grow real content, focus lengths may need retuning —
 *   change them HERE, then the document layout and the math follow.
 * - depth-math.ts consumes this table through `resolveScrollMap`; the
 *   two files are the spec's §9 table and its pure-function reading.
 *
 * Mobile adaptation strategy (strata-spec §12):
 * `forViewport(width)` derives the mobile variant instead of forking
 * the map: corridors ×0.6 (≈40% shorter), fog peaks capped at 25%,
 * lateral drift zeroed, Vault pin removed. One component tree, one
 * map, viewport-derived parameters. The CSS token --corridor-scale in
 * tokens.css mirrors MOBILE_CORRIDOR_SCALE so corridor spacer heights
 * and the math stay in lockstep.
 */

export type StratumId =
  | "boot"
  | "core"
  | "vault"
  | "logs"
  | "live"
  | "terminal"
  | "contact";

export type CorridorId = "c0" | "c1" | "c2" | "c3" | "c4" | "c5";

export interface FocusSegment {
  kind: "focus";
  id: StratumId;
  /** Depth coordinate DEPTH.0n (strata-spec §2). */
  depth: number;
  /** Focus band length in vh (strata-spec §9). */
  length: number;
  /** Lateral drift at focus — signed fraction of viewport width, |drift| ≤ 0.02 (strata-spec §3.1). */
  drift: number;
  /**
   * Departure scale ceiling override. Only C5 uses it: the terminal
   * departs gently at 1.03 (strata-spec §11, decompression). All other
   * strata use PHASE_GEOMETRY.departureScaleTo.
   */
  departureScaleTo?: number;
  /**
   * Pin reservation — data hook only. The Vault lateral track is the
   * page's single pin (≤150vh, strata-spec §7); VaultTrack will own
   * the actual ScrollTrigger. Absent on mobile (unpinned layout).
   */
  pin?: { maxLengthVh: number };
}

export interface CorridorSegment {
  kind: "corridor";
  id: CorridorId;
  /** Transit length in vh. */
  length: number;
  /** Peak fog-veil opacity at mid-corridor, 0–1 (strata-spec §5). */
  fogPeak: number;
  /**
   * G0 grid density at mid-corridor (strata-spec §10: C1 densification,
   * C4 strip-down). 1 = focus-band baseline; the engine drives
   * --grid-strength toward this value with the same half-sine the fog
   * uses, so structure condenses between chambers and the vacuum
   * transit (C4) actually empties. Mid-corridor value, never a step.
   */
  grid: number;
  /**
   * Signal-bleed coefficient at mid-corridor, 0–1 (G1 layer). Machine
   * memory leaking through strata: dormant terminal chatter that peaks
   * only between chambers and only where the facility plausibly leaks —
   * approaching the archive, and through the vacuum transit where
   * nothing else lives. 0 (or absent) = the corridor is silent.
   * Multiplied by SIGNAL_BLEED.maxOpacity; content never competes with
   * it because focus bands are always 0 by construction.
   */
  bleed?: number;
}

export type Segment = FocusSegment | CorridorSegment;

/** Strata-spec §9 desktop table, verbatim. Total ≈ 1230vh. */
export const SCROLL_MAP: readonly Segment[] = [
  { kind: "focus", id: "boot", depth: 0, length: 100, drift: 0 },
  { kind: "corridor", id: "c0", length: 40, fogPeak: 0.15, grid: 1.25 },
  { kind: "focus", id: "core", depth: 1, length: 120, drift: -0.02 },
  { kind: "corridor", id: "c1", length: 50, fogPeak: 0.2, grid: 1.5, bleed: 0.45 },
  {
    kind: "focus",
    id: "vault",
    depth: 2,
    // §9 wrote 250 pre-implementation; real pin mechanics need the
    // pinned element's own height (~100vh) ON TOP of the 150vh pin
    // distance, plus arrival heading and the ~60vh archive shelf.
    // 360 = arrival ~50 + track 100 + pin spacing 150 + shelf ~60.
    // The map is the source of truth — tuned here, consumed everywhere.
    length: 360,
    drift: 0.015,
    pin: { maxLengthVh: 150 },
  },
  { kind: "corridor", id: "c2", length: 55, fogPeak: 0.35, grid: 1.3, bleed: 0.3 },
  { kind: "focus", id: "logs", depth: 3, length: 180, drift: 0 },
  { kind: "corridor", id: "c3", length: 35, fogPeak: 0.25, grid: 1.2 },
  { kind: "focus", id: "live", depth: 4, length: 120, drift: 0.02 },
  // vacuum transit — no fog, structure strips down toward nothing;
  // the only thing alive here is dormant terminal bleed (full coefficient)
  { kind: "corridor", id: "c4", length: 40, fogPeak: 0, grid: 0.35, bleed: 1 },
  {
    kind: "focus",
    id: "terminal",
    depth: 5,
    length: 100,
    drift: 0,
    departureScaleTo: 1.03,
  },
  // departing the terminal — its chatter follows you out, fading
  { kind: "corridor", id: "c5", length: 30, fogPeak: 0.1, grid: 1.1, bleed: 0.55 },
  { kind: "focus", id: "contact", depth: 6, length: 110, drift: -0.015 },
];

/* ----------------------------------------------------------------
   PHASE GEOMETRY (strata-spec §4, §8, §9 — the plane lifecycle dials)
   Named here, consumed by depth-math.ts. No magic values downstream.
   ---------------------------------------------------------------- */
export const PHASE_GEOMETRY = {
  /** Departure occupies the first 60% of a corridor (strata-spec §9). */
  departurePortion: 0.6,
  /** Proxy → real swap occupies the first 20% of a corridor (silhouette zone for the real plane). */
  proxySwapPortion: 0.2,
  /** Approach ramp occupies the final 80% of a corridor. */
  approachPortion: 0.8,
  /** Visibility horizon: next stratum becomes visible in the current focus band's final 50vh (strata-spec §4). */
  horizonVh: 50,
  /** Approach starts at scale 0.94 (full tier) per strata-spec §4. */
  approachScaleFrom: 0.94,
  /** No-blur tier compensates the missing blur ramp with a shallower scale ramp (strata-spec §12). */
  approachScaleFromNoBlur: 0.96,
  /** Approach starts at 35% opacity. */
  approachOpacityFrom: 0.35,
  /** Departure ends at scale 1.06 (unless a stratum overrides — C5). */
  departureScaleTo: 1.06,
  /** Focus micro-drift: scale 1.000 → 1.005 across the focus band (camera z creep). */
  focusMicroScale: 0.005,
  /** B1 blur ceiling — the page's single live filter (strata-spec §8). */
  blurMaxPx: 4,
} as const;

/* ----------------------------------------------------------------
   G0 ENVIRONMENT (strata-spec §10)
   ---------------------------------------------------------------- */
export const G0 = {
  /** The deep-void grid moves at 0.97× scroll — barely-felt depth. */
  scrollFactor: 0.97,
  /** Grid hairline interval in px. Mirrors --grid-interval (6rem) in tokens.css. */
  gridIntervalPx: 96,
  /**
   * The structural lattice — a second, coarser hairline layer one
   * order behind the grid. Its 6% differential vs. the grid's 3% is
   * what makes the void read as VOLUME: two structures at different
   * depths, separating as the camera descends. Interval = 4× the grid
   * (mirrored by --lattice-interval in tokens.css).
   */
  latticeScrollFactor: 0.94,
  latticeIntervalPx: 384,
} as const;

/* ----------------------------------------------------------------
   G1 SIGNAL BLEED — dormant terminal chatter between chambers
   ---------------------------------------------------------------- */
export const SIGNAL_BLEED = {
  /**
   * Opacity ceiling for the bleed layer at coefficient 1 (C4 vacuum).
   * Deliberately under the faintest fog peak: bleed is something you
   * FEEL in the void, never something you read. If it becomes
   * consciously noticeable, lower THIS, not the corridor coefficients.
   */
  maxOpacity: 0.07,
  /** Shader updates per second — dormant systems don't run at 60fps. */
  fps: 20,
  /** Render resolution factor — degraded signal should be cheap AND soft. */
  dpr: 0.6,
} as const;

/** Camera smoothing — Lenis lerp, the law (implementation-architecture §1). */
export const CAMERA_LERP = 0.1;

/* ----------------------------------------------------------------
   VIEWPORT DERIVATION (strata-spec §12)
   ---------------------------------------------------------------- */
export const MOBILE_BREAKPOINT_PX = 768;
/** Corridors shorten ~40% on mobile. Mirrored by --corridor-scale in tokens.css. */
export const MOBILE_CORRIDOR_SCALE = 0.6;
/** Fog veil peaks are capped at 25% on mobile (flat overlay). */
export const MOBILE_FOG_PEAK_CAP = 0.25;

export interface ViewportScrollMap {
  segments: readonly Segment[];
  isMobile: boolean;
}

/**
 * Derive the map for a viewport width. Pure: same input, same output.
 * Mobile: shorter corridors, capped fog, zero drift, unpinned Vault.
 */
export function forViewport(widthPx: number): ViewportScrollMap {
  const isMobile = widthPx < MOBILE_BREAKPOINT_PX;
  if (!isMobile) return { segments: SCROLL_MAP, isMobile };

  return {
    isMobile,
    segments: SCROLL_MAP.map((segment): Segment =>
      segment.kind === "corridor"
        ? {
            ...segment,
            length: segment.length * MOBILE_CORRIDOR_SCALE,
            fogPeak: Math.min(segment.fogPeak, MOBILE_FOG_PEAK_CAP),
          }
        : { ...segment, drift: 0, pin: undefined }
    ),
  };
}
