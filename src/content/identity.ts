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
  role: "backend developer · ai/ml engineer",

  /**
   * The one Grotesk paragraph in the About chamber (≤65ch measure,
   * ≤4 lines). Every claim is verifiable against the resume in
   * context/: Zarva speech recognition, Alignerr model evaluation,
   * the systems in the vault. The closing phrase is the
   * engineering-philosophy thesis, verbatim.
   */
  summary:
    "I’m a Computer Science student and backend-focused developer"+
    " passionate about building scalable systems, AI-driven"+
    " applications, and high-performance web platforms. My work"+
    " spans backend engineering, speech recognition integrations,"+
    " algorithmic trading simulations, and full-stack development using"+
    " TypeScript, Node.js, React, MongoDB, and cloud technologies.",

  /**
   * What he genuinely enjoys building — the About chamber's one
   * personal mono line. Each item maps to a real system or role.
   */
  enjoys:
    "ML Infrastructure · retrieval systems · Finance simulators · " +
    "backend systems",

  /**
   * Mono readouts, never skill bars. Max 6 — the stagger cap is also
   * the content cap. Stacks are the resume's, verbatim subsets.
   */
  capabilities: [
    "backend — fastapi · spring boot · node.js",
    "ai/ml — pytorch · rag pipelines · rlhf evaluation",
    "data — postgresql · mongodb · chromadb",
    "realtime — websockets · speech recognition",
    "languages — python · java · c++ · typescript",
    "infra — docker · ci/cd · jwt auth",
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
  focus: "Real Life exposure · Large Projects",
  availability: "accepting opportunities",

  /** Facility local time — the engineer's zone, not the visitor's. */
  timeZone: "Asia/Kolkata",
  timeZoneLabel: "IST",
} as const;

/**
 * Session identity — operator@host, derived once here so the boot
 * sequence and the terminal can never disagree about whose machine
 * this is. Operator from the identity record, host from the facility
 * designation.
 */
const sessionUser = IDENTITY.name.split(" ")[0]?.toLowerCase() ?? "operator";
const sessionHost = "nexus";

export const SESSION = {
  user: sessionUser,
  host: sessionHost,
  prompt: `${sessionUser}@${sessionHost}:~$`,
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
 * HONESTY: channels must resolve. The resume channel points at the
 * real PDF under /public — the "updated" stamp tracks the file's
 * actual revision month and is bumped by hand when the PDF is.
 */
export interface ContactChannel {
  id: "email" | "github" | "linkedin" | "resume";
  label: string;
  value: string;
  href: string;
}

export const CONTACT = {
  sentence:
    "Signal Received — Let’s Connect",
  channels: [
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
      value: "pdf · updated 2026.06",
      href: "/AdvayResume.pdf",
    },
  ] satisfies readonly ContactChannel[],
} as const;
