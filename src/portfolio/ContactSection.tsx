import { CONTACT, IDENTITY } from "@/content/identity";

/**
 * DEPTH.06 — CONTACT. The channel registry from content/identity.ts,
 * ported from Portfolio.dc.html's Contact Node: a footer with the
 * operator name in display scale, an email + location column, a social
 * stack, an authorship credit, and a status bar carrying the résumé.
 * Every channel resolves to a real destination.
 */

const channel = (id: string) => CONTACT.channels.find((c) => c.id === id);

const SOCIAL_IDS = ["github", "linkedin", "repositories"] as const;

export function ContactSection() {
  const email = channel("email");
  const resume = channel("resume");

  return (
    <footer id="contact" className="np-foot">
      {/* Ambient signal blooms — the node's purple field. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -120,
          left: -80,
          width: 360,
          height: 360,
          borderRadius: "9999px",
          background: "radial-gradient(circle, rgba(124,92,255,.32), transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 60,
          right: -160,
          width: 520,
          height: 520,
          borderRadius: "9999px",
          background: "radial-gradient(circle, rgba(124,92,255,.22), transparent 70%)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      <div className="np-foot-inner">
        <div
          data-rise
          className="np-depth"
          style={{ marginBottom: 28 }}
        >
          <span className="lead">DEPTH.06</span>
          <span className="rule" />
          <span>NODE: CONTACT</span>
        </div>

        <h2 data-rise className="np-foot-name">
          {IDENTITY.name}
        </h2>

        <div data-rise className="np-foot-grid">
          {/* Email + location */}
          <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
            {email && (
              <div>
                <p className="np-foot-key">Email</p>
                <a className="np-foot-mail" href={email.href}>
                  {email.value}
                </a>
              </div>
            )}
            <div>
              <p className="np-foot-key">Location</p>
              <p style={{ margin: 0, fontSize: "1.04rem", color: "var(--text)" }}>
                {IDENTITY.location} · {IDENTITY.timeZoneLabel} ({IDENTITY.utcOffset})
              </p>
            </div>
          </div>

          {/* Social stack */}
          <div>
            <p className="np-foot-key">Social</p>
            <div style={{ display: "flex", flexDirection: "column", maxWidth: 300 }}>
              {SOCIAL_IDS.map((id) => {
                const c = channel(id);
                if (!c) return null;
                return (
                  <a
                    key={c.id}
                    href={c.href}
                    target="_blank"
                    rel="noreferrer"
                    className="np-soc"
                  >
                    {c.label}
                    <span>↗</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Authorship + year */}
          <div>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--grotesk)",
                fontSize: "1.32rem",
                fontWeight: 500,
                lineHeight: 1.3,
                color: "var(--text)",
              }}
            >
              Designed and Developed
              <br />
              by <span style={{ color: "var(--signal)" }}>{IDENTITY.name}</span>
            </p>
            <p
              style={{
                margin: "26px 0 0",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: "1.1rem",
                color: "var(--dim)",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  border: "1px solid var(--dim)",
                  borderRadius: "9999px",
                  fontSize: "0.72rem",
                }}
              >
                ©
              </span>
              2026
            </p>
          </div>
        </div>

        <div className="np-foot-bar">
          <span className="np-foot-status">Systems Nexus · status operational</span>
          {resume && (
            <a
              href={resume.href}
              target="_blank"
              rel="noreferrer"
              className="np-foot-resume"
            >
              Resume
              <svg width="15" height="17" viewBox="0 0 15 17" fill="none" style={{ display: "block" }}>
                <rect x="0.5" y="0.5" width="14" height="16" rx="1.5" stroke="currentColor" />
                <line x1="3.5" y1="5" x2="11.5" y2="5" stroke="currentColor" />
                <line x1="3.5" y1="8.5" x2="11.5" y2="8.5" stroke="currentColor" />
                <line x1="3.5" y1="12" x2="8.5" y2="12" stroke="currentColor" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
