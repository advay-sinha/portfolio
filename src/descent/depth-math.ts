/**
 * depth-math.ts — pure functions: scroll position → depth state
 * (implementation-architecture §4.1; strata-spec §4, §5, §9).
 *
 * No DOM, no GSAP, no React. Every function is deterministic over
 * (resolved map, scroll position in vh) and unit-testable against the
 * strata-spec tables. The runtime (DescentProvider) only ever *applies*
 * what these functions return — it never computes depth itself, so the
 * spec and the behavior cannot drift independently.
 *
 * Invariants (hold for every scroll position s in [0, totalVh]):
 * 1. ≤ 2 strata are non-dormant/non-silhouette at once (departing +
 *    approaching/focus). With the future proxy that is the ≤3-plane law.
 * 2. ≤ 1 stratum has blurPx > 0, and only on the "full" tier, and only
 *    during approach — the page-wide single-live-filter budget.
 * 3. Every returned value is a continuous function of s within a phase;
 *    discontinuities exist only at phase boundaries where the affected
 *    plane is invisible (opacity 0) — no visible pops.
 * 4. |driftX| ≤ 0.02 (drift law) — guaranteed because drift comes from
 *    the map, which encodes the ceiling.
 * 5. fog is 0 inside every focus band and peaks mid-corridor.
 * 6. The math is monotonic in s per phase: scrolling back replays camera
 *    state exactly (phases are bidirectional camera state, strata-spec §16).
 *
 * Restraint notes: all interpolation is linear within a phase (the
 * camera is heavy — strata-spec §7); the only shaping is a cubic
 * ease-out on lateral drift, approximating --ease-out-facility so the
 * weave settles before the threshold beat (~99% settled at 80% of the
 * corridor). No springs, no overshoot, no fake-3D projection math —
 * depth is scale + opacity + (rationed) blur, nothing else.
 */

import type { MotionTier } from "./capability";
import {
  PHASE_GEOMETRY,
  type Segment,
  type StratumId,
} from "./scroll-map";

/** Lifecycle phases of a stratum (strata-spec §4). Camera state — replays freely in both directions. */
export type StratumPhase =
  | "dormant"
  | "silhouette"
  | "approach"
  | "focus"
  | "departure";

/** Everything the runtime needs to render one plane at one scroll position. */
export interface PhaseState {
  phase: StratumPhase;
  scale: number;
  opacity: number;
  /** Live blur radius. > 0 only during approach on the full tier. */
  blurPx: number;
  /** Lateral drift as a signed fraction of viewport width. */
  driftX: number;
}

/* ----------------------------------------------------------------
   MAP RESOLUTION — cumulative bounds computed once, read every frame
   ---------------------------------------------------------------- */

export interface ResolvedSegment {
  segment: Segment;
  /** Inclusive start, vh. */
  start: number;
  /** Exclusive end (== next start), vh. */
  end: number;
}

export interface ResolvedMap {
  segments: readonly ResolvedSegment[];
  totalVh: number;
  /** StratumId → index into `segments`. */
  byStratum: ReadonlyMap<StratumId, number>;
}

export function resolveScrollMap(segments: readonly Segment[]): ResolvedMap {
  const resolved: ResolvedSegment[] = [];
  const byStratum = new Map<StratumId, number>();
  let cursor = 0;

  for (const segment of segments) {
    if (segment.kind === "focus") byStratum.set(segment.id, resolved.length);
    resolved.push({ segment, start: cursor, end: cursor + segment.length });
    cursor += segment.length;
  }

  return { segments: resolved, totalVh: cursor, byStratum };
}

/** Measured document position of one stratum plane, in vh. */
export interface StratumBounds {
  start: number;
  end: number;
}

/**
 * Resolve the map against the REAL document instead of the declared
 * lengths. The declared map is the design intent; the rendered document
 * can drift from it (pin spacing inserted by ScrollTrigger, stacked
 * mobile content exceeding a min-height, font metrics). Phase math that
 * trusts declared lengths while the camera reads real scroll desyncs
 * every stratum below the first divergence — so the runtime measures
 * plane offsets and corridors stretch to fill the true gaps.
 *
 * Pure over its inputs: segments + measured bounds in vh. Focus
 * segments take their measured bounds when available (declared length
 * as fallback); each corridor runs from the previous segment's end to
 * the next focus segment's measured start.
 */
export function resolveMeasuredMap(
  segments: readonly Segment[],
  bounds: ReadonlyMap<StratumId, StratumBounds>
): ResolvedMap {
  const resolved: ResolvedSegment[] = [];
  const byStratum = new Map<StratumId, number>();
  let cursor = 0;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (segment.kind === "focus") {
      const measured = bounds.get(segment.id);
      const start = measured !== undefined ? Math.max(measured.start, cursor) : cursor;
      const end =
        measured !== undefined
          ? Math.max(measured.end, start)
          : start + segment.length;
      byStratum.set(segment.id, resolved.length);
      resolved.push({ segment, start, end });
      cursor = end;
    } else {
      const next = segments[i + 1];
      const nextStart =
        next?.kind === "focus" ? bounds.get(next.id)?.start : undefined;
      const end =
        nextStart !== undefined
          ? Math.max(nextStart, cursor)
          : cursor + segment.length;
      resolved.push({ segment, start: cursor, end });
      cursor = end;
    }
  }

  return { segments: resolved, totalVh: cursor, byStratum };
}

/* ----------------------------------------------------------------
   HELPERS — small, named, no magic
   ---------------------------------------------------------------- */

const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value;

const lerp = (from: number, to: number, t: number): number =>
  from + (to - from) * t;

/** Normalized position of s within [start, end], clamped to [0, 1]. */
const progress = (s: number, start: number, end: number): number =>
  end <= start ? 1 : clamp((s - start) / (end - start), 0, 1);

/** Decisive start, soft landing — the math twin of --ease-out-facility. */
const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

/** 13 segments: linear scan beats any index structure. */
function segmentAt(map: ResolvedMap, s: number): ResolvedSegment {
  const clamped = clamp(s, 0, map.totalVh);
  for (const rs of map.segments) {
    if (clamped < rs.end) return rs;
  }
  return map.segments[map.segments.length - 1];
}

const G = PHASE_GEOMETRY;

const STATIC_FOCUS: PhaseState = {
  phase: "focus",
  scale: 1,
  opacity: 1,
  blurPx: 0,
  driftX: 0,
};

const DORMANT: PhaseState = {
  phase: "dormant",
  scale: 1,
  opacity: 0,
  blurPx: 0,
  driftX: 0,
};

/**
 * Silhouette: the real plane contributes nothing — the (future) proxy
 * renders the distant view (strata-spec §4.1). Scale is pre-positioned
 * at the approach start value so unhiding is continuous.
 */
const SILHOUETTE: PhaseState = {
  phase: "silhouette",
  scale: G.approachScaleFrom,
  opacity: 0,
  blurPx: 0,
  driftX: 0,
};

/* ----------------------------------------------------------------
   SCROLL → PHASE (strata-spec §4 + §9 phase boundaries)
   ---------------------------------------------------------------- */

export function phaseAt(
  map: ResolvedMap,
  s: number,
  id: StratumId,
  tier: MotionTier
): PhaseState {
  // Static tier IS the server-rendered document: every plane settled.
  if (tier === "static") return STATIC_FOCUS;

  const index = map.byStratum.get(id);
  if (index === undefined) return STATIC_FOCUS; // unmapped plane: fail soft, fail sharp

  const focus = map.segments[index];
  const f = focus.segment as Extract<Segment, { kind: "focus" }>;
  const pos = clamp(s, 0, map.totalVh);

  // Focus band: settled, sharp, interactive. Micro z-creep only.
  if (pos >= focus.start && pos < focus.end) {
    const p = progress(pos, focus.start, focus.end);
    return {
      phase: "focus",
      scale: 1 + G.focusMicroScale * p,
      opacity: 1,
      blurPx: 0,
      driftX: f.drift,
    };
  }

  // Departure: first 60% of the following corridor. Fade + scale only —
  // never blur behind the camera (forward-attention law).
  const after = map.segments[index + 1];
  if (after?.segment.kind === "corridor" && pos >= after.start && pos < after.end) {
    const q = progress(pos, after.start, after.end);
    if (q < G.departurePortion) {
      const t = q / G.departurePortion;
      return {
        phase: "departure",
        scale: lerp(1, f.departureScaleTo ?? G.departureScaleTo, t),
        opacity: 1 - t,
        blurPx: 0,
        driftX: f.drift * (1 - t),
      };
    }
    return DORMANT;
  }

  const before = map.segments[index - 1];
  if (before?.segment.kind === "corridor") {
    // Approach: final 80% of the preceding corridor. The page's only
    // live filter ramps 4px → 0 here (full tier only).
    if (pos >= before.start && pos < focus.start) {
      const q = progress(pos, before.start, before.end);
      const approachStart = 1 - G.approachPortion;
      if (q >= approachStart) {
        const t = (q - approachStart) / G.approachPortion;
        return {
          phase: "approach",
          scale: lerp(
            tier === "full" ? G.approachScaleFrom : G.approachScaleFromNoBlur,
            1,
            t
          ),
          opacity: lerp(G.approachOpacityFrom, 1, t),
          blurPx: tier === "full" ? G.blurMaxPx * (1 - t) : 0,
          driftX: f.drift * easeOutCubic(t),
        };
      }
      return SILHOUETTE; // proxy-swap zone (first 20%)
    }

    // Visibility horizon: silhouette while the camera is in the
    // preceding chamber's final 50vh (strata-spec §4). Never two rooms ahead.
    const prevFocus = map.segments[index - 2];
    if (
      prevFocus !== undefined &&
      pos >= prevFocus.end - G.horizonVh &&
      pos < before.start
    ) {
      return SILHOUETTE;
    }
  }

  return DORMANT;
}

/* ----------------------------------------------------------------
   SCROLL → FOG (strata-spec §5)
   ---------------------------------------------------------------- */

/**
 * Fog veil opacity: 0 inside focus bands, half-sine through corridors
 * peaking at the corridor's fogPeak at mid-transit. A half-sine is the
 * gentlest curve with zero-slope endpoints — fog condenses and thins,
 * it never snaps. Pure function of scroll: fog never animates on its own.
 */
export function fogAt(map: ResolvedMap, s: number): number {
  const rs = segmentAt(map, s);
  if (rs.segment.kind !== "corridor" || rs.segment.fogPeak === 0) return 0;
  const p = progress(clamp(s, 0, map.totalVh), rs.start, rs.end);
  return rs.segment.fogPeak * Math.sin(Math.PI * p);
}

/* ----------------------------------------------------------------
   SCROLL → SIGNAL BLEED (G1 — machine memory between chambers)
   ---------------------------------------------------------------- */

/**
 * Signal-bleed intensity 0–1: zero inside every focus band (content
 * never shares the viewport with it at strength), half-sine through
 * corridors that declare a bleed coefficient — same zero-slope curve
 * as fog and grid, so all three environmental channels condense and
 * thin together. The engine multiplies by SIGNAL_BLEED.maxOpacity.
 */
export function bleedAt(map: ResolvedMap, s: number): number {
  const rs = segmentAt(map, s);
  if (rs.segment.kind !== "corridor") return 0;
  const coefficient = rs.segment.bleed ?? 0;
  if (coefficient === 0) return 0;
  const p = progress(clamp(s, 0, map.totalVh), rs.start, rs.end);
  return coefficient * Math.sin(Math.PI * p);
}

/* ----------------------------------------------------------------
   SCROLL → GRID DENSITY (strata-spec §10: C1 densification, C4 strip-down)
   ---------------------------------------------------------------- */

/**
 * G0 grid strength: 1 inside focus bands, half-sine toward each
 * corridor's `grid` value at mid-transit — the same curve as fog, so
 * structure and atmosphere condense together and nothing ever steps.
 * Corridors with grid 1 are flat; the vacuum transit (grid < 1)
 * empties the void instead of filling it.
 */
export function gridAt(map: ResolvedMap, s: number): number {
  const rs = segmentAt(map, s);
  if (rs.segment.kind !== "corridor" || rs.segment.grid === 1) return 1;
  const p = progress(clamp(s, 0, map.totalVh), rs.start, rs.end);
  return 1 + (rs.segment.grid - 1) * Math.sin(Math.PI * p);
}

/* ----------------------------------------------------------------
   SCROLL → DRIFT (strata-spec §3.1)
   ---------------------------------------------------------------- */

/** Lateral drift for one stratum — the weave component of phaseAt, exposed for testing/consumers. */
export function driftAt(map: ResolvedMap, s: number, id: StratumId): number {
  return phaseAt(map, s, id, "full").driftX;
}

/* ----------------------------------------------------------------
   SCROLL → ORIENTATION
   ---------------------------------------------------------------- */

/**
 * The stratum the camera currently belongs to. Inside a corridor the
 * first half still belongs to the departing stratum, the second half
 * to the approaching one — matching where attention actually is.
 * Drives the nav rail's active state once the provider feeds it.
 */
export function stratumAt(map: ResolvedMap, s: number): StratumId {
  const rs = segmentAt(map, s);
  if (rs.segment.kind === "focus") return rs.segment.id;

  const index = map.segments.indexOf(rs);
  const p = progress(clamp(s, 0, map.totalVh), rs.start, rs.end);
  const neighbor = map.segments[p < 0.5 ? index - 1 : index + 1];
  if (neighbor?.segment.kind === "focus") return neighbor.segment.id;

  // Corridors are always flanked by strata; satisfy the type system honestly.
  const first = map.segments.find((seg) => seg.segment.kind === "focus");
  return (first?.segment as Extract<Segment, { kind: "focus" }>).id;
}

/**
 * Visibility horizon (strata-spec §4): which stratum, if any, should
 * exist ahead as a silhouette — and therefore which chamber's heavy
 * assets may begin loading (the loading strategy IS the rendering
 * strategy, implementation-architecture §13). Returns the next stratum
 * while the camera is inside a corridor or a focus band's final 50vh.
 */
export function horizonAt(map: ResolvedMap, s: number): StratumId | null {
  const rs = segmentAt(map, s);
  const index = map.segments.indexOf(rs);

  if (rs.segment.kind === "corridor") {
    const next = map.segments[index + 1];
    return next?.segment.kind === "focus" ? next.segment.id : null;
  }

  if (clamp(s, 0, map.totalVh) >= rs.end - G.horizonVh) {
    const next = map.segments[index + 2];
    return next?.segment.kind === "focus" ? next.segment.id : null;
  }

  return null;
}
