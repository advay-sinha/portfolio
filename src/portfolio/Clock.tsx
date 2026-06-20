"use client";

import { useEffect, useState } from "react";

import { IDENTITY } from "@/content/identity";

/**
 * Facility local time — the engineer's zone (IST), not the visitor's.
 * Renders a stable placeholder on the server so hydration never sees a
 * time mismatch; the real clock starts after mount.
 */
export function Clock() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const tick = () => {
      try {
        setTime(
          new Date().toLocaleTimeString("en-GB", {
            timeZone: IDENTITY.timeZone,
            hour12: false,
          })
        );
      } catch {
        /* locale/timezone unsupported — hold the placeholder */
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span style={{ color: "var(--glow)" }} suppressHydrationWarning>
      {time}
    </span>
  );
}
