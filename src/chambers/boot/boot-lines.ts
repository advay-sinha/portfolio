/**
 * boot-lines.ts — real session lines, build-time data
 * (implementation-architecture §2, §13).
 *
 * The boot references PRIOR operation, never initialization from zero
 * (homepage-experience §4.0, spatial-language §5): the facility was
 * running before the visitor arrived. Every value is real:
 * - the system count derives from content/identity.ts,
 * - the deployment stamp is evaluated when this module loads on the
 *   server — for a statically generated page that is build time, which
 *   IS the last deployment. On Vercel, swap the stamp source to the
 *   commit timestamp env (VERCEL_GIT_COMMIT_*) for exact commit truth.
 *
 * This module is imported by the server page and passed down as props,
 * so the date is stamped once at build — a client import would
 * re-evaluate per visit and turn the stamp into a lie.
 */

import { IDENTITY } from "@/content/identity";

const now = new Date();
const pad = (value: number) => String(value).padStart(2, "0");
const DEPLOY_STAMP = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;

/**
 * 3–4 short lines, fast terminal cadence (interaction-principles §3).
 * No hacker theatrics, no fake subsystems — each line is a fact.
 */
export const BOOT_LINES: readonly string[] = [
  "> resuming session",
  `> ${IDENTITY.systems.length} systems operational`,
  `> last deployment: ${DEPLOY_STAMP}`,
  "> channel open",
];
