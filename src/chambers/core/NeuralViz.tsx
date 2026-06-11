"use client";

import { useEffect, useRef } from "react";

/**
 * NeuralViz — the Neural Core's signature interaction island
 * (homepage-experience §4.1; interaction-principles §4 hover grammar).
 *
 * A hand-authored orchestration topology — ingress → router → three
 * worker agents → aggregator → egress, with memory and observability
 * taps. It is the engineer's actual working shape (multi-agent
 * coordination), not a decorative neural mesh: every node implies a
 * function (spatial-language §6). Deterministic coordinates — no
 * randomness, no hydration drift, nothing "generated" per visit.
 *
 * Interaction — "light notices you," taught silently:
 * nodes within ~140px of the pointer brighten softly; edges touching a
 * brightened node gain slight opacity; everything else dims a step
 * while the pointer is inside. No tooltip, no explanation, fully
 * reversible, sub-attention by tuning: peak deltas are small enough
 * that the response reads as the diagram noticing, not reacting.
 *
 * Restraint reasoning: 11 nodes, 12 edges — enough to read as a
 * topology, few enough to never read as node spam. No motion at rest
 * beyond nothing at all: the viz is still until approached. The
 * smoothstep falloff + a 120ms opacity transition make brightening
 * gradual; there is no scale, no glow bloom, no ripple.
 *
 * Performance reasoning:
 * - Two listeners (pointermove/pointerleave) on the SVG only, passive,
 *   rAF-coalesced: at most one style pass per frame regardless of
 *   event rate.
 * - All writes are element.style.opacity through refs — React renders
 *   exactly once; zero state, zero re-renders, zero layout reads in
 *   the hot path (the bounding rect is read once per frame, on an SVG
 *   that never changes size mid-hover).
 * - Mobile/touch degradation: no fine pointer → no listeners at all.
 *   The static diagram IS the designed degradation, not a disabled
 *   feature. Reduced motion needs no branch: proximity response is
 *   pointer feedback (instant-class), and the 120ms transition
 *   collapses with the duration tokens.
 *
 * SVG over canvas/WebGL: ~1KB of markup, crisp at any DPI, styleable
 * by tokens, zero GPU context, zero per-frame cost at rest.
 */

const VIEW_W = 420;
const VIEW_H = 320;
/** Proximity radius in px (screen space). */
const RADIUS = 140;
/** Resting opacities — muted presence, L1.5 backdrop. */
const NODE_BASE = 0.45;
const EDGE_BASE = 0.3;
/** While the pointer is inside, distant elements sit slightly lower. */
const DIM_FACTOR = 0.7;

interface VizNode {
  x: number;
  y: number;
  /** Coordination points render in --nexus-signal (violet leads the Core). */
  hub?: boolean;
}

/* ingress(0) router(1) memory(2) agents(3,4,5) aggregator(6)
   egress(7) observability(8) taps(9,10) */
const NODES: readonly VizNode[] = [
  { x: 36, y: 168 },
  { x: 128, y: 168, hub: true },
  { x: 128, y: 64 },
  { x: 236, y: 84 },
  { x: 248, y: 168 },
  { x: 236, y: 252 },
  { x: 330, y: 168, hub: true },
  { x: 396, y: 168 },
  { x: 330, y: 272 },
  { x: 36, y: 252 },
  { x: 396, y: 64 },
];

const EDGES: readonly [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [1, 5],
  [3, 6],
  [4, 6],
  [5, 6],
  [6, 7],
  [6, 8],
  [9, 1],
  [2, 10],
];

const smoothstep = (t: number) => t * t * (3 - 2 * t);

export function NeuralViz() {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<Array<SVGCircleElement | null>>([]);
  const edgeRefs = useRef<Array<SVGLineElement | null>>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    // Touch-class devices get the static diagram — designed, not disabled.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const nodeEls = nodeRefs.current.slice();
    const edgeEls = edgeRefs.current.slice();

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let inside = false;

    const apply = () => {
      frame = 0;
      const rect = svg.getBoundingClientRect();
      const scaleX = VIEW_W / rect.width;
      const scaleY = VIEW_H / rect.height;
      const px = (pointerX - rect.left) * scaleX;
      const py = (pointerY - rect.top) * scaleY;
      // RADIUS is screen-space; convert once to viewBox units.
      const radius = RADIUS * scaleX;

      const heat = NODES.map((node) => {
        if (!inside) return 0;
        const d = Math.hypot(node.x - px, node.y - py);
        return smoothstep(Math.max(0, 1 - d / radius));
      });

      NODES.forEach((_, i) => {
        const el = nodeEls[i];
        if (!el) return;
        const rest = inside ? NODE_BASE * DIM_FACTOR : NODE_BASE;
        el.style.opacity = String(rest + (1 - rest) * heat[i]);
      });

      EDGES.forEach(([a, b], i) => {
        const el = edgeEls[i];
        if (!el) return;
        const t = Math.max(heat[a], heat[b]) * 0.8;
        const rest = inside ? EDGE_BASE * DIM_FACTOR : EDGE_BASE;
        el.style.opacity = String(rest + (0.75 - rest) * t);
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      inside = true;
      schedule();
    };
    const onLeave = () => {
      inside = false;
      schedule();
    };

    svg.addEventListener("pointermove", onMove, { passive: true });
    svg.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerleave", onLeave);
      nodeEls.forEach((el) => el?.style.removeProperty("opacity"));
      edgeEls.forEach((el) => el?.style.removeProperty("opacity"));
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label="Agent orchestration topology: requests route through a coordinator to three agents, converge at an aggregator, and exit with memory and observability taps."
      className="h-auto w-full"
    >
      {EDGES.map(([a, b], i) => (
        <line
          key={`${a}-${b}`}
          ref={(el) => {
            edgeRefs.current[i] = el;
          }}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="var(--nexus-muted)"
          strokeWidth="1"
          opacity={EDGE_BASE}
          className="transition-opacity duration-(--motion-instant) ease-(--ease-out-facility)"
        />
      ))}
      {NODES.map((node, i) => (
        <circle
          key={`${node.x}-${node.y}`}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
          cx={node.x}
          cy={node.y}
          r={node.hub ? 4 : 3}
          fill={node.hub ? "var(--nexus-signal)" : "var(--nexus-muted)"}
          opacity={NODE_BASE}
          className="transition-opacity duration-(--motion-instant) ease-(--ease-out-facility)"
        />
      ))}
    </svg>
  );
}
