import { useEffect, useState, type RefObject } from "react";

import { THRESHOLD_BEAT_MS } from "@/motion/tokens";

/**
 * useThresholdReveal — fire-once arrival trigger with the threshold
 * beat (interaction-principles §2: the visitor arrives, a 200–400ms
 * hold, then the room responds).
 *
 * IntersectionObserver only — no scroll listeners, no rAF, no layout
 * reads. The observer disconnects on first intersection (fire-once is
 * the pacing law: entrances never replay on scroll-up), then the beat
 * timer holds for --motion-threshold before reporting true. Once true,
 * always true — the effect short-circuits and nothing re-subscribes.
 *
 * SSR safe: pure state + effect; on the server it simply returns
 * false and runs nothing. Environments without IntersectionObserver
 * fire on the next tick — content must never stay hidden because the
 * trigger is missing.
 */

export interface ThresholdRevealOptions {
  /** Hold between arrival and reveal. Defaults to the --motion-threshold mirror. */
  beatMs?: number;
  /** Fraction of the target that must be visible to count as arrival. */
  threshold?: number;
}

export function useThresholdReveal(
  ref: RefObject<Element | null>,
  { beatMs = THRESHOLD_BEAT_MS, threshold = 0.25 }: ThresholdRevealOptions = {}
): boolean {
  const [fired, setFired] = useState(false);

  useEffect(() => {
    if (fired) return;
    const el = ref.current;
    if (el === null) return;

    let timer = 0;

    if (typeof IntersectionObserver === "undefined") {
      timer = window.setTimeout(() => setFired(true), 0);
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        timer = window.setTimeout(() => setFired(true), beatMs);
      },
      { threshold }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [ref, fired, beatMs, threshold]);

  return fired;
}
