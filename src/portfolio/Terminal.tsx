"use client";

import { useEffect, useRef, useState } from "react";

import { CERTIFICATIONS } from "@/content/certifications";
import { CONTACT, IDENTITY, PHILOSOPHY, SESSION } from "@/content/identity";
import { JOURNEY } from "@/content/journey";
import { ACTIVE_SYSTEMS } from "@/content/systems";

/**
 * DEPTH.05 — TERMINAL. An interactive shell over the same typed content
 * the rest of the page renders; commands read content modules, never
 * duplicated strings. `open <name>` routes to a dossier.
 */

interface Line {
  t?: string;
  c?: string;
  href?: string;
  link?: string;
}

const M = (t: string, c?: string): Line => ({ t, c });

const PROMPT = SESSION.prompt;

/** Build open-aliases → slug from the live systems. */
const OPEN_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const s of ACTIVE_SYSTEMS) {
    map[s.slug] = s.slug;
    const head = s.slug.split("-")[0];
    if (head) map[head] = s.slug;
  }
  // a few human aliases
  Object.assign(map, {
    marp: "multi-agentic-research-platform",
    research: "multi-agentic-research-platform",
    ats: "algo-trade-simulator",
    trade: "algo-trade-simulator",
    algo: "algo-trade-simulator",
    float: "floatchat",
    ocean: "floatchat",
    mock: "mock-ai",
    mockai: "mock-ai",
  });
  return map;
})();

function runCommand(raw: string): Line[] | "CLEAR" {
  const parts = raw.trim().split(/\s+/);
  const cmd = (parts[0] ?? "").toLowerCase();
  const arg = parts.slice(1).join(" ").toLowerCase();

  switch (cmd) {
    case "":
      return [];
    case "help":
      return [
        M("available commands:", "var(--glow)"),
        M("  whoami        identity readout"),
        M("  about         operator summary"),
        M("  skills        capability stack"),
        M("  projects      list the project vault"),
        M("  open <name>   open a project dossier"),
        M("  journey       operations ledger"),
        M("  certs         credential archive"),
        M("  philosophy    engineering principles"),
        M("  contact       channels"),
        M("  time          facility local time"),
        M("  clear         wipe the screen"),
      ];
    case "whoami":
      return [M(`${IDENTITY.name} · ${IDENTITY.role}`, "var(--text)")];
    case "about":
      return [M(IDENTITY.summary, "var(--muted)")];
    case "skills":
      return IDENTITY.capabilities.map((c) => M("  " + c));
    case "projects":
      return [
        ...ACTIVE_SYSTEMS.map((s) =>
          M(`${s.designation}   ${s.title}   [${s.status}]`, "var(--glow)")
        ),
        M("type 'open <name>' to read a dossier", "var(--dim)"),
      ];
    case "open": {
      let slug: string | null = null;
      for (const k in OPEN_MAP) {
        if (arg.indexOf(k) !== -1) {
          slug = OPEN_MAP[k];
          break;
        }
      }
      if (!slug)
        return [M("usage: open <marp | ats | floatchat | mock>", "var(--warn)")];
      return [
        { t: "> opening dossier · " + slug, c: "var(--dim)" },
        { link: "launch " + slug + " →", href: `/systems/${slug}` },
      ];
    }
    case "journey":
      return [
        ...JOURNEY.map((e) =>
          M(`${e.span}   ${e.org} — ${e.title}`, e.weight === "high" ? "var(--text)" : "var(--muted)")
        ),
        M("full ledger in DEPTH.03", "var(--dim)"),
      ];
    case "certs":
      return [
        M(
          `${CERTIFICATIONS.length} credentials. recent:`,
          "var(--glow)"
        ),
        ...CERTIFICATIONS.slice(0, 4).map((c) =>
          M(`  ${c.provider} · ${c.title} · ${c.issued}`)
        ),
        M("full archive in DEPTH.04", "var(--dim)"),
      ];
    case "philosophy":
      return PHILOSOPHY.map((p) => M(p, "var(--muted)"));
    case "contact":
      return CONTACT.channels
        .filter((c) => c.id !== "resume")
        .map((c) => M(`${c.label.padEnd(10)} ${c.value}`, "var(--text)"));
    case "time": {
      let s = "";
      try {
        s = new Date().toLocaleTimeString("en-GB", {
          timeZone: IDENTITY.timeZone,
          hour12: false,
        });
      } catch {
        /* unsupported */
      }
      return [M(`${s} ${IDENTITY.timeZoneLabel}`, "var(--glow)")];
    }
    case "ls":
      return [M("about  projects  journey  certs  terminal  contact  resume.pdf", "var(--muted)")];
    case "sudo":
      return [M("permission denied: nice try, operator.", "var(--hot)")];
    case "echo":
      return [M(parts.slice(1).join(" "), "var(--muted)")];
    case "clear":
      return "CLEAR";
    case "cls":
      return "CLEAR";
    default:
      return [M(`command not found: ${cmd} — type 'help'`, "var(--warn)")];
  }
}

const INTRO: Line[] = [
  { t: `NEXUS shell v0.1 · ${PROMPT.replace(":~$", "")}`, c: "var(--glow)" },
  { t: "type 'help' for available commands.", c: "var(--dim)" },
  { t: " ", c: "var(--dim)" },
];

export function Terminal() {
  const [lines, setLines] = useState<Line[]>(INTRO);
  const outRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const history = useRef<string[]>([]);
  const hi = useRef(0);

  useEffect(() => {
    if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [lines]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (e.key === "Enter") {
      const raw = input.value;
      if (raw.trim()) {
        history.current.push(raw);
        hi.current = history.current.length;
      }
      const echo: Line = { t: PROMPT + " " + raw, c: "var(--text)" };
      const res = runCommand(raw);
      if (res === "CLEAR") {
        setLines([]);
      } else {
        setLines((prev) => [...prev, echo, ...res]);
      }
      input.value = "";
    } else if (e.key === "ArrowUp") {
      if (history.current.length) {
        hi.current = Math.max(0, hi.current - 1);
        input.value = history.current[hi.current] ?? "";
        e.preventDefault();
      }
    } else if (e.key === "ArrowDown") {
      if (history.current.length) {
        hi.current = Math.min(history.current.length, hi.current + 1);
        input.value = history.current[hi.current] ?? "";
        e.preventDefault();
      }
    }
  };

  return (
    <section
      id="terminal"
      className="np-sec"
      style={{ minHeight: "78vh", justifyContent: "center" }}
    >
      <div className="np-depth">
        <span className="lead">DEPTH.05</span>
        <span className="rule" />
        <span>TERMINAL</span>
        <span className="meta">INTERACTIVE · TYPE &apos;help&apos;</span>
      </div>
      <h2 className="np-h2" style={{ textShadow: "0 0 28px rgba(255,73,192,.18)" }}>
        Query the Operator
      </h2>

      <div className="np-termwrap" onClick={() => inputRef.current?.focus()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 16px",
            borderBottom: "1px solid var(--hair)",
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".16em",
            color: "var(--dim)",
          }}
        >
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--hot)", boxShadow: "0 0 7px var(--hot)" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--warn)" }} />
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--ok)" }} />
          <span style={{ marginLeft: 8 }}>
            {SESSION.user}@{SESSION.host} — /workspace
          </span>
        </div>
        <div ref={outRef} className="np-termout">
          {lines.map((ln, i) =>
            ln.link ? (
              <div key={i}>
                <a href={ln.href} style={{ color: "var(--glow)", textDecoration: "underline" }}>
                  {ln.link}
                </a>
              </div>
            ) : (
              <div key={i} style={{ color: ln.c ?? "var(--muted)" }}>
                {ln.t}
              </div>
            )
          )}
        </div>
        <div
          className="np-termline"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 18px 18px",
            fontFamily: "var(--mono)",
            fontSize: 13,
          }}
        >
          <span style={{ color: "var(--glow)", whiteSpace: "nowrap" }}>{PROMPT}</span>
          <input
            ref={inputRef}
            data-terminput="1"
            type="text"
            autoComplete="off"
            spellCheck={false}
            aria-label="terminal command"
            className="np-terminput"
            onKeyDown={onKey}
          />
        </div>
      </div>
    </section>
  );
}
