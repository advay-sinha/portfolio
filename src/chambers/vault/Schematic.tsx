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

/* Shared 5-stage pipeline grid: boxes 54×32 at y=74, x = 10/80/150/220/290
   (centers 37/107/177/247/317). Each system's real topology from its repo. */
const SCHEMATICS: Record<SchematicId, SchematicSpec> = {
  marp: {
    description:
      "Five-stage agent pipeline: planner, retriever over a pgvector store, writer, critic looping back to the writer, verifier before egress.",
    boxes: [
      { x: 10, y: 74, w: 54, h: 32, label: "plan" },
      { x: 80, y: 74, w: 54, h: 32, label: "retrieve" },
      { x: 150, y: 74, w: 54, h: 32, label: "write" },
      { x: 220, y: 74, w: 54, h: 32, label: "critic" },
      { x: 290, y: 74, w: 54, h: 32, label: "verify" },
      { x: 80, y: 130, w: 54, h: 26, label: "pgvector" },
    ],
    flows: [
      "M 4 90 H 10",
      "M 64 90 H 80",
      "M 134 90 H 150",
      "M 204 90 H 220",
      "M 274 90 H 290",
      "M 247 74 V 48 H 177 V 74", // critic → writer loop, until confident
      "M 344 90 H 356",
    ],
    taps: ["M 107 106 V 130"],
    ports: [
      [4, 90, "in"],
      [356, 90, "out"],
    ],
  },
  ats: {
    description:
      "Live market feed flows through quotes and the SMA strategy engine into signals and a simulated ledger; the copilot taps the strategy stage.",
    boxes: [
      { x: 10, y: 74, w: 54, h: 32, label: "feed" },
      { x: 80, y: 74, w: 54, h: 32, label: "quotes" },
      { x: 150, y: 74, w: 54, h: 32, label: "strategy" },
      { x: 220, y: 74, w: 54, h: 32, label: "signal" },
      { x: 290, y: 74, w: 54, h: 32, label: "ledger" },
      { x: 150, y: 130, w: 54, h: 26, label: "copilot" },
    ],
    flows: [
      "M 4 90 H 10",
      "M 64 90 H 80",
      "M 134 90 H 150",
      "M 204 90 H 220",
      "M 274 90 H 290",
      "M 344 90 H 356",
    ],
    taps: ["M 177 106 V 130"],
    ports: [
      [4, 90, "in"],
      [356, 90, "rec"],
    ],
  },
  floatchat: {
    description:
      "NetCDF archive converts offline to a Parquet cache; the query layer answers chat from cache, with an explicit fallback rung beneath it.",
    boxes: [
      { x: 10, y: 74, w: 54, h: 32, label: "netcdf" },
      { x: 80, y: 74, w: 54, h: 32, label: "convert" },
      { x: 150, y: 74, w: 54, h: 32, label: "parquet" },
      { x: 220, y: 74, w: 54, h: 32, label: "query" },
      { x: 290, y: 74, w: 54, h: 32, label: "chat" },
      { x: 220, y: 130, w: 54, h: 26, label: "fallback" },
    ],
    flows: [
      "M 4 90 H 10",
      "M 64 90 H 80",
      "M 134 90 H 150",
      "M 204 90 H 220",
      "M 274 90 H 290",
      "M 344 90 H 356",
    ],
    taps: ["M 247 106 V 130"],
    ports: [
      [4, 90, "in"],
      [356, 90, "out"],
    ],
  },
  mockai: {
    description:
      "React client with browser voice talks to the FastAPI service; Gemini generates and evaluates; sessions and results persist in MongoDB.",
    boxes: [
      { x: 10, y: 74, w: 54, h: 32, label: "client" },
      { x: 80, y: 74, w: 54, h: 32, label: "fastapi" },
      { x: 150, y: 74, w: 54, h: 32, label: "gemini" },
      { x: 220, y: 74, w: 54, h: 32, label: "evaluate" },
      { x: 290, y: 74, w: 54, h: 32, label: "mongo" },
      { x: 10, y: 130, w: 54, h: 26, label: "voice" },
    ],
    flows: [
      "M 4 90 H 10",
      "M 64 90 H 80",
      "M 134 90 H 150",
      "M 204 90 H 220",
      "M 274 90 H 290",
      "M 344 90 H 356",
    ],
    taps: ["M 37 106 V 130"],
    ports: [
      [4, 90, "in"],
      [356, 90, "rec"],
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
