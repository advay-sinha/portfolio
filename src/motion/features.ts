/**
 * features.ts — Framer's domAnimation feature bundle, isolated so
 * MotionBoundary can load it asynchronously (the documented LazyMotion
 * split: core `m`/LazyMotion stay in the first-load bundle; the
 * animation feature set arrives as its own deferred chunk).
 *
 * Until it loads, m-components render their server markup unanimated —
 * which is exactly the document-first contract: nothing reveals before
 * the threshold trigger anyway.
 */
export { domAnimation as default } from "framer-motion";
