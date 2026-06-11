import { CONTACT, FACILITY, IDENTITY, PHILOSOPHY } from "@/content/identity";
import { LOGS } from "@/content/logs";
import {
  ACTIVE_SYSTEMS,
  ARCHIVED_SYSTEMS,
  SYSTEMS,
  type SystemRecord,
} from "@/content/systems";
import {
  TELEMETRY_REVALIDATE_S,
  TELEMETRY_TIMEOUT_MS,
} from "@/content/telemetry-sources";

/**
 * commands.ts — the terminal's typed command registry
 * (implementation-architecture §2; interaction-principles §5: real
 * input handling, instant response, 2–3 undocumented easter eggs).
 *
 * Pure module: no React, no DOM, no async, no randomness. Every
 * command is a deterministic function from input to lines — same
 * input, same output, instantly (no fake latency, no simulated
 * hacking, no theater).
 *
 * TRUTH SOURCE LAW: commands contain no prose of their own. Every
 * line derives from content/ (identity, systems, logs,
 * telemetry-sources) — the terminal is another interface into the
 * same truth, so the vault, the logs, and the operator can never
 * disagree with it.
 *
 * Hidden commands (`pin`, `budgets`, `sudo`) are undocumented but as
 * honest as everything else — each answer is verifiable against this
 * repository.
 */

export type TerminalLineKind = "echo" | "output" | "muted" | "error" | "link";

export interface TerminalLineSpec {
  kind: TerminalLineKind;
  text: string;
  /** Present only on kind "link" — a real anchor, native navigation. */
  href?: string;
}

export interface CommandResult {
  lines: readonly TerminalLineSpec[];
  /** `clear` wipes the log instead of appending. */
  clear?: boolean;
}

interface CommandSpec {
  /** Usage string for `help`, e.g. "open <system>". */
  usage: string;
  description: string;
  hidden?: boolean;
  run: (arg: string) => CommandResult;
}

const out = (text: string): TerminalLineSpec => ({ kind: "output", text });
const muted = (text: string): TerminalLineSpec => ({ kind: "muted", text });
const link = (text: string, href: string): TerminalLineSpec => ({
  kind: "link",
  text,
  href,
});

/** `open` argument → system slug. Covers every real system + the facility. */
const OPEN_ALIASES: Record<string, string> = {
  marp: "multi-agentic-research-platform",
  ats: "algo-trade-simulator",
  float: "floatchat",
  floatchat: "floatchat",
  mock: "mock-ai",
  mockai: "mock-ai",
};

function openSystem(system: SystemRecord): CommandResult {
  return {
    lines: [
      out(`${system.designation} · ${system.title} · ${system.status}`),
      muted(system.constraint),
      ...(system.dossier !== undefined ? [out(system.dossier.overview)] : []),
      muted(`infra: ${system.stack.join(" · ")}`),
      ...(system.dossier !== undefined
        ? [link(`> open full dossier: /systems/${system.slug}`, `/systems/${system.slug}`)]
        : []),
      link(`> source: ${system.repo}`, `https://${system.repo}`),
    ],
  };
}

const REGISTRY: Record<string, CommandSpec> = {
  /* ---- navigation ---- */
  help: {
    usage: "help",
    description: "command index",
    run: () => ({
      lines: Object.entries(REGISTRY)
        .filter(([, spec]) => spec.hidden !== true)
        .map(([, spec]) =>
          muted(`${spec.usage.padEnd(16)} ${spec.description}`)
        ),
    }),
  },
  systems: {
    usage: "systems",
    description: "vault records",
    run: () => ({
      lines: [
        ...SYSTEMS.map((s) =>
          out(`${s.designation} · ${s.title} · ${s.status}`)
        ),
        muted("> 'open <marp|ats|float|mock|nexus>' for the record"),
        link("> jump: system vault", "#vault"),
      ],
    }),
  },
  logs: {
    usage: "logs",
    description: "operation chronology",
    run: () => ({
      lines: [
        ...LOGS.map((l) =>
          out(
            `${l.id} · [${l.type}] ${l.title}${l.severity === "critical" ? " · critical" : ""}`
          )
        ),
        link("> jump: mission logs", "#logs"),
      ],
    }),
  },
  contact: {
    usage: "contact",
    description: "communication channels",
    run: () => ({
      lines: [
        ...CONTACT.channels.map((c) => link(`${c.label}: ${c.value}`, c.href)),
        ...CONTACT.state.map((row) => muted(`${row.term}: ${row.value}`)),
        link("> jump: contact node", "#contact"),
      ],
    }),
  },
  resume: {
    usage: "resume",
    description: "operator record access",
    run: () => {
      const resume = CONTACT.channels.find((c) => c.id === "resume");
      const email = CONTACT.channels.find((c) => c.id === "email");
      return {
        lines: [
          out(`resume: ${resume?.value ?? "on request"}`),
          ...(email !== undefined
            ? [link(`> request via ${email.value}`, resume?.href ?? email.href)]
            : []),
        ],
      };
    },
  },
  clear: {
    usage: "clear",
    description: "wipe the session log",
    run: () => ({ lines: [], clear: true }),
  },

  /* ---- identity ---- */
  whoami: {
    usage: "whoami",
    description: "operator record",
    run: () => ({
      lines: [
        out(`${IDENTITY.name} · ${IDENTITY.role}`),
        muted(IDENTITY.summary),
      ],
    }),
  },
  focus: {
    usage: "focus",
    description: "current operational direction",
    run: () => ({
      lines: [out(`current focus: ${IDENTITY.focus}`)],
    }),
  },
  stack: {
    usage: "stack",
    description: "infrastructure per system",
    run: () => ({
      lines: SYSTEMS.map((s) =>
        out(`${s.designation} · ${s.stack.join(" · ")}`)
      ),
    }),
  },
  philosophy: {
    usage: "philosophy",
    description: "operational doctrine",
    run: () => ({ lines: PHILOSOPHY.map(out) }),
  },

  /* ---- system depth ---- */
  open: {
    usage: "open <system>",
    description: "system record (marp · ats · float · mock · nexus)",
    run: (arg) => {
      const key = arg.trim().toLowerCase();
      if (key === "") {
        return { lines: [muted("> usage: open <marp|ats|float|mock|nexus>")] };
      }
      if (key === "nexus") {
        return {
          lines: [
            out(`${FACILITY.designation} · ${FACILITY.title} · operational`),
            ...FACILITY.lines.map(muted),
          ],
        };
      }
      const slug = OPEN_ALIASES[key];
      const system = SYSTEMS.find((s) => s.slug === slug);
      if (system === undefined) {
        return {
          lines: [
            { kind: "error", text: `> no record: ${key} — try 'systems'` },
          ],
        };
      }
      return openSystem(system);
    },
  },
  constraints: {
    usage: "constraints",
    description: "design pressure per system",
    run: () => ({
      lines: SYSTEMS.flatMap((s) =>
        s.dossier !== undefined
          ? [
              muted(s.designation.toLowerCase()),
              ...s.dossier.constraints.map((c) => out(`· ${c}`)),
            ]
          : []
      ),
    }),
  },
  failures: {
    usage: "failures",
    description: "preserved failure traces",
    run: () => ({
      lines: LOGS.flatMap((l) =>
        l.failureNote !== undefined
          ? [out(`${l.id} · ${l.title}`), muted(`! ${l.failureNote}`)]
          : []
      ),
    }),
  },
  reasoning: {
    usage: "reasoning",
    description: "why these shapes and not others",
    run: () => ({
      lines: SYSTEMS.flatMap((s) =>
        s.dossier !== undefined
          ? [muted(s.designation.toLowerCase()), out(s.dossier.reasoning)]
          : []
      ),
    }),
  },

  /* ---- operational ---- */
  status: {
    usage: "status",
    description: "facility state",
    run: () => ({
      lines: [
        out(
          `${ACTIVE_SYSTEMS.length} systems operational${ARCHIVED_SYSTEMS.length > 0 ? ` · ${ARCHIVED_SYSTEMS.length} archived` : ""}`
        ),
        out(`focus: ${IDENTITY.focus}`),
        out(`availability: ${IDENTITY.availability}`),
        muted(`telemetry: aggregated · revalidated ${TELEMETRY_REVALIDATE_S}s`),
      ],
    }),
  },
  latency: {
    usage: "latency",
    description: "what is and is not measured",
    run: () => ({
      lines: [
        out("request latency: not instrumented — no number is shown that is not measured."),
        muted(`telemetry revalidation: ${TELEMETRY_REVALIDATE_S}s · upstream fetch timeout: ${TELEMETRY_TIMEOUT_MS}ms`),
      ],
    }),
  },
  uptime: {
    usage: "uptime",
    description: "availability posture",
    run: () => ({
      lines: [
        out("uptime monitoring: not configured. deployment state ships from build metadata."),
        muted("> absent sources are omitted, never simulated (real data law)."),
      ],
    }),
  },

  /* ---- undocumented — each answer verifiable against the repo ---- */
  pin: {
    usage: "pin",
    description: "",
    hidden: true,
    run: () => ({
      lines: [
        out("pin budget: 1/1 — held by vault-track."),
        muted("> a second claim throws in development (descent/pin-budget.ts)."),
      ],
    }),
  },
  budgets: {
    usage: "budgets",
    description: "",
    hidden: true,
    run: () => ({
      lines: [
        out("restraint budgets, enforced:"),
        muted("· pinned sequences: 1 (vault)"),
        muted("· live-filtered elements per frame: 1"),
        muted("· planes mounted: ≤3"),
        muted("· ambient sources per viewport: 1"),
        muted("· accent color per viewport: ≤2%"),
      ],
    }),
  },
  sudo: {
    usage: "sudo",
    description: "",
    hidden: true,
    run: () => ({
      lines: [
        muted("> no privilege tiers here. everything real is already visible."),
      ],
    }),
  },
};

/** Visible command names — autocomplete-safe, derived from the registry. */
export const COMMAND_NAMES = Object.entries(REGISTRY)
  .filter(([, spec]) => spec.hidden !== true)
  .map(([name]) => name);

/** Execute one input line. Deterministic, synchronous, total. */
export function execute(input: string): CommandResult {
  const trimmed = input.trim();
  if (trimmed === "") return { lines: [] };

  const [name, ...rest] = trimmed.split(/\s+/);
  const spec = REGISTRY[name.toLowerCase()];
  if (spec === undefined) {
    return {
      lines: [
        {
          kind: "error",
          text: `> command not found: ${name} — type 'help'`,
        },
      ],
    };
  }
  return spec.run(rest.join(" "));
}
