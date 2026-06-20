import Link from "next/link";

import { ACTIVE_SYSTEMS } from "@/content/systems";

import { VaultSchematic, type SchematicSpec } from "./VaultSchematic";

/**
 * DEPTH.02 — PROJECT VAULT. Each system from content/systems.ts becomes
 * a blueprint card linking to its dossier route. Schematic topology is
 * presentation, keyed by the system's schematicId.
 */

const SCHEMATICS: Record<string, SchematicSpec> = {
  marp: {
    stages: ["PLAN", "RETRIEVE", "WRITE", "CRITIC", "VERIFY"],
    accentIndex: 4,
    branch: { under: 1, label: "PGVECTOR" },
    loop: { from: 3, to: 2 },
    out: "OUT",
    dur: 4.5,
  },
  ats: {
    stages: ["FEED", "QUOTES", "STRATEGY", "SIGNAL", "LEDGER"],
    accentIndex: 4,
    branch: { under: 2, label: "COPILOT" },
    out: "REC",
    dur: 4.8,
  },
  floatchat: {
    stages: ["NETCDF", "CONVERT", "PARQUET", "QUERY", "CHAT"],
    accentIndex: 4,
    branch: { under: 3, label: "FALLBACK" },
    out: "OUT",
    dur: 5.2,
  },
  mockai: {
    stages: ["CLIENT", "FASTAPI", "GEMINI", "EVALUATE", "MONGO"],
    accentIndex: 2,
    branch: { under: 0, label: "VOICE" },
    out: "REC",
    dur: 4.6,
  },
};

export function VaultSection() {
  return (
    <section id="vault" className="np-sec">
      <div className="np-depth">
        <span className="lead">DEPTH.02</span>
        <span className="rule" />
        <span>PROJECTS</span>
        <span className="meta">
          {String(ACTIVE_SYSTEMS.length).padStart(2, "0")} SYSTEMS · ALL OPERATIONAL
        </span>
      </div>
      <h2 className="np-h2" style={{ textShadow: "0 0 28px rgba(124,92,255,.2)" }}>
        Project Vault
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {ACTIVE_SYSTEMS.map((sys) => {
          const spec = sys.schematicId ? SCHEMATICS[sys.schematicId] : undefined;
          const href = sys.dossier ? `/systems/${sys.slug}` : sys.repo;
          const inner = (
            <>
              <span className="np-corner tl" />
              <span className="np-corner br" />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    letterSpacing: ".14em",
                    color: "var(--glow)",
                  }}
                >
                  {sys.designation}
                </span>
                <h3
                  style={{
                    fontFamily: "var(--grotesk)",
                    fontWeight: 500,
                    fontSize: "clamp(19px,2.2vw,26px)",
                  }}
                >
                  {sys.title}
                </h3>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    letterSpacing: ".14em",
                    color: "var(--ok)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--ok)",
                      boxShadow: "0 0 6px var(--ok)",
                      animation: "np-pulseDot 2.4s ease-in-out infinite",
                    }}
                  />
                  {sys.status.toUpperCase()}
                </span>
                <span className="np-arrow">open dossier →</span>
              </div>
              {spec && (
                <div
                  style={{
                    borderTop: "1px solid var(--hair)",
                    borderBottom: "1px solid var(--hair)",
                    padding: "16px 0",
                    margin: "8px 0 12px",
                  }}
                >
                  <VaultSchematic spec={spec} />
                </div>
              )}
              <p
                className="np-card-desc"
                style={{
                  fontSize: 14,
                  color: "var(--muted)",
                  lineHeight: 1.55,
                  maxWidth: "70ch",
                }}
              >
                {sys.constraint}
              </p>
            </>
          );

          return sys.dossier ? (
            <Link key={sys.slug} href={href} className="np-card">
              {inner}
            </Link>
          ) : (
            <a
              key={sys.slug}
              href={`https://${href}`}
              target="_blank"
              rel="noreferrer"
              className="np-card"
            >
              {inner}
            </a>
          );
        })}
      </div>
    </section>
  );
}
