"use client";

import { useEffect, useRef, useState } from "react";

import { FACILITY, IDENTITY } from "@/content/identity";

/**
 * Loading boot overlay — holds the visitor on an animated emblem +
 * progress bar until fonts and the page's `load` event resolve (with a
 * minimum on-screen beat so it never flashes). Reduced-motion users get
 * an instant, static reveal. onDone fires as the overlay begins to
 * fade, triggering the hero reveal beneath it.
 */

const STAGES: [number, string][] = [
  [0, "establishing uplink"],
  [25, "loading workspace · backend · ai/ml"],
  [55, "calibrating neural core"],
  [80, "rendering project vault"],
];

const initials = IDENTITY.name
  .split(" ")
  .map((w) => w[0])
  .join(".");

export function BootOverlay({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [status, setStatus] = useState(STAGES[0][1]);
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const finish = (instant: boolean) => {
      if (done.current) return;
      done.current = true;
      onDone();
      if (instant) {
        setGone(true);
      } else {
        setFading(true);
        window.setTimeout(() => setGone(true), 720);
      }
    };

    if (reduced) {
      // Defer out of the synchronous effect body so the instant reveal
      // doesn't cascade renders within the effect.
      const id = setTimeout(() => {
        setPct(100);
        finish(true);
      }, 0);
      return () => clearTimeout(id);
    }

    let loaded = false;
    let minElapsed = false;
    let cancelled = false;
    let tick: ReturnType<typeof setTimeout>;
    let p = 0;

    const sigs: Promise<unknown>[] = [];
    if (document.fonts?.ready) sigs.push(document.fonts.ready);
    if (document.readyState !== "complete") {
      sigs.push(new Promise((r) => window.addEventListener("load", r, { once: true })));
    }
    if (sigs.length) Promise.all(sigs).then(() => (loaded = true));
    else loaded = true;

    const minTimer = setTimeout(() => (minElapsed = true), 1100);

    const setStageFor = (val: number) => {
      let s = STAGES[0][1];
      for (const st of STAGES) if (val >= st[0]) s = st[1];
      setStatus(val >= 100 ? "ready" : s);
    };

    const step = () => {
      if (cancelled) return;
      const ceiling = loaded && minElapsed ? 100 : 90;
      if (p < ceiling) {
        p += Math.max(1, Math.round((ceiling - p) * 0.1));
        if (p > ceiling) p = ceiling;
      }
      setPct(p);
      setStageFor(p);
      if (p >= 100) {
        tick = setTimeout(() => finish(false), 360);
        return;
      }
      tick = setTimeout(step, 45);
    };
    step();

    return () => {
      cancelled = true;
      clearTimeout(tick);
      clearTimeout(minTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  return (
    <div
      className="np-boot"
      style={{
        opacity: fading ? 0 : 1,
        visibility: fading ? "hidden" : "visible",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 50% 42%,rgba(79,209,255,.12),transparent 60%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(to bottom,rgba(0,0,0,0) 0px,rgba(0,0,0,0) 2px,rgba(0,0,0,.2) 3px,rgba(0,0,0,0) 4px)",
        }}
      />

      <div style={{ position: "relative", width: 120, height: 120 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1px solid rgba(79,209,255,.25)",
            borderTopColor: "var(--glow)",
            animation: "np-bootRing 1.4s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 14,
            borderRadius: "50%",
            border: "1px solid rgba(255,73,192,.2)",
            borderBottomColor: "var(--hot)",
            animation: "np-bootRing 2.1s linear infinite reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: ".2em",
            color: "var(--glow)",
          }}
        >
          {initials}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--grotesk)",
            fontWeight: 600,
            fontSize: "clamp(26px,4vw,40px)",
            letterSpacing: ".04em",
            whiteSpace: "nowrap",
            textShadow: "0 0 24px rgba(79,209,255,.35)",
          }}
        >
          {IDENTITY.name.toUpperCase()}
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".4em",
            color: "var(--dim)",
            marginTop: 6,
          }}
        >
          {FACILITY.title.toUpperCase()}
        </div>
      </div>

      <div
        style={{
          width: "min(420px,80vw)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: ".16em",
            color: "var(--muted)",
          }}
        >
          <span>{status}</span>
          <span style={{ color: "var(--glow)", fontSize: 14, fontWeight: 500 }}>
            {Math.round(pct)}%
          </span>
        </div>
        <div style={{ height: 3, background: "rgba(243,244,246,.08)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: "linear-gradient(90deg,var(--signal),var(--glow),var(--hot))",
              boxShadow: "0 0 10px var(--glow)",
              transition: "width .2s linear",
            }}
          />
        </div>
      </div>

      <button
        type="button"
        className="np-skip"
        onClick={() => {
          if (!done.current) {
            done.current = true;
            onDone();
            setFading(true);
            window.setTimeout(() => setGone(true), 720);
          }
        }}
        style={{
          position: "absolute",
          bottom: 34,
          right: 34,
          background: "transparent",
          border: "1px solid var(--hair)",
          color: "var(--dim)",
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: ".18em",
          padding: "7px 14px",
          cursor: "pointer",
          transition: "all .2s",
        }}
      >
        SKIP ▸
      </button>
    </div>
  );
}
