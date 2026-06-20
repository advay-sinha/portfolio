import { CERTIFICATIONS, PROVIDER_COUNT } from "@/content/certifications";

/**
 * DEPTH.04 — CERTS. The credential archive from
 * content/certifications.ts, newest first. Counts derive from the
 * array. Each card links to its real PDF under /public.
 */

export function CertsSection() {
  return (
    <section id="live" className="np-sec">
      <div className="np-depth">
        <span className="lead">DEPTH.04</span>
        <span className="rule" />
        <span>CERTS</span>
        <span className="meta">
          {PROVIDER_COUNT} ISSUERS · {CERTIFICATIONS.length} CREDENTIALS
        </span>
      </div>
      <h2 className="np-h2" style={{ textShadow: "0 0 28px rgba(79,209,255,.2)" }}>
        Certificates
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
          gap: 14,
        }}
      >
        {CERTIFICATIONS.map((c) => (
          <a
            key={c.title}
            href={c.file}
            target="_blank"
            rel="noreferrer"
            data-rise
            className="np-cert"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  letterSpacing: ".14em",
                  color: "var(--glow)",
                }}
              >
                {c.provider}
              </span>
              <span
                style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dim)" }}
              >
                {c.issued}
              </span>
            </div>
            <h3
              className="np-cert-title"
              style={{
                fontFamily: "var(--grotesk)",
                fontWeight: 400,
                fontSize: 14.5,
                lineHeight: 1.35,
                color: "var(--text)",
                minHeight: "2.6em",
              }}
            >
              {c.title}
            </h3>
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 9,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "var(--signal)",
                  border: "1px solid rgba(124,92,255,.4)",
                  padding: "2px 7px",
                }}
              >
                {c.domain}
              </span>
              {c.credentialId && (
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 9,
                    color: "var(--dim)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 120,
                  }}
                >
                  id · {c.credentialId}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
