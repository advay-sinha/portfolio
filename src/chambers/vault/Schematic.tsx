import type { SchematicId } from "@/content/systems";

/**
 * Schematic — facility blueprints (design-system §7: diagrams are
 * first-class content, styled as facility schematics).
 *
 * Inline SVG, deterministic geometry: every box, path, and label is
 * hand-authored data below — nothing generated, nothing random. Hairline
 * strokes, mono labels, one restrained accent: the dataflow path in
 * --nexus-glow at low opacity, with a CSS dash animation (the permitted
 * "data-stream detail" of the liveness budget).
 *
 * Behavior contract:
 * - The dash flow is pure CSS (stroke-dashoffset keyframe, linear) —
 *   no JS, no SVG filters, no path morphing.
 * - It runs only while the schematic's panel holds focus on the vault
 *   track (any ancestor with data-focused="false" pauses it) and
 *   freezes completely under reduced motion via --ambient-play-state.
 * - Bytes, not requests: inline render, no image fetch, crisp at any
 *   DPI, ~1KB each.
 */

interface SchematicBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

interface SchematicSpec {
  /** Accessible one-line description of the topology. */
  description: string;
  boxes: readonly SchematicBox[];
  /** Dataflow paths (SVG path data) — the animated accent. */
  flows: readonly string[];
  /** Static relation paths (dashed, no animation) — e.g. state taps. */
  taps?: readonly string[];
  /** Ingress/egress markers: [x, y, label]. */
  ports: readonly [number, number, string][];
}

const VIEW_W = 360;
const VIEW_H = 180;

const SCHEMATICS: Record<SchematicId, SchematicSpec> = {
  marp: {
    description:
      "Planner decomposes work into a task queue; three worker agents hold exclusive output slots; a single merge stage writes the record.",
    boxes: [
      { x: 16, y: 74, w: 56, h: 32, label: "planner" },
      { x: 100, y: 74, w: 52, h: 32, label: "queue" },
      { x: 184, y: 22, w: 52, h: 28, label: "agent" },
      { x: 184, y: 76, w: 52, h: 28, label: "agent" },
      { x: 184, y: 130, w: 52, h: 28, label: "agent" },
      { x: 268, y: 74, w: 52, h: 32, label: "merge" },
    ],
    flows: [
      "M 72 90 H 100",
      "M 152 90 L 184 36",
      "M 152 90 H 184",
      "M 152 90 L 184 144",
      "M 236 36 L 268 90",
      "M 236 90 H 268",
      "M 236 144 L 268 90",
      "M 320 90 H 348",
    ],
    taps: ["M 126 106 V 150 H 176"],
    ports: [
      [6, 90, "in"],
      [348, 90, "out"],
    ],
  },
  ats: {
    description:
      "Market feed normalizes into an event loop; strategy emits intents; every intent passes the risk gate before the append-only ledger.",
    boxes: [
      { x: 16, y: 74, w: 52, h: 32, label: "feed" },
      { x: 96, y: 74, w: 56, h: 32, label: "events" },
      { x: 180, y: 74, w: 60, h: 32, label: "strategy" },
      { x: 268, y: 22, w: 52, h: 28, label: "risk" },
      { x: 268, y: 120, w: 52, h: 32, label: "ledger" },
    ],
    flows: [
      "M 68 90 H 96",
      "M 152 90 H 180",
      "M 240 90 L 268 36",
      "M 294 50 V 120",
    ],
    taps: ["M 268 136 H 210 V 106"],
    ports: [
      [6, 90, "in"],
      [330, 152, "rec"],
    ],
  },
  srb: {
    description:
      "Audio stream passes voice-activity detection, chunks queue to inference workers, results reassemble in order before egress.",
    boxes: [
      { x: 16, y: 74, w: 48, h: 32, label: "vad" },
      { x: 92, y: 74, w: 52, h: 32, label: "queue" },
      { x: 172, y: 46, w: 56, h: 28, label: "infer" },
      { x: 172, y: 104, w: 56, h: 28, label: "infer" },
      { x: 256, y: 74, w: 60, h: 32, label: "reorder" },
    ],
    flows: [
      "M 64 90 H 92",
      "M 144 90 L 172 60",
      "M 144 90 L 172 118",
      "M 228 60 L 256 90",
      "M 228 118 L 256 90",
      "M 316 90 H 348",
    ],
    taps: ["M 118 106 V 150 H 280 V 106"],
    ports: [
      [6, 90, "in"],
      [348, 90, "out"],
    ],
  },
};

export interface SchematicProps {
  id: SchematicId;
  className?: string;
}

export function Schematic({ id, className }: SchematicProps) {
  const spec = SCHEMATICS[id];

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={spec.description}
      className={className}
    >
      {/* Static state taps — hairline, dashed, no animation. */}
      {spec.taps?.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="var(--nexus-hairline)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ))}

      {/* Dataflow — the one accent. Dashes drift only while the panel
          holds focus; frozen entirely under reduced motion. */}
      {spec.flows.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="var(--nexus-glow)"
          strokeOpacity="0.4"
          strokeWidth="1"
          strokeDasharray="6 4"
          className="animate-[nexus-dataflow_2.4s_var(--ease-linear)_infinite] [animation-play-state:var(--ambient-play-state)] [[data-focused=false]_&]:[animation-play-state:paused]"
        />
      ))}

      {spec.boxes.map((box) => (
        <g key={`${box.x}-${box.y}`}>
          <rect
            x={box.x}
            y={box.y}
            width={box.w}
            height={box.h}
            fill="var(--nexus-panel)"
            stroke="var(--nexus-hairline)"
            strokeWidth="1"
            rx="2"
          />
          <text
            x={box.x + box.w / 2}
            y={box.y + box.h / 2 + 3}
            textAnchor="middle"
            fill="var(--nexus-muted)"
            fontSize="9"
            letterSpacing="0.08em"
            style={{ fontFamily: "var(--font-machine)" }}
          >
            {box.label.toUpperCase()}
          </text>
        </g>
      ))}

      {/* Ingress / egress ports — labeled, per blueprint convention. */}
      {spec.ports.map(([x, y, label]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="2.5" fill="var(--nexus-muted)" />
          <text
            x={x}
            y={y - 8}
            textAnchor="middle"
            fill="var(--nexus-muted)"
            fontSize="8"
            letterSpacing="0.08em"
            style={{ fontFamily: "var(--font-machine)" }}
          >
            {label.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}
