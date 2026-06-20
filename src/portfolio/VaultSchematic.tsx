/**
 * Per-system blueprint schematic — a five-stage pipeline with one
 * highlighted terminal stage, a branch box, an optional feedback loop,
 * and a traveling signal dot. Pure SVG; the dot freezes under reduced
 * motion (SMIL is stripped at the Portfolio root).
 */

export interface SchematicSpec {
  /** Five stage labels, left to right. */
  stages: [string, string, string, string, string];
  /** Index (0-4) of the violet-highlighted stage. */
  accentIndex: number;
  /** A pink branch box hung beneath one stage. */
  branch: { under: number; label: string };
  /** Optional feedback loop arc between two stage indices. */
  loop?: { from: number; to: number };
  /** Right endpoint label (OUT / REC …). */
  out: string;
  /** Traveling-dot period in seconds. */
  dur: number;
}

const centerX = (i: number) => 37 + i * 70;
const boxX = (i: number) => 10 + i * 70;

export function VaultSchematic({ spec }: { spec: SchematicSpec }) {
  return (
    <svg
      viewBox="0 0 360 180"
      style={{
        width: "100%",
        maxWidth: 460,
        height: "auto",
        display: "block",
        margin: "0 auto",
        overflow: "visible",
        fontFamily: "var(--mono)",
      }}
    >
      {/* dashed inter-stage connectors */}
      <g
        fill="none"
        stroke="var(--glow)"
        strokeOpacity=".6"
        strokeWidth="1"
        strokeDasharray="5 4"
        style={{ animation: "np-dataFlow 6s linear infinite" }}
      >
        <path d="M4 90 H10" />
        <path d="M64 90 H80" />
        <path d="M134 90 H150" />
        <path d="M204 90 H220" />
        <path d="M274 90 H290" />
        <path d="M344 90 H356" />
      </g>

      {/* branch connector */}
      <path
        d={`M${centerX(spec.branch.under)} 106 V130`}
        fill="none"
        stroke="var(--hair-strong)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      {/* optional feedback loop */}
      {spec.loop && (
        <>
          <path
            d={`M${centerX(spec.loop.from)} 74 V48 H${centerX(spec.loop.to)} V74`}
            fill="none"
            stroke="var(--hot)"
            strokeOpacity=".6"
            strokeWidth="1"
            strokeDasharray="5 4"
            style={{ animation: "np-dataFlow 5s linear infinite" }}
          />
          <text
            x={(centerX(spec.loop.from) + centerX(spec.loop.to)) / 2}
            y="44"
            textAnchor="middle"
            fill="var(--hot)"
            fontSize="8"
            letterSpacing=".08em"
          >
            loop ↺
          </text>
        </>
      )}

      {/* stage boxes */}
      <g fontSize="9" letterSpacing=".06em">
        {spec.stages.map((label, i) => {
          const accent = i === spec.accentIndex;
          return (
            <g key={label + i}>
              <rect
                x={boxX(i)}
                y="74"
                width="54"
                height="32"
                rx="2"
                fill={accent ? "rgba(124,92,255,.16)" : "rgba(13,19,35,.85)"}
                stroke={accent ? "rgba(124,92,255,.55)" : "rgba(79,209,255,.4)"}
              />
              <text
                x={centerX(i)}
                y="93"
                textAnchor="middle"
                fill={accent ? "#C7BFFF" : "var(--muted)"}
              >
                {label}
              </text>
            </g>
          );
        })}
        {/* branch box */}
        <g>
          <rect
            x={boxX(spec.branch.under)}
            y="130"
            width="54"
            height="26"
            rx="2"
            fill="rgba(255,73,192,.12)"
            stroke="rgba(255,73,192,.4)"
          />
          <text
            x={centerX(spec.branch.under)}
            y="147"
            textAnchor="middle"
            fill="#FFA8DE"
          >
            {spec.branch.label}
          </text>
        </g>
      </g>

      {/* endpoints */}
      <g fontSize="8" letterSpacing=".08em">
        <circle cx="4" cy="90" r="2.5" fill="var(--glow)" />
        <text x="4" y="80" textAnchor="middle" fill="var(--dim)">
          IN
        </text>
        <circle cx="356" cy="90" r="2.5" fill="var(--hot)" />
        <text x="356" y="80" textAnchor="middle" fill="var(--dim)">
          {spec.out}
        </text>
      </g>

      {/* traveling signal */}
      <circle r="2.6" fill="var(--glow)" style={{ filter: "drop-shadow(0 0 5px var(--glow))" }}>
        <animateMotion
          dur={`${spec.dur}s`}
          repeatCount="indefinite"
          keyPoints="0;1"
          keyTimes="0;1"
          path="M4 90 H356"
        />
      </circle>
    </svg>
  );
}
