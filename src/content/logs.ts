/**
 * logs.ts — the Mission Logs' records, as typed data
 * (implementation-architecture §2: components never contain copy;
 * storytelling.md §4: preserved failure traces are load-bearing).
 *
 * HONESTY LAW (review this file, not the components):
 * every entry below is a real engineering moment from a real system in
 * content/systems.ts (or from this site's own build). Logs are
 * evidence, not storytelling: terse operational tone, failures and
 * reversals preserved, no heroism. Timestamps are month-precision —
 * day precision would be invented. The CI honesty gate
 * (implementation-architecture §14) fails the build on future dates.
 *
 * Required coverage (and where it lives):
 * - rollback .............. LOG.2025.08 (FloatChat NetCDF rollback)
 * - failed experiment ..... LOG.2025.04 (ATS LLM-only parsing)
 * - architecture rewrite .. LOG.2025.11 (MARP agent decomposition)
 * - latency constraint .... LOG.2025.08 (the rollback's cause)
 * - still unresolved ...... LOG.2026.01 (MARP first-step truncation)
 */

export type LogType =
  | "deployment"
  | "architecture"
  | "rollback"
  | "failure"
  | "optimization"
  | "migration";

export type LogSeverity = "info" | "warning" | "critical";

export interface LogEntry {
  /** Archive designation, e.g. "LOG.2025.08". */
  id: string;
  /** Month-precision ISO timestamp ("YYYY-MM") — honest precision only. */
  timestamp: string;
  /** System designation from content/systems.ts (or "NEXUS" for this site). */
  system: string;
  type: LogType;
  severity: LogSeverity;
  title: string;
  /** What happened — operational record, 1–2 lines. */
  summary: string;
  /** Where it landed — present operational state. */
  outcome: string;
  /** Preserved failure trace. Present whenever something broke or remains broken. */
  failureNote?: string;
}

/** Chronological, oldest first — the spine carries current through old records toward the present. */
export const LOGS: readonly LogEntry[] = [
  {
    id: "LOG.2025.02",
    timestamp: "2025-02",
    system: "SYS.ATS / 02",
    type: "migration",
    severity: "info",
    title: "Session persistence moved to MongoDB",
    summary:
      "Accounts, sessions, and simulations migrated from process memory to MongoDB through Motor (async). Process restarts were erasing simulated books mid-run.",
    outcome:
      "sessions survive restarts; the in-memory store retained as a zero-setup path for local runs.",
  },
  {
    id: "LOG.2025.04",
    timestamp: "2025-04",
    system: "SYS.ATS / 02",
    type: "failure",
    severity: "warning",
    title: "LLM-only command parsing rejected",
    summary:
      "Copilot routed simulation commands through the model alone. Loose prompts produced malformed simulations; valid-looking output failed downstream.",
    outcome:
      "hybrid routing shipped — heuristic parsers carry the command path; the model is enrichment.",
    failureNote:
      "experiment closed. the model path is assumed to fail and is routed around, permanently.",
  },
  {
    id: "LOG.2025.08",
    timestamp: "2025-08",
    system: "SYS.FLOAT / 03",
    type: "rollback",
    severity: "critical",
    title: "Live NetCDF queries rolled back",
    summary:
      "Interactive queries against the raw ARGO NetCDF archive exceeded the latency ceiling — multi-second stalls per question made exploration unusable.",
    outcome:
      "rolled back to an offline NetCDF → Parquet converter; the live application reads only the cache.",
    failureNote:
      "conversion is now a precondition, not an optimization. the live path does not exist.",
  },
  {
    id: "LOG.2025.11",
    timestamp: "2025-11",
    system: "SYS.MARP / 01",
    type: "architecture",
    severity: "info",
    title: "Omnibus prompt decomposed into five agents",
    summary:
      "Single-prompt research answers could not be audited — the model answered but could not show its work. Rewritten as Planner / Retriever / Writer / Critic / Verifier with typed trace events at every stage.",
    outcome:
      "each stage inspectable and replaceable; the critique loop bounded by a hard iteration cap.",
  },
  {
    id: "LOG.2026.01",
    timestamp: "2026-01",
    system: "SYS.MARP / 01",
    type: "failure",
    severity: "warning",
    title: "Retriever executes only the first plan step",
    summary:
      "Multi-step retrieval plans truncate to step one; remaining steps are recorded in the trace but never run. Discovered under multi-question research loads.",
    outcome:
      "limit preserved in the execution trace rather than papered over; downstream stages treat thin evidence as a first-class state.",
    failureNote: "still unresolved — full plan execution pending.",
  },
  {
    id: "LOG.2026.05",
    timestamp: "2026-05",
    system: "NEXUS",
    type: "deployment",
    severity: "info",
    title: "Vault pin vs. transformed containing block",
    summary:
      "First deployment of the descent engine: the plane transform created a containing block that broke ScrollTrigger's pin fixed-positioning during the Vault traverse.",
    outcome:
      "plane transform cleared for the pinned stratum's focus band; micro-drift sacrificed — the pin is worth more than a 0.5% creep.",
  },
];

/** Failure traces — entries that preserve something that broke. Feeds the chamber sub-readout. */
export const FAILURE_TRACE_COUNT = LOGS.filter(
  (log) => log.failureNote !== undefined
).length;
