import { CERTIFICATIONS, PROVIDER_COUNT } from "@/content/certifications";

/**
 * DEPTH.04 — CERTS. The credential archive from
 * content/certifications.ts, newest first. Counts derive from the
 * array. Each card links to its real PDF under /public.
 *
 * Ported from Portfolio.dc.html: the records live inside a bounded
 * archive window — its own scroll context with top/bottom fade masks —
 * rather than flowing down the page. Each card reads issued · provider ·
 * domain over title · view ↗.
 */

export function CertsSection() {
  return (
    <section id="live" className="np-sec">
      <div className="np-depth">
        <span className="lead">DEPTH.04</span>
        <span className="rule" />
        <span>CERTS</span>
        <span className="meta">
          {CERTIFICATIONS.length} RECORDS · {PROVIDER_COUNT} ISSUERS · EACH LINKS TO ITS PDF
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <h2 className="np-h2" style={{ textShadow: "0 0 28px rgba(79,209,255,.2)" }}>
          Certificates
        </h2>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--glow)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Archive · scroll <span style={{ fontSize: 14 }}>↓</span>
        </span>
      </div>

      <div data-rise className="np-cert-window">
        <div className="np-cert-scroll">
          {CERTIFICATIONS.map((c) => (
            <a
              key={c.title}
              href={c.file}
              target="_blank"
              rel="noreferrer"
              className="np-cert"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  fontFamily: "var(--mono)",
                  fontSize: 10.5,
                  letterSpacing: ".04em",
                  color: "var(--muted)",
                }}
              >
                <span>{c.issued}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{c.provider}</span>
                <span style={{ marginLeft: "auto", opacity: 0.6 }}>{c.domain}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span
                  className="np-cert-title"
                  style={{
                    fontFamily: "var(--grotesk)",
                    fontWeight: 400,
                    fontSize: 14.5,
                    lineHeight: 1.35,
                    color: "var(--text)",
                  }}
                >
                  {c.title}
                </span>
                <span className="np-cert-view">view ↗</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
