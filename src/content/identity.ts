/**
 * identity.ts — the engineer, as typed data
 * (implementation-architecture §2: components never contain copy; all
 * text lives in content/ so the honesty law is enforceable in one
 * directory).
 *
 * Voice rules (identity.md §4): declarative, present tense, no
 * exclamation marks, no "passionate about", no first person (first
 * person is reserved for the Contact Node — CONTACT.sentence below is
 * the page's single first-person line). Every line here should
 * survive being read aloud by the facility.
 *
 * The terminal is another interface into this same module — commands
 * read these fields; nothing is duplicated into command strings.
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

/**
 * Engineering philosophy — condensed from context/engineering-philosophy.md,
 * verbatim where possible. Served by the terminal's `philosophy`
 * command; never rendered as homepage prose (the metaphor is not
 * explained, but the operator may be queried).
 */
export const PHILOSOPHY: readonly string[] = [
  "reliable systems are quieter than impressive ones.",
  "graceful degradation over fragile perfection; observability over blind optimism.",
  "a system that cannot explain its state cannot be trusted.",
  "silent failure is worse than loud failure.",
  "complexity must justify itself — every abstraction carries maintenance cost.",
  "the interesting problem: how intelligence behaves under constraints.",
];

/**
 * The facility's own record — what `open nexus` returns. Every line
 * is verifiable against this repository; no claim outlives the code.
 */
export const FACILITY = {
  designation: "NEXUS",
  title: "Systems Nexus",
  lines: [
    "server-rendered document first; the depth system is an enhancement layer.",
    "one lenis camera · one gsap engine · one pin (vault-track) · one live filter.",
    "telemetry aggregated server-side, revalidated 60s; failed sources degrade to omission, never simulation.",
    "reduced motion is the ssr document — designed, not disabled.",
    "content lives in typed modules; the honesty law is enforceable in one directory.",
  ],
} as const;

/**
 * Contact Node content (homepage-experience §4.6).
 * CONTACT.sentence is the only first-person copy on the page.
 *
 * HONESTY: channels must resolve. The resume is offered on request
 * through the channel until a real PDF ships under /public — a
 * pointing link to a missing file would be a fake artifact.
 */
export interface ContactChannel {
  id: "email" | "github" | "linkedin" | "resume";
  label: string;
  value: string;
  href: string;
}

export const CONTACT = {
  sentence:
    "If something here is worth building on, I read every transmission.",
  channels: [
    { id: "phone",
      label: "phone",
      value: "+919835428707",
      href: "tel:+919835428707",
    },
    {
      id: "email",
      label: "email",
      value: "advaysinhaa@gmail.com",
      href: "mailto:advaysinhaa@gmail.com",
    },
    {
      id: "github",
      label: "github",
      value: "github.com/advay-sinha",
      href: "https://github.com/advay-sinha",
    },
    {
      id: "linkedin",
      label: "linkedin",
      value: "linkedin.com/in/advay-sinha",
      href: "https://linkedin.com/in/advay-sinha",
    },
    {
      id: "resume",
      label: "resume",
      value: "on request via channel",
      href: "mailto:advaysinhaa@gmail.com?subject=resume%20request",
    },
  ] satisfies readonly ContactChannel[],

  /** Channel state — mono readouts for the availability panel and `status`. */
  state: [
    { term: "channel", value: "communication channel available" },
    { term: "mode", value: "async-first preferred" },
    { term: "response latency", value: "variable" },
    {
      term: "domains",
      value: "orchestration systems · retrieval infrastructure · backend clarity",
    },
  ],
} as const;
