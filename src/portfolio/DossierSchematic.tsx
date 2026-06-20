import type { SchematicId } from "@/content/systems";

/**
 * Sealed-archive schematic — a wide left-to-right pipeline with arrowed
 * connectors, a violet terminal stage, an infrastructure sub-label, and
 * one traveling signal dot. One per dossier page, keyed by schematicId.
 * Distinct from the home vault's compact blueprint cards.
 */

const BOX = "rgba(13,19,35,.7)";
const STROKE = "rgba(79,209,255,.4)";
const ACCENT_FILL = "rgba(124,92,255,.14)";
const ACCENT_STROKE = "rgba(124,92,255,.5)";

interface Box {
  x: number;
  w: number;
  label: string;
  accent?: boolean;
}

interface Spec {
  boxes: Box[];
  /** mono sub-label under the second box. */
  sub: string;
  /** optional feedback loop (marp). */
  loop?: boolean;
  /** flowX period in seconds. */
  dur: number;
}

const SPECS: Record<SchematicId, Spec> = {
  marp: {
    boxes: [
      { x: 2, w: 112, label: "PLANNER" },
      { x: 150, w: 116, label: "RETRIEVER" },
      { x: 302, w: 108, label: "WRITER" },
      { x: 446, w: 108, label: "CRITIC" },
      { x: 590, w: 128, label: "VERIFIER", accent: true },
    ],
    sub: "postgres · pgvector",
    loop: true,
    dur: 5,
  },
  ats: {
    boxes: [
      { x: 2, w: 128, label: "YAHOO FEED" },
      { x: 176, w: 112, label: "FASTAPI" },
      { x: 334, w: 140, label: "SMA STRATEGY" },
      { x: 520, w: 198, label: "SIM PORTFOLIO", accent: true },
    ],
    sub: "mongodb · openai copilot",
    dur: 5.4,
  },
  floatchat: {
    boxes: [
      { x: 2, w: 108, label: "NetCDF" },
      { x: 150, w: 140, label: "PARQUET CACHE" },
      { x: 330, w: 140, label: "QUERY PARSER" },
      { x: 516, w: 202, label: "VIZ · CHAT", accent: true },
    ],
    sub: "offline-first · ollama fallback",
    dur: 5.8,
  },
  mockai: {
    boxes: [
      { x: 2, w: 140, label: "REACT CLIENT" },
      { x: 188, w: 112, label: "FASTAPI" },
      { x: 346, w: 160, label: "GEMINI 2.0", accent: true },
      { x: 552, w: 166, label: "VOICE I/O" },
    ],
    sub: "mongodb · jwt sessions",
    dur: 5.2,
  },
};

export function DossierSchematic({ id }: { id: SchematicId }) {
  const spec = SPECS[id];
  const marker = `dm-${id}`;
  const cy = 46;
  const boxCy = 30;
  const boxH = 32;

  return (
    <svg viewBox="0 0 720 92" style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <marker
          id={marker}
          markerWidth="7"
          markerHeight="7"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6" fill="none" stroke="rgba(79,209,255,.6)" strokeWidth="1" />
        </marker>
      </defs>

      <g fontFamily="var(--mono)" fontSize="10">
        {spec.boxes.map((b) => (
          <g key={b.label}>
            <rect
              x={b.x}
              y={boxCy}
              width={b.w}
              height={boxH}
              fill={b.accent ? ACCENT_FILL : BOX}
              stroke={b.accent ? ACCENT_STROKE : STROKE}
            />
            <text x={b.x + b.w / 2} y="50" fill={b.accent ? "#C7BFFF" : "#94A3B8"} textAnchor="middle">
              {b.label}
            </text>
          </g>
        ))}
        <text
          x={spec.boxes[1].x + spec.boxes[1].w / 2}
          y="84"
          fill="#5A6B85"
          textAnchor="middle"
          fontSize="8.5"
        >
          {spec.sub}
        </text>
      </g>

      {/* connectors */}
      <g stroke="rgba(79,209,255,.5)" strokeWidth="1" markerEnd={`url(#${marker})`}>
        {spec.boxes.slice(0, -1).map((b, i) => {
          const next = spec.boxes[i + 1];
          return <line key={i} x1={b.x + b.w} y1={cy} x2={next.x - 2} y2={cy} />;
        })}
      </g>

      {/* feedback loop (marp): Critic → Writer */}
      {spec.loop && (
        <>
          <path
            d="M500,30 C500,8 356,8 356,28"
            fill="none"
            stroke="rgba(255,73,192,.5)"
            strokeWidth="1"
            strokeDasharray="3 3"
            markerEnd={`url(#${marker})`}
          />
          <text x="428" y="6" fill="#FF49C0" textAnchor="middle" fontFamily="var(--mono)" fontSize="8">
            loop ↺
          </text>
        </>
      )}

      {/* traveling signal */}
      <circle
        r="3"
        cy={cy}
        fill="var(--glow)"
        style={{
          filter: "drop-shadow(0 0 4px var(--glow))",
          animation: `np-flowX ${spec.dur}s linear infinite`,
        }}
      />
    </svg>
  );
}
