import {
  GITHUB_USER,
  TELEMETRY_REVALIDATE_S,
  TELEMETRY_TIMEOUT_MS,
} from "@/content/telemetry-sources";

/**
 * telemetry.ts — real telemetry aggregation, server-only by usage
 * (implementation-architecture §13, §14: fetched server-side, ISR
 * semantics, never client-polled on a portfolio).
 *
 * One function, two consumers: the /api/telemetry route handler and
 * the LiveSystems server component call the same aggregation, so the
 * API and the chamber can never disagree. Next's fetch cache (60s
 * revalidate) dedupes between them.
 *
 * Degradation contract:
 * - every upstream fetch carries a hard timeout (TELEMETRY_TIMEOUT_MS)
 *   and returns null on any failure — no throw escapes this module;
 * - a source that fails simply doesn't appear in the aggregate;
 * - if EVERY source fails, getTelemetry() returns null and the Live
 *   chamber quietly omits itself (no empty-state UI);
 * - secrets (GITHUB_TOKEN) are read here, used in request headers, and
 *   never serialized into the aggregate.
 */

export interface RepoActivity {
  name: string;
  /** ISO timestamp of the last push — absolute, never relative (no staleness lies). */
  pushedAt: string;
}

export interface RepositoryTelemetry {
  publicRepos: number | null;
  /** Most recently pushed repositories, descending. */
  recent: readonly RepoActivity[];
}

export interface DeploymentTelemetry {
  /** Vercel environment: production / preview. */
  env: string;
  commit: string | null;
  branch: string | null;
}

export interface Telemetry {
  generatedAt: string;
  repository: RepositoryTelemetry | null;
  deployment: DeploymentTelemetry | null;
}

async function fetchGithub(path: string): Promise<unknown | null> {
  const token = process.env.GITHUB_TOKEN;
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token !== undefined ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: TELEMETRY_REVALIDATE_S },
      signal: AbortSignal.timeout(TELEMETRY_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch {
    // Timeout, network, DNS — all degrade identically: the source is absent.
    return null;
  }
}

function readRepository(
  user: unknown,
  repos: unknown
): RepositoryTelemetry | null {
  const publicRepos =
    typeof user === "object" &&
    user !== null &&
    "public_repos" in user &&
    typeof user.public_repos === "number"
      ? user.public_repos
      : null;

  const recent: RepoActivity[] = Array.isArray(repos)
    ? repos.flatMap((repo: unknown) =>
        typeof repo === "object" &&
        repo !== null &&
        "name" in repo &&
        typeof repo.name === "string" &&
        "pushed_at" in repo &&
        typeof repo.pushed_at === "string"
          ? [{ name: repo.name, pushedAt: repo.pushed_at }]
          : []
      )
    : [];

  if (publicRepos === null && recent.length === 0) return null;
  return { publicRepos, recent };
}

function readDeployment(): DeploymentTelemetry | null {
  // Vercel build env — real metadata stamped at deploy, absent locally.
  const env = process.env.VERCEL_ENV;
  if (env === undefined) return null;
  return {
    env,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
  };
}

/**
 * Aggregate every configured source. Null means: nothing real to show —
 * the caller omits, never simulates.
 */
export async function getTelemetry(): Promise<Telemetry | null> {
  const [user, repos] = await Promise.all([
    fetchGithub(`/users/${GITHUB_USER}`),
    fetchGithub(`/users/${GITHUB_USER}/repos?sort=pushed&per_page=4&type=owner`),
  ]);

  const repository = readRepository(user, repos);
  const deployment = readDeployment();

  if (repository === null && deployment === null) return null;

  return {
    generatedAt: new Date().toISOString(),
    repository,
    deployment,
  };
}
