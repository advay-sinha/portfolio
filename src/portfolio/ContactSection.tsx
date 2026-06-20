import { CONTACT, IDENTITY, SESSION } from "@/content/identity";

import { Clock } from "./Clock";

/**
 * DEPTH.06 — CONTACT. The channel registry from content/identity.ts.
 * CONTACT.sentence is the page's single first-person line. Every
 * channel resolves to a real destination.
 */

/** Split the headline so its tail can carry the glow accent. */
function Headline() {
  const text = CONTACT.sentence;
  const [head, tail] = text.includes("—")
    ? [text.split("—")[0] + "— ", text.split("—").slice(1).join("—").trim()]
    : [text, ""];
  return (
    <h2
      data-rise
      style={{
        fontFamily: "var(--grotesk)",
        fontWeight: 600,
        fontSize: "clamp(38px,6vw,82px)",
        letterSpacing: "-.02em",
        lineHeight: 1.02,
        maxWidth: "16ch",
        textShadow: "0 0 36px rgba(79,209,255,.25)",
      }}
    >
      {head}
      {tail && <span style={{ color: "var(--glow)" }}>{tail}</span>}
    </h2>
  );
}

export function ContactSection() {
  return (
    <section
      id="contact"
      className="np-sec"
      style={{
        minHeight: "82vh",
        padding: "52px 0 72px",
        justifyContent: "center",
        gap: 32,
      }}
    >
      <div
        data-rise
        className="np-depth"
        style={{ alignItems: "center" }}
      >
        <span className="lead">DEPTH.06</span>
        <span className="rule" />
        <span>CONTACT</span>
      </div>

      <Headline />

      <div
        data-rise
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 14,
          maxWidth: 920,
        }}
      >
        {CONTACT.channels.map((c) => (
          <a
            key={c.id}
            href={c.href}
            {...(c.id !== "email"
              ? { target: "_blank", rel: "noreferrer" }
              : {})}
            className="np-chan"
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--dim)",
              }}
            >
              {c.label}
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text)" }}>
              {c.value}
            </span>
          </a>
        ))}
      </div>

      <div
        data-rise
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: ".2em",
          color: "var(--dim)",
          marginTop: 10,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--ok)",
            boxShadow: "0 0 8px var(--ok)",
            animation: "np-pulseDot 2.4s ease-in-out infinite",
          }}
        />
        <span>
          END OF DESCENT · NEXUS // {SESSION.user}@{SESSION.host} · <Clock />{" "}
          {IDENTITY.timeZoneLabel}
        </span>
      </div>
    </section>
  );
}
