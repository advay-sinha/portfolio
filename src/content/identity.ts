/**
 * identity.ts — the engineer, as typed data
 * (implementation-architecture §2: components never contain copy; all
 * text lives in content/ so the honesty law is enforceable in one
 * directory).
 *
 * Voice rules (identity.md §4): declarative, present tense, no
 * exclamation marks, no "passionate about", no first person (first
 * person is reserved for the Contact Node). Every line here should
 * survive being read aloud by the facility.
 */

export const IDENTITY = {
  name: "Advay Sinha",
  /** Rendered as a MonoLabel — uppercase + tracking applied by type, not by copy. */
  role: "systems engineer · ai infrastructure",

  /**
   * The one Grotesk paragraph in the Neural Core (≤65ch measure,
   * ≤4 lines). Constraint-first per storytelling.md §2.1; the closing
   * phrase is the engineering-philosophy thesis, verbatim.
   */
  summary:
    "Designs backend systems where behavior under pressure matters " +
    "more than the demo: multi-agent research pipelines, market " +
    "simulation, conversational data systems. The recurring " +
    "problem: how intelligence behaves under constraints.",

  /** Mono readouts, never skill bars. Max 6 — the stagger cap is also the content cap. */
  capabilities: [
    "multi-agent orchestration",
    "retrieval & evidence grounding",
    "backend architecture",
    "llm integration & fallback design",
    "data pipelines & visualization",
    "auth, sessions & persistence",
  ],

  /**
   * The flagship systems — mirrors content/systems.ts (the vault's
   * records, each mapped to a real repository). Count feeds the boot
   * line `> N systems operational` — derived, never hardcoded, so the
   * boot can't drift from the vault.
   */
  systems: [
    "Multi-Agentic Research Platform",
    "Algo Trade Simulator",
    "FloatChat",
    "Mock AI",
  ],

  /** Current operational direction — real, singular, updated by hand when it changes. */
  focus: "agent pipelines · evidence-grounded retrieval",
  availability: "channel open",

  /** Facility local time — the engineer's zone, not the visitor's. */
  timeZone: "Asia/Kolkata",
  timeZoneLabel: "IST",
} as const;
