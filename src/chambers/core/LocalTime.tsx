"use client";

import { useEffect, useState } from "react";

/**
 * LocalTime — the live element of the Core's status line
 * (homepage-experience §4.1: "live local time").
 *
 * Facility-local time (the engineer's zone), real, ticking once per
 * second aligned to the wall clock. This is the chamber's permitted
 * "≤1 data detail" moving at rest (restraint budget) — not telemetry,
 * not analytics, just a clock that proves present tense.
 *
 * Not an interaction island: it renders one <time> element and owns no
 * input. The chamber's single signature-interaction budget stays with
 * NeuralViz. SSR renders an em-dash placeholder; the first paint after
 * mount fills it — server and first client render agree, no hydration
 * mismatch, no suppressed warnings.
 */

export interface LocalTimeProps {
  timeZone: string;
  /** Short zone designation rendered after the digits, e.g. "IST". */
  label: string;
}

export function LocalTime({ timeZone, label }: LocalTimeProps) {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    let timer = 0;
    const tick = () => {
      setValue(formatter.format(new Date()));
      // Re-align to the wall-clock second so the readout never drifts.
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timer = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timer);
  }, [timeZone]);

  return (
    <time className="tabular-nums">
      {value ?? "--:--:--"} {label}
    </time>
  );
}
