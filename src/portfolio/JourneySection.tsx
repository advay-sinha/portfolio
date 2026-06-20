import { JOURNEY, JOURNEY_SPAN, type JourneyType } from "@/content/journey";

/**
 * DEPTH.03 — JOURNEY. The operations ledger from content/journey.ts,
 * oldest first. Emphasis is typographic (high-weight records take full
 * text + a glowing node); type is a single chromatic tag.
 */

const TYPE_COLOR: Record<JourneyType, string> = {
  education: "#4FD1FF",
  experience: "#FF49C0",
  competition: "#FBBF24",
  leadership: "#7C5CFF",
};

export function JourneySection() {
  return (
    <section id="logs" className="np-sec">
      <div className="np-depth">
        <span className="lead">DEPTH.03</span>
        <span className="rule" />
        <span>JOURNEY</span>
        <span className="meta">{JOURNEY_SPAN.toUpperCase()} · OPERATIONS LEDGER</span>
      </div>
      <h2 className="np-h2" style={{ textShadow: "0 0 28px rgba(124,92,255,.2)" }}>
        Journey
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {JOURNEY.map((e) => {
          const color = TYPE_COLOR[e.type];
          const high = e.weight === "high";
          return (
            <div
              key={e.id}
              data-rise
              style={{
                display: "grid",
                gridTemplateColumns: "130px 1fr",
                gap: "clamp(14px,2.4vw,28px)",
              }}
            >
              <div
                style={{
                  textAlign: "right",
                  paddingTop: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  alignItems: "flex-end",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 12,
                    color: "var(--text)",
                    letterSpacing: ".04em",
                  }}
                >
                  {e.span}
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 9,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color,
                    border: "1px solid currentColor",
                    padding: "2px 7px",
                    opacity: 0.85,
                  }}
                >
                  {e.type}
                </span>
              </div>
              <div
                style={{
                  position: "relative",
                  borderLeft: "1px solid var(--hair)",
                  padding: "0 0 38px 28px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: -6,
                    top: 5,
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: color,
                    border: "2px solid #04060f",
                    boxShadow: high ? `0 0 10px ${color}` : "none",
                  }}
                />
                <h3
                  className="np-j-title"
                  style={{
                    fontFamily: "var(--grotesk)",
                    fontWeight: 500,
                    fontSize: "clamp(17px,2vw,22px)",
                    color: high ? "#F3F4F6" : "#C3CCDA",
                    lineHeight: 1.2,
                  }}
                >
                  {e.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    letterSpacing: ".08em",
                    color: "var(--glow)",
                    marginTop: 4,
                  }}
                >
                  {e.org}
                </p>
                {e.summary && (
                  <p
                    className="np-j-summary"
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.6,
                      color: "var(--muted)",
                      marginTop: 9,
                      maxWidth: "64ch",
                    }}
                  >
                    {e.summary}
                  </p>
                )}
                {e.outcome && (
                  <p
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      letterSpacing: ".05em",
                      color: "var(--dim)",
                      marginTop: 8,
                    }}
                  >
                    ▸ {e.outcome}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
