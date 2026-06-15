/**
 * systems.ts — the System Vault's records, as typed data
 * (implementation-architecture §2; storytelling.md §2: every system is
 * an operational response to a constraint, never an achievement).
 *
 * HONESTY LAW (review this file, not the components):
 * every record below maps 1:1 to a real repository under
 * github.com/advay-sinha; stacks, architectures, and fallback notes are
 * taken from each repo's README. Statuses are operational truth.
 * The vault sub-readout counts derive from this array — fixing this
 * file fixes the page.
 */

export type SystemStatus = "operational" | "experimental" | "archived";

export type SchematicId = "marp" | "ats" | "floatchat" | "mockai";

export type ArtifactKind =
  | "diagram"
  | "deployment-trace"
  | "telemetry-snapshot"
  | "screenshot"
  | "log-excerpt";

/**
 * Operational evidence captured from a running system — never a
 * mockup, never an illustration. HONESTY: `src` must point at a real
 * file under /public, and `text` must be a verbatim excerpt (a trace,
 * a log, a config) — an artifact entry without its real capture is a
 * fake claim and fails review. Dossiers render artifacts only when
 * this array exists — absence is silent, not an empty state.
 */
interface ArtifactBase {
  kind: ArtifactKind;
  title: string;
  /** Which operation this was captured from — the provenance line. */
  caption: string;
}

export type ArtifactRecord =
  /** Image capture under /public, e.g. "/artifacts/marp-trace.png". */
  | (ArtifactBase & { src: string; text?: never })
  /** Verbatim text capture — log excerpts, traces, terminal output. */
  | (ArtifactBase & { text: string; src?: never });

export interface DossierRecord {
  /** Operational overview — what the system is, why it exists. */
  overview: string;
  /** Architecture narrative — topology, pipelines, contracts. */
  architecture: string;
  /** The constraints that shaped the design. */
  constraints: readonly string[];
  /** Deliberate tradeoffs, stated plainly. */
  tradeoffs: readonly string[];
  /** Preserved degradation/failure traces — designed fallbacks, known limits. */
  failures: readonly string[];
  /** Engineering reasoning — why this shape and not another. */
  reasoning: string;
  /** Future work — honest, unpromised. */
  future: readonly string[];
  /** Captured operational evidence (diagrams, traces, snapshots). Optional — real files only. */
  artifacts?: readonly ArtifactRecord[];
}

export interface SystemRecord {
  slug: string;
  /** Mono designation, e.g. "PROJ.MARP / 01". */
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
  /** Public source — evidence over claims. */
  repo: string;
  /** Present only on archived systems. */
  archived?: { retired: string; note: string };
  /** Present only on systems with a full dossier route. */
  dossier?: DossierRecord;
}

export const SYSTEMS: readonly SystemRecord[] = [
  {
    slug: "multi-agentic-research-platform",
    designation: "PROJ.MARP / 01",
    title: "Multi-Agentic Research Platform",
    role: "evidence-grounded research over a five-stage agent pipeline",
    constraint:
      "Answers research questions only with claims it can verify — every stage traced, every citation grounded.",
    stack: [
      "python",
      "postgres + pgvector",
      "gemini embeddings",
      "typescript",
      "docker",
    ],
    status: "operational",
    summary:
      "A research assistant built as five single-responsibility agents — Planner, Retriever, Writer, Critic, Verifier — looping until the answer clears a confidence threshold, with claim-level verification and full execution traces.",
    schematicId: "marp",
    repo: "github.com/advay-sinha/Multiagentic-Research-Platform",
    dossier: {
      overview:
        "Multi-Agentic Research Platform is an evidence-grounded AI research system built around a five-stage agent pipeline: Planner, Retriever, Writer, Critic, and Verifier. The platform decomposes research queries into retrieval steps, performs vector search using PostgreSQL + pgvector, generates grounded answers from retrieved evidence, verifies claims against sources, and returns full execution traces with per-stage metrics. Built with FastAPI, PostgreSQL + pgvector, Gemini embeddings, TypeScript, Docker, and realtime SSE streaming.",
      architecture:
        "The Planner turns the question into a structured retrieval plan (typed PlanStep objects: sub-question plus search query). The Retriever runs cosine-similarity search against PostgreSQL with pgvector — embeddings generated through Gemini's embedContent API — and returns ranked chunks with source metadata and similarity scores. The Writer drafts from evidence, the Critic challenges the draft, and the Verifier checks claims before release; the Critic→Writer loop repeats until confidence clears the bar. Every agent emits typed trace events.",
      constraints: [
        "evidence grounding — no claim ships without a retrieval trail behind it",
        "bounded iteration — the critique loop must converge or stop at a hard cap, never spin",
        "LLM output fragility — structured JSON from a model cannot be assumed valid",
      ],
      tradeoffs: [
        "five single-responsibility agents over one omnibus prompt: more inference calls per question, but each stage emits typed traces and can be replaced without retraining the others",
        "loop-until-confident over single-pass answers: response latency deliberately spent on claim-level verification, bounded by a hard iteration cap so the spend cannot run away",
        "pgvector inside Postgres over a managed vector service: one database, one operational surface, one failure domain to observe",
      ],
      failures: [
        "the Planner's JSON parsing can fail on malformed LLM output — it degrades to treating the raw output as a single search query rather than aborting the run",
        "the Retriever returns an empty list gracefully when the vector store has nothing — downstream stages handle absence of evidence as a first-class state",
        "the Retriever currently executes only the first PlanStep of a multi-step plan — a known limit, preserved in the trace rather than papered over",
      ],
      reasoning:
          "Designed around single-responsibility agents with typed contracts and execution traces so each stage can be debugged, replaced, or evaluated independently. The system prioritizes evidence grounding, bounded iteration, and observable pipeline state over single-pass generation.",
      future: [
        "execute the full retrieval plan, not just its first step",
        "confidence calibration against held-out questions",
      ],
    },
  },
  {
    slug: "algo-trade-simulator",
    designation: "PROJ.ATS / 02",
    title: "Algo Trade Simulator",
    role: "trains and runs trading strategies against live markets, on simulated capital",
    constraint:
      "Lets strategies face real market data without letting simulated capital pretend to be real.",
    stack: [
      "fastapi",
      "react + vite + typescript",
      "mongodb (motor)",
      "yahoo finance api",
      "openai api",
    ],
    status: "operational",
    summary:
      "A full-stack simulation platform: live quotes and charts from Yahoo Finance, an SMA crossover strategy trained on five years of history serving signals against the current regime, simulated portfolios persisted in MongoDB, and a copilot that spins up simulations from natural language.",
    schematicId: "ats",
    repo: "github.com/advay-sinha/Algo-Trade-Simulator",
    dossier: {
      overview:
        "Algo Trade Simulator is a full-stack trading simulation platform for researching strategies against live market data without executing real trades. The platform streams live quotes and chart data from Yahoo Finance, trains SMA crossover strategies on historical data, generates realtime market signals, and manages simulated portfolios with persistent user sessions and analytics dashboards. Built with FastAPI, React + Vite, MongoDB, TypeScript, and OpenAI-assisted research tooling.",
      architecture:
        "The FastAPI backend handles market data ingestion, strategy training, authentication, portfolio simulations, and analytics APIs. The React + Vite frontend provides live charts, watchlists, portfolio views, strategy dashboards, and simulation management. Market data is sourced from Yahoo Finance APIs. Strategy training runs SMA crossover backtests against five years of historical data and generates live predictions from the latest market regime. User accounts, sessions, and simulations persist through MongoDB using Motor (async), with an optional in-memory mode for zero-setup local development. A hybrid chatbot copilot combines OpenAI completions with heuristic fallbacks to answer research queries and generate simulations from natural-language prompts.",
      constraints: [
        "market data dependency — the platform is downstream of a public quote API it does not control",
        "simulation honesty — signals come from the live regime, but execution stays simulated; the boundary is structural",
        "natural-language commands — the copilot must produce valid simulations from loose prompts or decline",
      ],
      tradeoffs: [
        "a hybrid copilot (LLM + heuristic fallbacks) over LLM-only: deterministic parsers carry simulation creation after model-only extraction produced malformed simulations from loose prompts",
        "an in-memory store option over Mongo-always: zero-setup local runs at the cost of persistence",
        "one strategy family first (SMA crossover) over a strategy zoo: a complete train→signal→simulate loop before breadth",
      ],
      failures: [
        "the copilot ships with configurable model fallbacks and heuristic paths — the design assumes the LLM route fails and routes around it",
        "the in-memory fallback exists because database connectivity is a real failure mode, not a hypothetical",
      ],
      reasoning:
        "Designed to separate market ingestion, strategy evaluation, portfolio simulation, and AI-assisted workflows into independent services so failures in one subsystem do not block the rest of the platform. Heuristic fallbacks were added alongside LLM-based parsing after model-only flows produced malformed simulation requests from loose prompts.",
      future: [
        "additional strategy families beyond SMA crossover",
        "richer execution modeling (slippage, latency) on the simulated book",
      ],
    },
  },
  {
    slug: "floatchat",
    designation: "PROJ.FLOAT / 03",
    title: "FloatChat",
    role: "conversational explorer for the ARGO ocean-float archive",
    constraint:
      "Makes a heavyweight scientific archive answerable in plain language, from a cached store that fits on one machine.",
    stack: [
      "python",
      "streamlit",
      "plotly · leaflet · cesium",
      "netcdf → parquet",
      "ollama (optional)",
    ],
    status: "operational",
    summary:
        "FloatChat is an interactive oceanographic data exploration platform built around the ARGO float archive. The application converts large NetCDF float datasets into cached Parquet stores for low-latency querying, then provides natural-language search, spatial filtering, statistical analysis, and scientific visualisations through a Streamlit interface. Users can explore float activity through Plotly maps, Cesium 3D views, depth profiles, Hovmöller diagrams, comparison tools, and chat-driven analytics focused on the Indian Ocean region.",
    schematicId: "floatchat",
    repo: "github.com/advay-sinha/FloatChat-AI",
    dossier: {
      overview:
      "FloatChat is an interactive oceanographic data exploration platform built around the ARGO float archive. The application converts large NetCDF float datasets into cached Parquet stores for low-latency querying, then provides natural-language search, spatial filtering, statistical analysis, and scientific visualisations through a Streamlit interface. Users can explore float activity through Plotly maps, Cesium 3D views, depth profiles, Hovmöller diagrams, comparison tools, and chat-driven analytics focused on the Indian Ocean region.",
      architecture:
        "An offline preprocessing pipeline converts ARGO NetCDF datasets into compact Parquet caches optimised for interactive querying. The Streamlit frontend coordinates visual exploration tabs, cached analytics, session state, and the chat interface. The query pipeline combines rule-based parsing with geocoding and statistical intent detection to translate natural-language prompts into temporal, spatial, and parameter filters against cached DataFrames. Matching results generate charts, summaries, profiles, and comparison views directly from the dataset. Optional fallback layers integrate DuckDuckGo snippets and locally hosted Ollama models when cached data cannot satisfy a query.",
      constraints: [
        "archive weight — raw NetCDF is too heavy to query interactively; conversion is a precondition, not an optimization",
        "query vocabulary — questions arrive as geography and oceanography ('PSAL near Lakshadweep'), not as column names",
        "offline-first — the explorer must answer from cache; external services are enrichment, never dependency",
      ],
      tradeoffs: [
        "pre-converted Parquet cache over live archive queries: NetCDF deserialization overhead exceeded conversational latency under interactive use, so that cost moved out of the request path into an offline step",
        "rule-parsed queries with LLM enrichment over LLM-first chat: deterministic answers from data, generative answers only at the edges",
        "Streamlit over a custom frontend: exploration breadth shipped ahead of interface ownership",
      ],
      failures: [
        "the fallback chain is explicit and ordered: cached data first; DuckDuckGo snippets when the cache cannot answer; locally generated context only if an Ollama model is actually running — each rung degrades, none pretend",
      ],
      reasoning:
        "Designed around an offline-first architecture so scientific queries resolve directly from cached datasets instead of depending on external APIs or live archive access. Deterministic parsing and statistical analysis remain the primary execution path, while LLM-based responses are treated as optional fallback layers rather than core infrastructure.",
      future: [
        "broader geographic focus beyond the Indian Ocean defaults",
        "deeper BGC parameter comparisons",
      ],
    },
  },
  {
    slug: "mock-ai",
    designation: "PROJ.MOCK / 04",
    title: "Mock AI",
    role: "AI mock-interview and assessment platform with voice interaction",
    constraint:
      "Generates and grades interviews with an LLM while keeping auth, sessions, and scoring accountable to a real backend.",
    stack: [
      "fastapi",
      "react 19",
      "mongodb",
      "gemini 2.0 flash",
      "web speech api",
      "jwt auth",
    ],
    status: "operational",
    summary:
      "An end-to-end interview platform: AI-generated mock tests tuned by subject, difficulty, and time limit; a voice-enabled interview simulator; per-session performance readouts — with JWT-secured sessions and MongoDB persistence underneath.",
    schematicId: "mockai",
    repo: "github.com/advay-sinha/Mock-AI",
    dossier: {
      overview:
      "MockAI is a full-stack mock interview and assessment platform that generates technical tests, simulates live interviews, and evaluates responses using Google Gemini. The platform combines a FastAPI backend with a React frontend to support AI-generated assessments, conversational onboarding, voice-enabled interview sessions, realtime feedback, and persistent performance tracking through MongoDB-backed user accounts and JWT-secured sessions.",
      architecture:
        "The React frontend handles onboarding flows, test-taking interfaces, dashboards, and browser-based voice interactions using Web Speech APIs. The FastAPI backend manages authentication, session handling, question generation, answer evaluation, and persistence services. Gemini 2.0 Flash powers both test generation and qualitative answer evaluation through backend-controlled API routes. MongoDB stores users, sessions, generated assessments, and evaluation history using Motor with pooled async connections and unique-email enforcement. The platform supports conversational test creation, role-specific interview simulations, timed prompts, speech synthesis, speech-to-text capture, and detailed feedback dashboards.",
      constraints: [
        "LLM accountability — generated questions and feedback flow through one backend service, never straight from the browser to the model",
        "session integrity — assessments mean nothing if identity and history are loose; JWT and unique-email enforcement are load-bearing",
        "voice latency — the capture → evaluation → synthesis round-trip must stay conversational without any server-side audio infrastructure to tune",
      ],
      tradeoffs: [
        "browser Web Speech APIs over a server-side ASR pipeline: zero audio infrastructure, at the cost of device-dependent recognition quality",
        "Gemini for both generation and evaluation over separate graders: one model contract, consistent rubric, single point of prompt discipline",
      ],
      failures: [
        "a reserved java-backend module sits in the repository, currently empty — an honest placeholder for planned integration rather than a hidden dead end",
      ],
      reasoning:
        "Designed to keep authentication, session management, question generation, and evaluation inside a centralized backend service instead of exposing model interactions directly to the client. Browser-native voice APIs were used to enable realtime interview flows without introducing dedicated audio-processing infrastructure.",
      future: [
        "the reserved Java service integration",
        "richer rubric-anchored scoring beyond qualitative feedback",
      ],
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
