/**
 * systems.ts — the System Vault's records, as typed data
 * (implementation-architecture §2; storytelling.md §2: every system is
 * an operational response to a constraint, never an achievement).
 *
 * HONESTY LAW (review this file, not the components):
 * every record below must describe a real system, a real stack, a real
 * constraint, and an honest status. Statuses are operational truth:
 *   operational  — deployed/usable today
 *   experimental — running, conclusions not yet trusted
 *   archived     — retired, kept as an operational scar
 * Nothing here renders a number that isn't true. The vault sub-readout
 * counts are derived from this array — fixing this file fixes the page.
 */

export type SystemStatus = "operational" | "experimental" | "archived";

export type SchematicId = "marp" | "ats" | "srb";

export interface DossierRecord {
  /** Operational overview — what the system is, why it exists. */
  overview: string;
  /** Architecture narrative — topology, pipelines, contracts. */
  architecture: string;
  /** The constraints that shaped the design. */
  constraints: readonly string[];
  /** Deliberate tradeoffs, stated plainly. */
  tradeoffs: readonly string[];
  /** Preserved failure traces — what broke, what was learned. */
  failures: readonly string[];
  /** Engineering reasoning — why this shape and not another. */
  reasoning: string;
  /** Future work — honest, unpromised. */
  future: readonly string[];
}

export interface SystemRecord {
  slug: string;
  /** Mono designation, e.g. "SYS.MARP / 01". */
  designation: string;
  title: string;
  /** One-line system role — what it does in the larger graph. */
  role: string;
  /** Constraint-first lead (storytelling §2.1): the pressure, not the feature. */
  constraint: string;
  /** Infrastructure, not badges. */
  stack: readonly string[];
  status: SystemStatus;
  summary: string;
  schematicId: SchematicId | null;
  /** Present only on archived systems. */
  archived?: { retired: string; note: string };
  /** Present only on systems with a full dossier route. */
  dossier?: DossierRecord;
}

export const SYSTEMS: readonly SystemRecord[] = [
  {
    slug: "multi-agent-research-platform",
    designation: "SYS.MARP / 01",
    title: "Multi-Agent Research Platform",
    role: "orchestrates concurrent research agents over shared sources",
    constraint:
      "Coordinates concurrent research agents without shared-state corruption.",
    stack: ["python", "fastapi", "redis pub/sub", "postgres", "llm inference api"],
    status: "operational",
    summary:
      "A coordination layer where planner and worker agents divide a research question, work sources in parallel, and merge findings under explicit ownership contracts.",
    schematicId: "marp",
    dossier: {
      overview:
        "MARP exists because a single agent reading sources serially is slow and a swarm of agents writing to one scratchpad is worse. The platform turns a research question into a task graph, assigns each node to a worker agent, and merges results through a single aggregation point.",
      architecture:
        "A planner agent decomposes the question and publishes tasks to a Redis-backed queue. Worker agents claim tasks, hold exclusive ownership of their output slots, and report through a merge stage that is the only writer to the final record. Postgres holds the task graph and provenance; nothing reaches the merged result without a source trail.",
      constraints: [
        "concurrent writes — two agents must never own the same state",
        "token budgets — each worker operates under a hard context ceiling",
        "partial failure — a stalled agent cannot stall the graph",
      ],
      tradeoffs: [
        "determinism over autonomy: agents follow the task graph; they do not negotiate with each other",
        "one merge writer over parallel merging: slower, but conflicts are structurally impossible",
        "provenance overhead accepted: every claim costs a lookup, and is worth it",
      ],
      failures: [
        "v0 used a shared scratchpad all agents could append to; under concurrency, interleaved writes corrupted citations and the merge stage could not untangle authorship — replaced with exclusive output slots",
        "early retry logic re-queued stalled tasks without invalidating the first claim, producing duplicate findings until claims got lease timestamps",
      ],
      reasoning:
        "The interesting problem was never the model — it was how intelligence behaves under constraints: which coordination contract keeps N partially-reliable workers from destroying each other's work. Ownership contracts are boring, and boring is what survives concurrency.",
      future: [
        "lease-based agent health checks instead of fixed timeouts",
        "source-quality scoring feeding back into the planner",
      ],
    },
  },
  {
    slug: "algorithmic-trading-simulator",
    designation: "SYS.ATS / 02",
    title: "Algorithmic Trading Simulator",
    role: "stress-tests strategies against probabilistic market behavior",
    constraint:
      "Separates strategy logic from execution risk so a bad idea fails visibly, not silently.",
    stack: ["python", "pandas", "numpy", "websocket feeds", "postgres"],
    status: "experimental",
    summary:
      "An event-driven simulation loop where strategies consume normalized market events and every order passes a risk stage before touching the ledger — built to study distribution behavior, not to promise returns.",
    schematicId: "ats",
    dossier: {
      overview:
        "ATS exists to answer one question honestly: does a strategy's edge survive realistic noise, latency, and slippage, or does it only exist in a clean backtest? It is a laboratory, not a trading product, and its status is experimental on purpose.",
      architecture:
        "Market data streams through a normalization stage into an event loop. Strategies are pure consumers: events in, intents out. Every intent passes a risk gate — position limits, exposure ceilings, sanity bounds — before the ledger records it. The ledger is append-only; the simulation can be replayed deterministically from any point.",
      constraints: [
        "look-ahead leakage — strategies must be structurally unable to see the future",
        "probabilistic realism — fills, latency, and slippage are sampled, not assumed perfect",
        "replayability — identical seed, identical run, or the experiment is worthless",
      ],
      tradeoffs: [
        "event-driven over vectorized backtesting: an order of magnitude slower, but immune to whole classes of leakage bugs",
        "simulated fills over broker integration: less realistic, deliberately out of scope — risk study first",
      ],
      failures: [
        "first backtest results looked excellent until the fill model was audited: orders were filling at the same bar's close they were decided on — classic look-ahead, fixed by enforcing next-event fills",
        "an early risk gate only checked per-order size, letting many small orders accumulate unbounded exposure; limits are now stateful per position",
      ],
      reasoning:
        "Trading systems are where probabilistic reasoning stops being abstract: every design decision is a statement about distributions. Keeping strategy, risk, and ledger as separate contracts means each can be wrong independently — and observed being wrong.",
      future: [
        "regime-conditioned noise models",
        "latency distribution sampling from recorded feed timing",
      ],
    },
  },
  {
    slug: "speech-recognition-backend",
    designation: "SYS.SRB / 03",
    title: "Speech Recognition Backend",
    role: "streams audio to text under a real-time latency budget",
    constraint:
      "Holds transcription latency inside a conversational budget while the input never stops arriving.",
    stack: ["python", "fastapi", "whisper", "websockets", "redis"],
    status: "operational",
    summary:
      "A streaming pipeline — voice activity detection, chunked inference, ordered reassembly — designed around the fact that milliseconds alter perception in live speech.",
    schematicId: "srb",
    dossier: {
      overview:
        "SRB turns a continuous audio stream into ordered text without letting inference time accumulate into conversation-breaking lag. It is the second version of this system; the first is preserved on the archive shelf as the reason this one exists.",
      architecture:
        "Audio arrives over a websocket and passes voice-activity detection, which cuts the stream into utterance chunks instead of fixed windows. Chunks queue through Redis to inference workers; results carry sequence numbers and reassemble in order before egress. Backpressure propagates to the chunker — when inference saturates, chunks widen rather than queue unboundedly.",
      constraints: [
        "latency budget — end-to-end transcription must stay conversational under load",
        "stream ordering — parallel inference must never emit text out of sequence",
        "backpressure — slow inference must degrade chunking, not grow the queue",
      ],
      tradeoffs: [
        "VAD-cut chunks over fixed windows: more moving parts, far fewer mid-word cuts",
        "ordered reassembly over fastest-first emission: slightly higher median latency, no corrections ever shown to the user",
      ],
      failures: [
        "v1 ran whole-utterance inference serially and hit a latency ceiling that no model swap could fix — the architecture, not the model, was the bottleneck; v1 is archived with that note",
        "an early backpressure design dropped chunks under load, which read as the system mishearing; widening chunks under pressure proved the honest degradation",
      ],
      reasoning:
        "Real-time systems change what latency means: it stops being a metric and becomes the product. Every architectural choice in SRB is the same choice — degrade visibly and gracefully rather than queue invisibly and collapse.",
      future: [
        "speculative partial transcripts with explicit revision marks",
        "per-speaker stream separation",
      ],
    },
  },
  {
    slug: "speech-pipeline-v1",
    designation: "SYS.SRB / 03-A",
    title: "Speech Inference Pipeline v1",
    role: "first-generation serial transcription service",
    constraint: "Proved the product; could not hold the latency budget.",
    stack: ["python", "flask", "whisper"],
    status: "archived",
    summary:
      "Whole-utterance, serial inference behind a request endpoint. Worked, then hit a hard latency ceiling under concurrent streams.",
    schematicId: null,
    archived: {
      retired: "2025.03",
      note: "v2 replaced it after the latency ceiling — the bottleneck was the architecture, not the model.",
    },
  },
  {
    slug: "single-agent-research-assistant",
    designation: "SYS.MARP / 01-A",
    title: "Single-Agent Research Assistant",
    role: "one agent, one context window, serial source reading",
    constraint: "Context ceilings made deep research serial and shallow.",
    stack: ["python", "llm inference api"],
    status: "archived",
    summary:
      "The predecessor to MARP: a single agent reading sources in sequence until the context window — not the question — decided when research ended.",
    schematicId: null,
    archived: {
      retired: "2025.08",
      note: "superseded by MARP — the orchestration layer was the missing system, not a better prompt.",
    },
  },
];

export const ACTIVE_SYSTEMS = SYSTEMS.filter((s) => s.status !== "archived");
export const ARCHIVED_SYSTEMS = SYSTEMS.filter((s) => s.status === "archived");
export const EXPERIMENTAL_COUNT = SYSTEMS.filter(
  (s) => s.status === "experimental"
).length;

export function systemBySlug(slug: string): SystemRecord | undefined {
  return SYSTEMS.find((s) => s.slug === slug);
}
