import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DossierSchematic } from "@/portfolio/DossierSchematic";
import { SYSTEMS, systemBySlug, type SystemStatus } from "@/content/systems";

/**
 * The dossier route — "the Cut": a sealed archive room reached from the
 * vault. It owns no depth system; one still light holds over a calm,
 * server-rendered record. Implemented to match Dossier.dc.html, scoped
 * under `.np` so it shares the cyberpunk token + type system while the
 * home owns the motion.
 *
 * Anatomy is the postmortem, not the pitch: overview, architecture,
 * constraints, tradeoffs, failure notes, stack, reasoning, future work.
 * Statically generated per system (dynamicParams=false); `return to
 * vault` is a plain link back to /#vault.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return SYSTEMS.filter((s) => s.dossier !== undefined).map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const system = systemBySlug(slug);
  return {
    title: system ? `${system.designation} — ${system.title}` : "DOSSIER",
    description: system?.summary,
    alternates: { canonical: `/systems/${slug}` },
  };
}

const STATUS_COLOR: Record<SystemStatus, string> = {
  operational: "#34D399",
  experimental: "#FBBF24",
  archived: "#94A3B8",
};

const label = (color: string): React.CSSProperties => ({
  fontFamily: "var(--mono)",
  fontSize: 10,
  letterSpacing: ".22em",
  textTransform: "uppercase",
  color,
  marginBottom: 14,
});

const sectionStyle: React.CSSProperties = {
  borderTop: "1px solid var(--hair)",
  paddingTop: 20,
};

const paraStyle: React.CSSProperties = {
  maxWidth: "68ch",
  fontSize: 15,
  lineHeight: 1.72,
  color: "var(--muted)",
  textWrap: "pretty",
};

function ListSection({
  title,
  color,
  border,
  items,
}: {
  title: string;
  color: string;
  border: string;
  items: readonly string[];
}) {
  return (
    <section style={sectionStyle}>
      <p style={label(color)}>{title}</p>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it) => (
          <li
            key={it}
            className="np-doss-li"
            style={{
              maxWidth: "68ch",
              borderLeft: `2px solid ${border}`,
              paddingLeft: 14,
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "var(--muted)",
            }}
          >
            {it}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function DossierPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const system = systemBySlug(slug);
  if (system?.dossier === undefined) notFound();
  const d = system.dossier;
  const statusColor = STATUS_COLOR[system.status];

  return (
    <div className="np">
      {/* sealed archive atmosphere: one still light + scanlines */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg,#05071a 0%,#06081a 60%,#0a0820 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(820px,100vw)",
            height: "46vh",
            background:
              "radial-gradient(60% 60% at 50% 0%,rgba(79,209,255,.14),transparent 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(130% 120% at 50% 30%,transparent 55%,rgba(2,3,10,.7) 100%)",
          }}
        />
      </div>
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(to bottom,rgba(0,0,0,0) 0px,rgba(0,0,0,0) 2px,rgba(0,0,0,.13) 3px,rgba(0,0,0,0) 4px)",
          mixBlendMode: "multiply",
          opacity: 0.5,
        }}
      />

      <main className="np-doss-main">
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(26px,3.4vw,40px)" }}>
          {/* header */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Link href="/#vault" className="np-back">
              &lt; return to vault
            </Link>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              <span>DETAILS</span>
              <span style={{ color: "var(--dim)" }}>·</span>
              <span style={{ color: "var(--glow)" }}>{system.designation}</span>
              <span style={{ color: "var(--dim)" }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: statusColor }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: statusColor,
                    boxShadow: `0 0 7px ${statusColor}`,
                    animation: "np-pulseDot 2.4s ease-in-out infinite",
                  }}
                />
                {system.status}
              </span>
            </div>
            <a
              href={`https://${system.repo}`}
              target="_blank"
              rel="noreferrer"
              className="np-back"
            >
              &gt; source: {system.repo}
            </a>
          </div>

          {/* title */}
          <div>
            <h1
              style={{
                fontFamily: "var(--grotesk)",
                fontWeight: 600,
                fontSize: "clamp(34px,5.4vw,60px)",
                lineHeight: 1.02,
                letterSpacing: "-.02em",
                textShadow: "0 0 30px rgba(79,209,255,.22)",
              }}
            >
              {system.title}
            </h1>
            <p
              style={{
                marginTop: 14,
                maxWidth: "64ch",
                fontSize: "clamp(15px,1.6vw,18px)",
                lineHeight: 1.6,
                color: "var(--muted)",
                textWrap: "pretty",
              }}
            >
              {system.constraint}
            </p>
          </div>

          {/* overview */}
          <section style={sectionStyle}>
            <p style={label("var(--glow)")}>project overview</p>
            <p className="np-doss-p" style={paraStyle}>{d.overview}</p>
          </section>

          {/* architecture + schematic */}
          <section style={sectionStyle}>
            <p style={label("var(--glow)")}>architecture</p>
            <p className="np-doss-p" style={paraStyle}>{d.architecture}</p>
            {system.schematicId && (
              <div
                style={{
                  marginTop: 18,
                  borderTop: "1px solid var(--hair)",
                  borderBottom: "1px solid var(--hair)",
                  padding: "16px 0",
                }}
              >
                <DossierSchematic id={system.schematicId} />
              </div>
            )}
          </section>

          <ListSection
            title="constraints"
            color="var(--glow)"
            border="var(--hair-strong)"
            items={d.constraints}
          />
          <ListSection
            title="tradeoffs"
            color="var(--signal)"
            border="rgba(124,92,255,.4)"
            items={d.tradeoffs}
          />
          <ListSection
            title="failure notes"
            color="var(--hot)"
            border="rgba(255,73,192,.4)"
            items={d.failures}
          />

          {/* infrastructure */}
          <section style={sectionStyle}>
            <p style={label("var(--glow)")}>infrastructure</p>
            <p
              className="np-doss-stack"
              style={{
                fontFamily: "var(--mono)",
                fontSize: 13,
                letterSpacing: ".04em",
                color: "var(--text)",
              }}
            >
              {system.stack.join(" · ")}
            </p>
          </section>

          {/* reasoning */}
          <section style={sectionStyle}>
            <p style={label("var(--glow)")}>engineering reasoning</p>
            <p className="np-doss-p" style={paraStyle}>{d.reasoning}</p>
          </section>

          {/* future work */}
          <section style={sectionStyle}>
            <p style={label("var(--glow)")}>future work</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
              {d.future.map((it) => (
                <li
                  key={it}
                  className="np-doss-li"
                  style={{
                    maxWidth: "68ch",
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    color: "var(--muted)",
                  }}
                >
                  <span style={{ color: "var(--dim)" }}>&gt; </span>
                  {it}
                </li>
              ))}
            </ul>
          </section>

          {/* footer return */}
          <div
            style={{
              borderTop: "1px solid var(--hair)",
              paddingTop: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link href="/#vault" className="np-return">
              &lt; return to vault
            </Link>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: ".2em",
                color: "var(--dim)",
              }}
            >
              END OF RECORD · {system.designation}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
