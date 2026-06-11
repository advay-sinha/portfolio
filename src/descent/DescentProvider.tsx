"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { detectTier, onReducedMotionChange, type MotionTier } from "@/descent/capability";
import {
  fogAt,
  phaseAt,
  resolveScrollMap,
  type PhaseState,
  type ResolvedMap,
  type StratumPhase,
} from "@/descent/depth-math";
import {
  CAMERA_LERP,
  forViewport,
  G0,
  SCROLL_MAP,
  type StratumId,
} from "@/descent/scroll-map";

/**
 * DescentProvider — the depth system's single runtime root
 * (implementation-architecture §4.2, §8).
 *
 * Owns: the one Lenis instance, the one GSAP orchestration root, the
 * plane registry, tier distribution, and every per-frame environmental
 * write (plane phases, fog opacity, G0 grid drift). It renders children
 * it never inspects — no chamber imports, no chamber knowledge, ever.
 *
 * State philosophy (the React boundary):
 * - `tier` is the ONLY React state — set once after mount (and again
 *   only if reduced-motion flips mid-session). Two renders per session,
 *   worst case.
 * - All scroll-coupled values flow Lenis → update() → quickSetters on
 *   refs. React never sees a scroll position; nothing re-renders per
 *   frame. Discrete DOM changes (data-phase, pointer-events, inert,
 *   visibility) happen imperatively at phase boundaries — a few times
 *   per chamber per visit, still without React.
 *
 * Ownership law (implementation-architecture §7), enforced here:
 * - This engine (GSAP) owns scroll-coupled values ONLY: plane
 *   transform/opacity/filter, veil opacity, grid drift.
 * - Framer (later) owns discrete event transitions, and only on nodes
 *   INSIDE planes — never the StrataPlane wrapper this engine writes.
 * - CSS owns hover/ambient feedback. No element-property pair has two
 *   writers, by construction.
 *
 * SSR safety: the module top-level imports no GSAP/Lenis. The server
 * (and the static tier) renders the document and nothing else; gsap and
 * lenis are dynamic-imported inside the effect only when tier demands
 * them, so the static tier never fetches or parses either bundle
 * (implementation-architecture §13).
 *
 * Lifecycle: mount → detect tier → (non-static) load libs → build
 * engine → register pre-mounted planes → first update at current scroll.
 * Tier change (reduced-motion flip) re-runs the effect: the old engine
 * destroys completely — ticker callback removed, Lenis destroyed,
 * listeners off, every plane's inline styles cleared back to the
 * settled document. Destruction must return the page to exactly the
 * SSR state: the static tier is the cleanup target, not an afterthought.
 *
 * Future ScrollTrigger integration points:
 * - When VaultTrack lands its pin, register ScrollTrigger here:
 *   `gsap.registerPlugin(ScrollTrigger)`, `lenis.on("scroll",
 *   ScrollTrigger.update)`, ScrollTrigger.scrollerProxy if needed, and
 *   a dev-mode pin-budget assertion (second `pin: true` registration
 *   throws). Chamber islands will request triggers through a context
 *   method so the budget stays enforceable in one place.
 * - The jank tripwire (capability.ts notes) will sample rAF deltas
 *   inside `tick` — the loop already exists; demotion extends the tier
 *   store (a session-demotion flag ANDed into the snapshot) and fires
 *   its change signal between chambers.
 * - `stratumAt`/`horizonAt` are computed-ready for the nav rail's
 *   selector switch and proxy mounting; they join `update()` when those
 *   consumers exist (no speculative work per frame until then).
 */

interface DescentContextValue {
  tier: MotionTier;
  /** Register a plane root. Returns an unregister cleanup. */
  registerPlane: (id: StratumId, el: HTMLElement) => () => void;
  /** Register the single fog veil element. Returns an unregister cleanup. */
  registerVeil: (el: HTMLElement) => () => void;
}

/**
 * Default context = the isolation gate (implementation-architecture
 * §15): any plane or chamber rendered without a provider behaves as the
 * static tier and registration is a no-op.
 */
const STATIC_CONTEXT: DescentContextValue = {
  tier: "static",
  registerPlane: () => () => {},
  registerVeil: () => () => {},
};

const DescentContext = createContext<DescentContextValue>(STATIC_CONTEXT);

export function useDescent(): DescentContextValue {
  return useContext(DescentContext);
}

/* ----------------------------------------------------------------
   ENGINE — plain object, no React inside. Everything per-frame.
   ---------------------------------------------------------------- */

type GsapCore = (typeof import("gsap"))["gsap"];
type LenisCtor = (typeof import("@studio-freight/lenis"))["default"];
type Setter = (value: number) => void;

const RESIZE_DEBOUNCE_MS = 150;

interface DescentEngine {
  addPlane(id: StratumId, el: HTMLElement): void;
  removePlane(id: StratumId): void;
  setVeil(el: HTMLElement | null): void;
  start(): void;
  destroy(): void;
}

interface PlaneHandle {
  id: StratumId;
  apply(state: PhaseState, viewportWidthPx: number): void;
  release(): void;
}

/** Strata that host the pinned passage (data, from the map). */
const PINNED_STRATA = new Set(
  SCROLL_MAP.flatMap((s) =>
    s.kind === "focus" && s.pin !== undefined ? [s.id] : []
  )
);

function createPlaneHandle(
  gsap: GsapCore,
  id: StratumId,
  el: HTMLElement
): PlaneHandle {
  // quickSetters: cached property tweens, the cheapest per-frame write
  // GSAP offers. Transform components share GSAP's transform cache, so
  // x + scale compose without string concatenation per frame.
  const setX = gsap.quickSetter(el, "x", "px") as Setter;
  const setScale = gsap.quickSetter(el, "scale") as Setter;
  const setOpacity = gsap.quickSetter(el, "opacity") as Setter;
  // Pinned-stratum exemption: a ScrollTrigger pin (VaultTrack) cannot
  // live inside a transformed containing block — any non-none ancestor
  // transform breaks fixed positioning. So while the pinned stratum
  // holds focus, its plane transform is CLEARED entirely (micro-scale
  // and drift are sacrificed for that chamber; the pin is worth more
  // than a 0.5% creep). Approach/departure transforms still apply —
  // the pin is only active during the focus band.
  const pinned = PINNED_STRATA.has(id);
  let transformCleared = false;
  let currentPhase: StratumPhase | null = null;
  let hasFilter = false;

  return {
    id,
    apply(state, viewportWidthPx) {
      // Continuous values — every frame, no React, no layout.
      if (pinned && state.phase === "focus") {
        if (!transformCleared) {
          gsap.set(el, { clearProps: "transform" });
          transformCleared = true;
        }
      } else {
        if (transformCleared) {
          transformCleared = false;
          gsap.set(el, { x: state.driftX * viewportWidthPx, scale: state.scale });
        }
        setX(state.driftX * viewportWidthPx);
        setScale(state.scale);
      }
      setOpacity(state.opacity);

      // The single live filter (B1). Removed — not set to blur(0) — the
      // moment the ramp ends, per strata-spec §8.
      if (state.blurPx > 0) {
        el.style.filter = `blur(${state.blurPx.toFixed(2)}px)`;
        hasFilter = true;
      } else if (hasFilter) {
        el.style.filter = "";
        hasFilter = false;
      }

      // Discrete boundary changes only — a handful per chamber per visit.
      if (state.phase !== currentPhase) {
        currentPhase = state.phase;
        el.dataset.phase = state.phase;

        // Real DOM is hidden at silhouette range (the proxy will own
        // that view) and at dormancy. visibility keeps geometry, so
        // anchors and the nav rail's observer stay correct.
        const hidden = state.phase === "dormant" || state.phase === "silhouette";
        el.style.visibility = hidden ? "hidden" : "";

        // Only the focus plane is interactive (strata-spec §15).
        const interactive = state.phase === "focus";
        el.style.pointerEvents = interactive ? "" : "none";
        if (interactive) el.removeAttribute("inert");
        else el.setAttribute("inert", "");

        // will-change only while the plane is actually moving; removed
        // at rest so the compositor doesn't hold layers for the whole
        // page (strata-spec §14).
        el.style.willChange = hidden || interactive ? "" : "transform, opacity";
      }
    },
    release() {
      // Back to the settled SSR document, exactly.
      gsap.set(el, {
        clearProps: "transform,opacity,filter,visibility,willChange,pointerEvents",
      });
      el.dataset.phase = "focus";
      el.removeAttribute("inert");
      currentPhase = null;
      hasFilter = false;
    },
  };
}

function createEngine(
  gsap: GsapCore,
  Lenis: LenisCtor,
  tier: Exclude<MotionTier, "static">
): DescentEngine {
  let resolved: ResolvedMap = resolveScrollMap(
    forViewport(window.innerWidth).segments
  );
  const handles = new Map<StratumId, PlaneHandle>();
  let veilEl: HTMLElement | null = null;
  let setVeilOpacity: Setter | null = null;
  let gridEl: HTMLElement | null = null;
  let setGridY: Setter | null = null;
  let scrollPx = 0;
  let started = false;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;

  // The one Lenis instance. lerp ~0.1 is the camera law — never wrapped,
  // never re-derived (implementation-architecture §1).
  const lenis = new Lenis({ lerp: CAMERA_LERP });
  const tick = (time: number) => lenis.raf(time * 1000);

  const update = () => {
    const vhUnit = window.innerHeight / 100;
    const viewportWidthPx = window.innerWidth;
    const s = scrollPx / vhUnit; // scroll position in vh — the map's unit

    setVeilOpacity?.(fogAt(resolved, s));

    // G0 moves at 0.97× scroll. The 3% differential wraps modulo the
    // grid interval, so a bounded translate reads as endless depth.
    setGridY?.(-((scrollPx * (1 - G0.scrollFactor)) % G0.gridIntervalPx));

    for (const handle of handles.values()) {
      handle.apply(phaseAt(resolved, s, handle.id, tier), viewportWidthPx);
    }
  };

  const onScroll = () => {
    scrollPx = lenis.scroll;
    update();
  };

  // Breakpoint or orientation change: re-derive the map (pure, cheap)
  // and reapply once. Phase math is stateless, so this is safe mid-page.
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resolved = resolveScrollMap(forViewport(window.innerWidth).segments);
      update();
    }, RESIZE_DEBOUNCE_MS);
  };

  return {
    addPlane(id, el) {
      handles.set(id, createPlaneHandle(gsap, id, el));
      if (started) update();
    },
    removePlane(id) {
      handles.get(id)?.release();
      handles.delete(id);
    },
    setVeil(el) {
      veilEl = el;
      setVeilOpacity = el ? (gsap.quickSetter(el, "opacity") as Setter) : null;
    },
    start() {
      // Lenis rides GSAP's ticker — one rAF loop on the page, total.
      // lagSmoothing(0) keeps scroll position authoritative after tab
      // switches (the camera never "catches up" — it is where it is).
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      lenis.on("scroll", onScroll);
      window.addEventListener("resize", onResize);

      gridEl = document.querySelector<HTMLElement>('[data-descent="grid"]');
      setGridY = gridEl ? (gsap.quickSetter(gridEl, "y", "px") as Setter) : null;

      started = true;
      scrollPx = window.scrollY;
      update();
    },
    destroy() {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // GSAP default, restored
      lenis.destroy();
      for (const handle of handles.values()) handle.release();
      handles.clear();
      if (gridEl) gsap.set(gridEl, { clearProps: "transform" });
      if (veilEl) gsap.set(veilEl, { clearProps: "opacity" });
    },
  };
}

/* ----------------------------------------------------------------
   PROVIDER
   ---------------------------------------------------------------- */

// Tier as an external store: the server snapshot is "static" (exactly
// what the server rendered), the client snapshot is detectTier(), and
// the only external change signal is the reduced-motion preference.
// React re-renders only when the resolved tier actually differs.
const subscribeTier = (onChange: () => void) => onReducedMotionChange(onChange);
const getServerTier = (): MotionTier => "static";

export function DescentProvider({ children }: { children: ReactNode }) {
  const tier = useSyncExternalStore(subscribeTier, detectTier, getServerTier);
  const planesRef = useRef(new Map<StratumId, HTMLElement>());
  const veilRef = useRef<HTMLElement | null>(null);
  const engineRef = useRef<DescentEngine | null>(null);

  const registerPlane = useCallback((id: StratumId, el: HTMLElement) => {
    planesRef.current.set(id, el);
    engineRef.current?.addPlane(id, el);
    return () => {
      planesRef.current.delete(id);
      engineRef.current?.removePlane(id);
    };
  }, []);

  const registerVeil = useCallback((el: HTMLElement) => {
    veilRef.current = el;
    engineRef.current?.setVeil(el);
    return () => {
      veilRef.current = null;
      engineRef.current?.setVeil(null);
    };
  }, []);

  // Engine lifecycle, keyed by tier. Static = no engine, no bundles.
  useEffect(() => {
    if (tier === "static") return;

    let cancelled = false;
    let engine: DescentEngine | null = null;

    void (async () => {
      const [gsapModule, lenisModule] = await Promise.all([
        import("gsap"),
        import("@studio-freight/lenis"),
      ]);
      if (cancelled) return;

      engine = createEngine(gsapModule.gsap, lenisModule.default, tier);
      engineRef.current = engine;
      for (const [id, el] of planesRef.current) engine.addPlane(id, el);
      if (veilRef.current) engine.setVeil(veilRef.current);
      engine.start();
    })();

    return () => {
      cancelled = true;
      engineRef.current = null;
      engine?.destroy();
    };
  }, [tier]);

  const value = useMemo<DescentContextValue>(
    () => ({ tier, registerPlane, registerVeil }),
    [tier, registerPlane, registerVeil]
  );

  return (
    <DescentContext.Provider value={value}>{children}</DescentContext.Provider>
  );
}
