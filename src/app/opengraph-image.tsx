import { ImageResponse } from "next/og";

import { IDENTITY } from "@/content/identity";
import { SITE_NAME } from "@/lib/site";

/**
 * Facility-styled OG card (implementation-architecture §2): dark, mono
 * label, no screenshot, no render. Generated at build — static, not
 * per-request.
 *
 * Color values mirror tokens.css (--nexus-void / -text / -muted /
 * -status-ok / -hairline); this file is an image generator outside the
 * CSS pipeline, so the tokens are repeated here by necessity — if a
 * core token changes, change these with it.
 */

export const alt = `${SITE_NAME} — ${IDENTITY.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: "#060816", // --nexus-void
          color: "#f3f4f6", // --nexus-text
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: "0.08em",
            color: "#94a3b8", // --nexus-muted
          }}
        >
          {SITE_NAME} · DEPTH.00 — DEPTH.06
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 500 }}>
            {IDENTITY.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: "0.08em",
              color: "#94a3b8",
              textTransform: "uppercase",
            }}
          >
            {IDENTITY.role}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "#94a3b8",
            borderTop: "1px solid rgba(148, 163, 184, 0.12)", // --nexus-hairline
            paddingTop: 24,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              backgroundColor: "#34d399", // --nexus-status-ok
            }}
          />
          status: operational
        </div>
      </div>
    ),
    size
  );
}
