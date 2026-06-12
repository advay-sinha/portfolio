/**
 * boot-lines.ts — real session lines, build-time data
 * (implementation-architecture §2, §13).
 *
 * Phase 14: the boot initializes a PERSONAL operational workspace —
 * identity first, no fictional facility framing, no system-count
 * theater. Think a quiet Linux workstation reaching a login shell.
 * Every value is still real:
 * - the session string derives from content/identity.ts (the same
 *   operator@host the terminal prompt uses),
 * - the deployment stamp is evaluated when this module loads on the
 *   server — for a statically generated page that is build time, which
 *   IS the last deployment. On Vercel, swap the stamp source to the
 *   commit timestamp env (VERCEL_GIT_COMMIT_*) for exact commit truth.
 *
 * This module is imported by the server page and passed down as props,
 * so the date is stamped once at build — a client import would
 * re-evaluate per visit and turn the stamp into a lie.
 */

import { SESSION } from "@/content/identity";

const now = new Date();
const pad = (value: number) => String(value).padStart(2, "0");
const DEPLOY_STAMP = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;

/**
 * 3–4 short lines, fast terminal cadence (interaction-principles §3).
 * No hacker theatrics, no fake subsystems — each line is a fact:
 * whose session this is, what workspace loads, when it last shipped.
 */
export const BOOT_LINES: readonly string[] = [
  `> session: ${SESSION.user}@${SESSION.host}`,
  "> loading workspace: backend · ai/ml",
  `> last deployment: ${DEPLOY_STAMP}`,
  "> ready",
];
