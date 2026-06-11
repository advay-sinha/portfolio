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
    "more than the demo: multi-agent orchestration, real-time speech " +
    "pipelines, probabilistic market simulation. The recurring " +
    "problem: how intelligence behaves under constraints.",

  /** Mono readouts, never skill bars. Max 6 — the stagger cap is also the content cap. */
  capabilities: [
    "multi-agent orchestration",
    "speech & realtime inference",
    "backend architecture",
    "distributed coordination",
    "observability & reliability",
    "probabilistic reasoning",
  ],

  /**
   * The flagship systems (identity.md §2). Count feeds the boot line
   * `> N systems operational` — derived, never hardcoded, so the boot
   * can't drift from the vault. Full records move to content/systems.ts
   * when the Vault chamber lands.
   */
  systems: [
    "Multi-Agent Research Platform",
    "Algorithmic Trading Simulator",
    "Speech Recognition Backend",
  ],

  /** Current operational direction — real, singular, updated by hand when it changes. */
  focus: "agent coordination · inference pipelines",
  availability: "channel open",

  /** Facility local time — the engineer's zone, not the visitor's. */
  timeZone: "Asia/Kolkata",
  timeZoneLabel: "IST",
} as const;
