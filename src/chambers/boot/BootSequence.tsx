"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { MonoLabel } from "@/primitives/MonoLabel";

/**
 * BootSequence — DEPTH.00, the door (interaction-principles §3;
 * homepage-experience §4.0).
 *
 * Timing architecture (one timeline, four beats, ≤2.5s total):
 *   0–400ms     void — only the G0 grid behind (already present).
 *   400–1400ms  boot lines type in at real terminal cadence: lines
 *               start 240ms apart, characters flush at 12ms — output
 *               buffering, not movie typing. The page's single typing
 *               animation (restraint budget, homepage-experience §8).
 *   1400–2200ms identity materializes: opacity + 8px rise,
 *               --motion-deliberate, --ease-out-facility. Lines yield
 *               (dim), they never leave — prior operation stays visible.
 *   2200ms      settled: faint glow-dim ambient breathes in over
 *               --motion-cinematic. After 2s idle, one muted cue line.
 *
 * State machine, not animation library: React state holds four
 * discrete beats (void → lines → identity → settled); CSS transitions
 * own every visual change between them (ownership law — this is
 * feedback choreography, not scroll-coupled motion). The only
 * per-frame JS is the character clock, which writes textContent
 * through refs — React never re-renders during typing.
 *
 * Interruption: wheel / touch / key / pointer instantly settles —
 * timers cleared, full text restored, transitions zeroed via the
 * data-instant attribute. Immersion is offered, never enforced; scroll
 * is never locked, the boot simply concedes.
 *
 * Session law: plays once per sessionStorage. Returning visitors (and
 * any storage failure) get the settled chamber with a 400ms fade.
 *
 * Accessibility / reduced motion:
 * - The server renders the SETTLED state — full identity, full lines.
 *   No JS, no boot: the door is simply open (document-first law).
 * - prefers-reduced-motion collapses to the same settled render behind
 *   a single --motion-swift-class fade; copy persists as static text.
 * - The pre-paint gate runs in useLayoutEffect so first-visit visitors
 *   never see a settled flash before the void: the swap happens before
 *   the first client paint.
 * - Boot lines are status output: polite live region semantics are
 *   deliberately NOT used — announcing decorative boot text would be
 *   theater for screen reader users; the h1 + role carry the content.
 *
 * Cleanup: every timer, rAF, and listener is registered in one effect
 * and removed in its return — unmount mid-boot leaks nothing and a
 * remount (dev strict mode) replays safely off sessionStorage.
 */

const SESSION_KEY = "nexus.boot-played";

const LINES_AT_MS = 400;
const LINE_STAGGER_MS = 240;
const CHAR_MS = 12;
const IDENTITY_AT_MS = 1400;
const SETTLED_AT_MS = 2200;
const CUE_IDLE_MS = 2000;

const SKIP_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

type BootBeat = "void" | "lines" | "identity" | "settled";

export interface BootSequenceProps {
  name: string;
  role: string;
  /** Build-time session lines from boot-lines.ts, passed by the server page. */
  lines: readonly string[];
}

export function BootSequence({ name, role, lines }: BootSequenceProps) {
  // "ssr" renders settled markup — identical on server and first client paint.
  const [mode, setMode] = useState<"ssr" | "boot" | "settled">("ssr");
  const [beat, setBeat] = useState<BootBeat>("void");
  const [instant, setInstant] = useState(false);
  const [entryFade, setEntryFade] = useState(false);
  const [cueVisible, setCueVisible] = useState(false);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  // Pre-paint gate: decide boot vs settled BEFORE the first client
  // paint so a first visit never flashes the settled identity.
  useLayoutEffect(() => {
    let played = true; // storage unavailable → fail open, never re-lock the door
    try {
      played = sessionStorage.getItem(SESSION_KEY) === "1";
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      played = true;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const willBoot = !played && !reduced;
    // Facility-wide signal, pre-paint: while boot is pending, the
    // NavRail (G4, outside this chamber) holds back; it fades in
    // quietly at settle. JS-disabled visitors never get the attribute,
    // so the rail is simply present — the document stays coherent.
    if (willBoot) document.documentElement.setAttribute("data-boot-pending", "");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional pre-paint state gate; must commit before first paint or the void flashes settled content
    setMode(willBoot ? "boot" : "settled");
  }, []);

  useEffect(() => {
    if (mode === "ssr") return;

    const timeouts: number[] = [];
    let rafId = 0;
    let cueTimer = 0;
    let done = false;

    const showCueAfterIdle = () => {
      cueTimer = window.setTimeout(() => setCueVisible(true), CUE_IDLE_MS);
      window.addEventListener("scroll", hideCue, { once: true, passive: true });
    };
    const hideCue = () => {
      window.clearTimeout(cueTimer);
      setCueVisible(false);
    };

    // Returning visitor / reduced motion: settled chamber, 400ms fade.
    if (mode === "settled") {
      rafId = requestAnimationFrame(() => {
        setEntryFade(true);
        showCueAfterIdle();
      });
      return () => {
        cancelAnimationFrame(rafId);
        window.clearTimeout(cueTimer);
        window.removeEventListener("scroll", hideCue);
      };
    }

    // --- first-visit choreography ---
    const restoreLines = () => {
      lines.forEach((text, i) => {
        const el = lineRefs.current[i];
        if (el) el.textContent = text;
      });
    };

    const settle = (skipped: boolean) => {
      if (done) return;
      done = true;
      timeouts.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(rafId);
      removeSkipListeners();
      restoreLines();
      if (skipped) setInstant(true);
      setBeat("settled");
      // Boot complete: release the rail (it fades in on its own CSS
      // transition — quiet arrival, no scene cut).
      document.documentElement.removeAttribute("data-boot-pending");
      // A visitor who skipped is already moving — no cue for them.
      if (!skipped) showCueAfterIdle();
    };

    const onSkip = () => settle(true);
    const addSkipListeners = () =>
      SKIP_EVENTS.forEach((t) => window.addEventListener(t, onSkip, { passive: true }));
    const removeSkipListeners = () =>
      SKIP_EVENTS.forEach((t) => window.removeEventListener(t, onSkip));

    let t0 = 0;
    const typeLines = (now: number) => {
      const elapsed = now - t0;
      let complete = true;
      lines.forEach((text, i) => {
        const el = lineRefs.current[i];
        if (!el) return;
        const startAt = LINES_AT_MS + i * LINE_STAGGER_MS;
        const chars = Math.max(0, Math.floor((elapsed - startAt) / CHAR_MS));
        if (chars < text.length) complete = false;
        // nbsp keeps the line box: typing never shifts layout.
        el.textContent = text.slice(0, chars) || " ";
      });
      if (!complete && !done) rafId = requestAnimationFrame(typeLines);
    };

    rafId = requestAnimationFrame((now) => {
      t0 = now;
      addSkipListeners();
      timeouts.push(window.setTimeout(() => setBeat("lines"), LINES_AT_MS));
      timeouts.push(window.setTimeout(() => setBeat("identity"), IDENTITY_AT_MS));
      timeouts.push(window.setTimeout(() => settle(false), SETTLED_AT_MS));
      rafId = requestAnimationFrame(typeLines);
    });

    return () => {
      done = true;
      timeouts.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(rafId);
      window.clearTimeout(cueTimer);
      removeSkipListeners();
      window.removeEventListener("scroll", hideCue);
      // Never leave the rail suppressed if the boot unmounts mid-play.
      document.documentElement.removeAttribute("data-boot-pending");
    };
  }, [mode, lines]);

  const state: BootBeat = mode === "boot" ? beat : "settled";

  return (
    <section
      aria-labelledby="boot-title"
      data-boot-state={state}
      data-instant={instant ? "" : undefined}
      className={cn(
        "group relative flex w-full flex-col items-center justify-center self-stretch text-center",
        entryFade &&
          "animate-[nexus-fade-in_400ms_var(--ease-out-facility)_both]"
      )}
    >
      {/* Faint glow-dim ambient, center-low — breathes in at settle only
          (the system has not fully awakened before that). */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-(--z-ambient) opacity-0",
          "transition-opacity duration-(--motion-cinematic) ease-(--ease-inout-cinematic)",
          "group-data-[boot-state=settled]:opacity-100 group-data-[instant]:duration-0"
        )}
        style={{
          background:
            "radial-gradient(45% 35% at 50% 78%, var(--nexus-glow-dim), transparent 70%)",
        }}
      />

      {/* Boot lines: terminal output, left-aligned inside the centered
          block. Full opacity while speaking; they yield (dim) when the
          identity takes over, but stay — prior operation remains visible. */}
      <div
        className={cn(
          "relative z-(--z-content) mb-(--space-xl) flex flex-col gap-(--space-3xs) self-center text-left",
          "opacity-60 transition-opacity duration-(--motion-swift) ease-(--ease-out-facility)",
          "group-data-[boot-state=void]:opacity-0",
          "group-data-[boot-state=lines]:opacity-100",
          "group-data-[instant]:duration-0"
        )}
      >
        {lines.map((line, i) => (
          <p
            key={line}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            className="text-(length:--text-mono) leading-(--leading-mono) text-(color:--nexus-muted) [font-family:var(--font-machine)]"
          >
            {line}
          </p>
        ))}
      </div>

      {/* Identity: name in Grotesk, role in Mono beneath. No tagline,
          no CTA — the entry is a sequence, not a poster. */}
      <div
        className={cn(
          "relative z-(--z-content) translate-y-0 opacity-100",
          "transition-[opacity,transform] duration-(--motion-deliberate) ease-(--ease-out-facility)",
          "group-data-[boot-state=void]:translate-y-2 group-data-[boot-state=void]:opacity-0",
          "group-data-[boot-state=lines]:translate-y-2 group-data-[boot-state=lines]:opacity-0",
          "group-data-[instant]:duration-0"
        )}
      >
        <h1
          id="boot-title"
          className="text-(length:--text-h1) leading-(--leading-display) tracking-(--tracking-display) [font-weight:var(--weight-medium)]"
        >
          {name}
        </h1>
        <MonoLabel as="p" className="mt-(--space-sm)">
          {role}
        </MonoLabel>
      </div>

      {/* Scroll cue: one muted line after 2s idle. No chevron, no bounce. */}
      <MonoLabel
        as="p"
        aria-hidden={!cueVisible}
        className={cn(
          "absolute bottom-(--space-2xl) transition-opacity duration-(--motion-swift) ease-(--ease-out-facility)",
          cueVisible ? "opacity-100" : "opacity-0"
        )}
      >
        &gt; scroll to enter
      </MonoLabel>
    </section>
  );
}
