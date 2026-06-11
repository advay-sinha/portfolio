"use client";

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { LazyMotion, MotionConfig, useReducedMotion } from "framer-motion";

import { REDUCED_REVEALS } from "@/motion/reduced";
import { REVEALS, type RevealVariantSet } from "@/motion/reveal";
import { assertMotionTokenParity } from "@/motion/tokens";

/**
 * MotionBoundary — the single Framer Motion root
 * (implementation-architecture §12: reveal variants swap to reduced
 * via one MotionConfig-level switch; chambers don't branch
 * individually).
 *
 * Three things happen here and nowhere else:
 * 1. LazyMotion loads the domAnimation feature bundle asynchronously
 *    (motion/features.ts — its own deferred chunk, off the first-load
 *    path) behind the `m` components (strict mode throws on a stray
 *    `motion.` import) — the smallest Framer footprint that supports
 *    variants. Until features arrive, m-components hold their server
 *    markup; reveals fire only after the threshold trigger anyway.
 * 2. The reveal variant set is chosen once from the live
 *    prefers-reduced-motion preference (useReducedMotion tracks
 *    changes mid-session) and distributed by context. Every Reveal
 *    consumer renders the same vocabulary; none of them know the
 *    preference exists.
 * 3. MotionConfig reducedMotion="user" backstops the same law inside
 *    Framer itself: even a future variant that forgot the reduced set
 *    would have its transforms stripped by the library.
 *
 * SSR: useReducedMotion is null on the server → full set, which is
 * irrelevant because nothing animates server-side; the client corrects
 * before the first reveal fires. Dev builds also verify the JS token
 * mirror against tokens.css here (one place, once per load).
 */

const loadFeatures = () =>
  import("@/motion/features").then((module) => module.default);

const RevealSetContext = createContext<RevealVariantSet>(REVEALS);

/** The chamber-facing API: the current reveal vocabulary, preference applied. */
export function useRevealSet(): RevealVariantSet {
  return useContext(RevealSetContext);
}

export function MotionBoundary({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    assertMotionTokenParity();
  }, []);

  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <RevealSetContext.Provider value={reduced ? REDUCED_REVEALS : REVEALS}>
          {children}
        </RevealSetContext.Provider>
      </MotionConfig>
    </LazyMotion>
  );
}
