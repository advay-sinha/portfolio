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
    designation: "SYS.MARP / 01",
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
        "MARP exists because a single LLM call cannot be audited: it answers, but it cannot show its work. The platform decomposes research into five specialized agents in sequence, iterates until the answer meets a confidence threshold or hits the iteration cap, and returns every step traced and timed for inspection.",
      architecture:
        "The Planner turns the question into a structured retrieval plan (typed PlanStep objects: sub-question plus search query). The Retriever runs cosine-similarity search against PostgreSQL with pgvector — embeddings generated through Gemini's embedContent API — and returns ranked chunks with source metadata and similarity scores. The Writer drafts from evidence, the Critic challenges the draft, and the Verifier checks claims before release; the Critic→Writer loop repeats until confidence clears the bar. Every agent emits typed trace events.",
      constraints: [
        "evidence grounding — no claim ships without a retrieval trail behind it",
        "bounded iteration — the critique loop must converge or stop at a hard cap, never spin",
        "LLM output fragility — structured JSON from a model cannot be assumed valid",
      ],
      tradeoffs: [
        "five single-responsibility agents over one omnibus prompt: more inference calls, but each stage is inspectable and replaceable",
        "loop-until-confident over single-pass answers: latency spent buying reliability",
        "pgvector inside Postgres over a managed vector service: one database, one operational surface",
      ],
      failures: [
        "the Planner's JSON parsing can fail on malformed LLM output — it degrades to treating the raw output as a single search query rather than aborting the run",
        "the Retriever returns an empty list gracefully when the vector store has nothing — downstream stages handle absence of evidence as a first-class state",
        "the Retriever currently executes only the first PlanStep of a multi-step plan — a known limit, preserved in the trace rather than papered over",
      ],
      reasoning:
        "The interesting problem was never the model — it was how intelligence behaves under constraints: what pipeline shape makes an LLM's answer auditable instead of plausible. Single-responsibility stages with typed contracts and traces are boring, and boring is what can be debugged.",
      future: [
        "execute the full retrieval plan, not just its first step",
        "confidence calibration against held-out questions",
      ],
    },
  },
  {
    slug: "algo-trade-simulator",
    designation: "SYS.ATS / 02",
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
        "ATS exists to research strategies without risking capital: stream the real market, trade a simulated book. The FastAPI backend owns market data, strategy training, accounts, and simulations; the React + Vite frontend surfaces live charts, portfolio stats, and trained strategies through a home analytics dashboard.",
      architecture:
        "Live quotes, charts, and intraday stats stream from Yahoo Finance for any searchable ticker. The strategy engine trains an SMA crossover on five years of historical data and serves live signals against the latest market regime. Accounts, sessions, and simulations persist in MongoDB through Motor (async), with an in-memory store available for quick local runs. A hybrid chatbot copilot — OpenAI chat completions with heuristic fallbacks — answers research questions and creates simulations from prompts like 'create a simulation for AAPL with 25k'. Sessions restore from browser storage.",
      constraints: [
        "market data dependency — the platform is downstream of a public quote API it does not control",
        "simulation honesty — signals come from the live regime, but execution stays simulated; the boundary is structural",
        "natural-language commands — the copilot must produce valid simulations from loose prompts or decline",
      ],
      tradeoffs: [
        "a hybrid copilot (LLM + heuristic fallbacks) over LLM-only: research assistance keeps working when the model path is unavailable or wrong",
        "an in-memory store option over Mongo-always: zero-setup local runs at the cost of persistence",
        "one strategy family first (SMA crossover) over a strategy zoo: a complete train→signal→simulate loop before breadth",
      ],
      failures: [
        "the copilot ships with configurable model fallbacks and heuristic paths — the design assumes the LLM route fails and routes around it",
        "the in-memory fallback exists because database connectivity is a real failure mode, not a hypothetical",
      ],
      reasoning:
        "Trading systems make probabilistic reasoning concrete: a strategy's edge either survives the live regime or it doesn't, and a simulated ledger makes being wrong cheap and visible. Keeping data, strategy, and persistence as separate services means each can fail — and be observed failing — independently.",
      future: [
        "additional strategy families beyond SMA crossover",
        "richer execution modeling (slippage, latency) on the simulated book",
      ],
    },
  },
  {
    slug: "floatchat",
    designation: "SYS.FLOAT / 03",
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
      "An interactive explorer for ARGO float data, Indian Ocean focus: maps, depth profiles, Hovmöller diagrams, float comparisons — and a natural-language assistant that turns questions about places, time windows, and statistics into charts and summaries.",
    schematicId: "floatchat",
    repo: "github.com/advay-sinha/FloatChat-AI",
    dossier: {
      overview:
        "FloatChat exists because oceanographic archives are rich and unreadable: NetCDF files, instrument jargon, no interface for a question like 'average salinity near Odisha in March 2023'. The application turns the ARGO float archive into an explorable dashboard with a chat layer that understands the data's own vocabulary.",
      architecture:
        "An offline converter prepares the archive — NetCDF into Parquet — so the live application reads a compact cached store. Streamlit drives the interface: Plotly maps, a static Leaflet view, a Cesium 3D globe, depth profiles, Hovmöller diagrams, float-to-float comparisons, raw tables, and export utilities, blended with NOAA buoy metadata and INCOIS mooring overlays. The chat layer parses places, coordinates, time windows, statistics, and nearest-float lookups against the cache, answering with inline charts and aggregated summaries.",
      constraints: [
        "archive weight — raw NetCDF is too heavy to query interactively; conversion is a precondition, not an optimization",
        "query vocabulary — questions arrive as geography and oceanography ('PSAL near Lakshadweep'), not as column names",
        "offline-first — the explorer must answer from cache; external services are enrichment, never dependency",
      ],
      tradeoffs: [
        "pre-converted Parquet cache over live archive queries: a deliberate preparation step buys interactive latency",
        "rule-parsed queries with LLM enrichment over LLM-first chat: deterministic answers from data, generative answers only at the edges",
        "Streamlit over a custom frontend: exploration breadth shipped ahead of interface ownership",
      ],
      failures: [
        "the fallback chain is explicit and ordered: cached data first; DuckDuckGo snippets when the cache cannot answer; locally generated context only if an Ollama model is actually running — each rung degrades, none pretend",
      ],
      reasoning:
        "Scientific data systems earn trust by answering from the data, not about it. Keeping the deterministic path (cache, statistics, charts) primary and the generative path explicitly secondary is the same degradation discipline as any backend: visible fallbacks, honest absence.",
      future: [
        "broader geographic focus beyond the Indian Ocean defaults",
        "deeper BGC parameter comparisons",
      ],
    },
  },
  {
    slug: "mock-ai",
    designation: "SYS.MOCK / 04",
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
      "An end-to-end interview platform: AI-generated mock tests tuned by subject, difficulty, and time limit; a voice-enabled interview simulator; real-time performance dashboards — with JWT-secured sessions and MongoDB persistence underneath.",
    schematicId: "mockai",
    repo: "github.com/advay-sinha/Mock-AI",
    dossier: {
      overview:
        "Mock AI exists because interview practice needs an examiner that scales: something that writes questions for a specific subject and difficulty, listens to answers, and returns feedback specific enough to act on. The platform pairs a FastAPI service with a React single-page app and puts Gemini behind both question generation and qualitative evaluation.",
      architecture:
        "The React frontend drives conversational onboarding — intent capture through test execution and analysis — plus a voice-enabled interview simulator using browser speech synthesis and speech-to-text with timed prompts. The FastAPI service owns authentication (hashed passwords, JWT via python-jose), question generation, and answer evaluation against Gemini 2.0 Flash. MongoDB persists users and sessions through Motor with unique-email enforcement and pooled connections; dashboards render performance and improvement recommendations in real time.",
      constraints: [
        "LLM accountability — generated questions and feedback flow through one backend service, never straight from the browser to the model",
        "session integrity — assessments mean nothing if identity and history are loose; JWT and unique-email enforcement are load-bearing",
        "voice latency — the interview simulator must keep speech capture and synthesis conversational in the browser",
      ],
      tradeoffs: [
        "browser Web Speech APIs over a server-side ASR pipeline: zero audio infrastructure, at the cost of device-dependent recognition quality",
        "Gemini for both generation and evaluation over separate graders: one model contract, consistent rubric, single point of prompt discipline",
      ],
      failures: [
        "a reserved java-backend module sits in the repository, currently empty — an honest placeholder for planned integration rather than a hidden dead end",
      ],
      reasoning:
        "Putting an LLM inside a product is an infrastructure problem wearing an AI costume: the model is the easy part; auth, persistence, and making feedback traceable to a stored session are what make the assessment worth anything.",
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
