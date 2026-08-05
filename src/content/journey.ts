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
    span: "Till 2022",
    org: "Kairali School, Ranchi",
    type: "education",
    title: "Schooling upto X",
    summary:
      "",
    outcome: "CBSE board score: 94%.",
    weight: "standard",
  },
  {
    id: "REC.2022.04",
    timestamp: "2022-04",
    span: "2022 – 2024",
    org: "Delhi Public School, Ranchi",
    type: "education",
    title: "Senior secondary(XII) — Science (maths)",
    summary:
      "",
    outcome: "CBSE board score: 93%.",
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
      "",
    outcome: "in progress · cgpa 8.7 / 10.",
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
    title: "Backend software developer — speech recognition & safety infrastructure",
    summary:
      "Engineered a real-time speech recognition pipeline and 5+ REST APIs over WebSockets for live call connectivity — instant distress detection across 100+ concurrent cab rides. Built a graph-theoretic shortest-path routing algorithm over integrated crime datasets, cutting risk-exposure scores 40% in high-incident zones.",
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
      "Won on Zarva's real-time cab-safety system — WebSocket call streaming, live distress detection, risk-aware routing — demonstrated to a panel of industry judges.",
    weight: "high",
  },
  {
    id: "REC.2025.09",
    timestamp: "2025-09",
    span: "2025.09",
    org: "Smart India Hackathon — Bennett University",
    type: "competition",
    title: "SIH 2025 — pre-national selection stage",
    summary:
      "Advanced to the pre-national selection stage among 450+ competing teams; certificate of achievement on record.",
    weight: "standard",
  },
  {
    id: "REC.2026.01",
    timestamp: "2026-01",
    span: "2026.01 – 2026.06",
    org: "Alignerr (freelance, remote)",
    type: "experience",
    title: "AI data & evaluation contractor — frontier model alignment",
    summary:
      "Evaluated and labelled large-scale model-output datasets for frontier AI systems (clients including Anthropic) against structured rubrics — 10+ evaluation cycles, plus adversarial test cases probing logical and algorithmic edge cases across code generation, reasoning, and multi-step instruction-following.",
    outcome: "contract closed.",
    weight: "high",
  },
  {
    id: "REC.2026.06",
    timestamp: "2026-06",
    span: "2026.06 – 2026.07",
    org: "Airports Authority of India — JP Narayan Int’l Airport, Patna",
    type: "experience",
    title: "Software engineering intern — networks & cybersecurity",
    summary:
      "Architected and deployed NIMS: ML intrusion detection, telemetry health prediction, and configuration auditing unified across the airport’s multi-vendor campus network (Huawei, Cisco, Hirschmann, Sophos). Field-validated a read-only ingestion layer — SNMPv3 polling, traps, syslog, SSH, SIEM API — against a production Huawei S5720, surfacing 87 configuration findings with rollback-verified dry-run remediation.",
    outcome: "read-only by construction: no code path can modify a device.",
    weight: "high",
  },
];

/** Span readout for the chamber sub-line — derived, never hardcoded. */
export const JOURNEY_SPAN = `${JOURNEY[0].timestamp.slice(0, 4)} – present`;
