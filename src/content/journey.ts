/**
 * journey.ts — the engineer's chronology, as typed data
 * (implementation-architecture §2: components never contain copy).
 *
 * Phase 14: this module replaces the project-operations log as the
 * DEPTH.03 content source. Same ledger discipline, new subject — the
 * record is now education, roles, and competitions: an engineer's
 * historical operations ledger, not a resume.
 *
 * HONESTY LAW (review this file, not the components):
 * every entry derives from context/AdvayResume.pdf, context/Profile.pdf
 * or context/certificates.txt. Terse operational tone, no heroism, no
 * invented metrics. Timestamps are month-precision where the source
 * gives a month, year-precision where it doesn't — finer would be
 * invented.
 */

export type JourneyType =
  | "education"
  | "experience"
  | "competition"
  | "leadership";

export interface JourneyEntry {
  /** Archive designation, e.g. "REC.2024.08". */
  id: string;
  /** ISO timestamp of the record's start ("YYYY-MM" or "YYYY") — honest precision only. */
  timestamp: string;
  /** Human span readout, e.g. "2024.08 – present". */
  span: string;
  /** Institution / organization. */
  org: string;
  type: JourneyType;
  title: string;
  /** What happened — operational record, 1–2 lines. */
  summary: string;
  /** Where it stands — present state, mono outcome line. */
  outcome?: string;
  /**
   * Emphasis is typographic, never chromatic: "high" records take full
   * text color (wins, the present), standard hold the muted register.
   */
  weight: "standard" | "high";
}

/** Chronological, oldest first — the spine carries current through old records toward the present. */
export const JOURNEY: readonly JourneyEntry[] = [
  {
    id: "REC.2022",
    timestamp: "2022",
    span: "– 2022",
    org: "Kairali School, Ranchi",
    type: "education",
    title: "Schooling through class 10",
    summary:
      "Foundation years. Mathematics and computers begin as subjects, end as the default way of looking at problems.",
    weight: "standard",
  },
  {
    id: "REC.2022.04",
    timestamp: "2022-04",
    span: "2022 – 2024",
    org: "Delhi Public School, Ranchi",
    type: "education",
    title: "Senior secondary — science (maths), CBSE",
    summary:
      "10+2 with the maths track. First sustained programming, first builds that outlived the assignment.",
    outcome: "board score: 93%.",
    weight: "standard",
  },
  {
    id: "REC.2024.08",
    timestamp: "2024-08",
    span: "2024.08 – 2028.05",
    org: "Bennett University, Greater Noida",
    type: "education",
    title: "B.Tech, Computer Science and Engineering — AI specialization",
    summary:
      "Core systems coursework in parallel with shipped work: the projects in the vault and both engineering roles run alongside the degree.",
    outcome: "in progress · cgpa 8.85 / 10.",
    weight: "standard",
  },
  {
    id: "REC.2024.11a",
    timestamp: "2024-11",
    span: "2024.11 – 2025.10",
    org: "Enactus, Bennett University",
    type: "leadership",
    title: "Project management, junior core",
    summary:
      "One tenure of project coordination across social-enterprise builds — scope, schedules, and people instead of endpoints.",
    weight: "standard",
  },
  {
    id: "REC.2024.11b",
    timestamp: "2024-11",
    span: "2024.11 – 2025.12",
    org: "Zarva, Greater Noida",
    type: "experience",
    title: "Backend developer — speech recognition & safety infrastructure",
    summary:
      "Engineered a real-time speech recognition system and 5+ REST APIs for live call connectivity — instant distress detection across 100+ active cab rides. Built a routing algorithm over crime datasets with graph-theoretic path optimisation, cutting risk-exposure scores 40% in high-incident zones.",
    outcome: "shipped to production; first engineering role.",
    weight: "high",
  },
  {
    id: "REC.2025a",
    timestamp: "2025",
    span: "2025",
    org: "Mobile Next — MOBILON App Showcase",
    type: "competition",
    title: "1st place among 40+ teams",
    summary:
      "Demonstrated Zarva's full safety stack — speech recognition, distress detection, safe routing — to a panel of industry judges.",
    weight: "high",
  },
  {
    id: "REC.2025.09",
    timestamp: "2025-09",
    span: "2025.09",
    org: "Smart India Hackathon — Bennett University",
    type: "competition",
    title: "SIH qualifier — top 100",
    summary:
      "Qualified the internal Smart India Hackathon round among the top 100 campus teams; certificate of achievement on record.",
    weight: "standard",
  },
  {
    id: "REC.2026.01",
    timestamp: "2026-01",
    span: "2026.01 – present",
    org: "Alignerr (freelance, remote)",
    type: "experience",
    title: "AI data & evaluation contractor — frontier model alignment",
    summary:
      "Structured data labelling and adversarial prompt evaluation for frontier AI systems (clients including Anthropic) — 10+ evaluation cycles across code generation, reasoning, and instruction-following, feeding RLHF pipeline updates.",
    outcome: "ongoing.",
    weight: "high",
  },
];

/** Span readout for the chamber sub-line — derived, never hardcoded. */
export const JOURNEY_SPAN = `${JOURNEY[0].timestamp.slice(0, 4)} – present`;
