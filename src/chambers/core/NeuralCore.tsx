import { LocalTime } from "@/chambers/core/LocalTime";
import { NeuralViz } from "@/chambers/core/NeuralViz";
import { IDENTITY } from "@/content/identity";
import { Reveal, RevealGroup } from "@/motion/RevealGroup";
import { MonoLabel } from "@/primitives/MonoLabel";
import { Panel } from "@/primitives/Panel";
import { StatusDot } from "@/primitives/StatusDot";

/**
 * NeuralCore — DEPTH.01, ABOUT: who operates this place
 * (homepage-experience §4.1; Phase 14 personalization — same room,
 * the copy now speaks about the engineer, not the facility).
 * Server component: everything here is static document except the two
 * leaf islands it composes (NeuralViz — the chamber's one signature
 * interaction; LocalTime — the one live data detail).
 *
 * Layout reasoning — engineered asymmetry, never a hero:
 * identity panel sits left-of-center (cols 2–7); the orchestration
 * topology occupies the right third (cols 8–12) at L1.5 — behind
 * structure, in front of void, rendered before the panel in DOM so
 * natural stacking keeps it under the L2 panel without extra z values.
 * The violet ambient (the only violet-led chamber) sits center, L1,
 * drifting on the ambient token band. Nothing is centered, nothing is
 * symmetric: the room reads as a workstation, not a poster.
 *
 * Hierarchy reasoning — four steps, read in order at rest:
 * 1. depth marker (Mono label, muted) — where you are;
 * 2. one Grotesk paragraph (≤65ch) — who operates this place;
 * 3. capability readouts (Mono, indexed, max 6 — never skill bars);
 * 4. status line (local time · focus · channel), the smallest and the
 *    only live row — present tense proven last, quietly.
 * The chamber heading is the panel's mono designation, not a display
 * headline: the visitor just read the engineer's name in the boot;
 * repeating identity at display scale would be the facility shouting.
 *
 * Typography reasoning: both voices in one panel — Grotesk speaks the
 * paragraph (the engineer), Mono speaks everything operational (the
 * facility): labels, capabilities, status. Tabular numerals on the
 * clock so the only moving text never shifts a pixel of layout.
 *
 * Arrival choreography (homepage-experience §4.1) — one RevealGroup,
 * steps in --motion-stagger units after the threshold beat:
 *   0  depth marker resolves        (mono, swift)
 *   1  operator panel rises 8px     (panel, deliberate)
 *   2  topology develops            (resolve, cinematic — finishes last
 *      of the parallel track; depth, not decoration)
 *   3–8 capability readouts come online, consecutive (6 = stagger cap)
 *   9  status line ignites last — the room is running before its
 *      smallest, live row speaks (settle before speech).
 * The chamber arrives as one operation; the ambient is NOT revealed —
 * the light was on before the visitor got here (prior-operation law).
 */
export function NeuralCore() {
  return (
    <section aria-labelledby="core-title" className="relative w-full">
      {/* L1 ambient — single signal-dim radial, centered; slow drift,
          frozen under reduced motion. The one light in this room. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-(--z-ambient) animate-[nexus-drift_16s_var(--ease-linear)_infinite] [animation-play-state:var(--ambient-play-state)]"
        style={{
          background:
            "radial-gradient(42% 48% at 50% 45%, var(--nexus-signal-dim), transparent 72%)",
        }}
      />

      <RevealGroup className="relative mx-auto grid w-full max-w-(--layout-max) grid-cols-12 items-center gap-x-(--layout-gutter) gap-y-(--space-xl) px-(--layout-margin)">
        {/* Orchestration topology — right third, L1.5. DOM-first so the
            panel stacks above it naturally on overlap at mid widths. */}
        <Reveal
          kind="resolve"
          step={2}
          className="z-(--z-ambient) col-span-12 md:col-span-5 md:col-start-8 md:row-start-1"
        >
          <NeuralViz />
        </Reveal>

        <div className="col-span-12 flex flex-col gap-(--space-md) md:col-span-6 md:col-start-2 md:row-start-1">
          <Reveal kind="mono" step={0}>
            <MonoLabel as="p">DEPTH.01 · ABOUT / 01</MonoLabel>
          </Reveal>
          <h2 id="core-title" className="sr-only">
            About
          </h2>

          <Reveal kind="panel" step={1}>
            <Panel
              id="core-operator"
              label="OPERATOR"
              meta={IDENTITY.role}
              status={
                <>
                  <StatusDot tone="ok" />
                  operational
                </>
              }
            >
              <div className="flex flex-col gap-(--space-md)">
                <p className="max-w-(--measure-body)">{IDENTITY.summary}</p>

                <dl className="grid grid-cols-1 gap-x-(--space-md) gap-y-(--space-2xs) border-t-(length:--hairline-width) border-(color:--nexus-hairline) pt-(--space-sm) sm:grid-cols-2">
                  {IDENTITY.capabilities.map((capability, i) => (
                    <Reveal
                      key={capability}
                      kind="mono"
                      step={3 + i}
                      className="flex items-baseline gap-(--space-2xs)"
                    >
                      <MonoLabel as="dt" className="opacity-60">
                        cap.{String(i + 1).padStart(2, "0")}
                      </MonoLabel>
                      <dd className="text-(length:--text-mono) leading-(--leading-mono) [font-family:var(--font-machine)]">
                        {capability}
                      </dd>
                    </Reveal>
                  ))}
                </dl>

                {/* The one personal line — what he enjoys building.
                    Mono, lowercase, quiet: an interest readout, not a
                    bio flourish. */}
                <Reveal kind="mono" step={9}>
                  <MonoLabel as="p" className="normal-case">
                    <span className="opacity-60">enjoys building </span>
                    {IDENTITY.enjoys}
                  </MonoLabel>
                </Reveal>

                {/* Status line — ignites last; the room is running
                    before its only live row speaks. */}
                <Reveal kind="mono" step={10}>
                  <MonoLabel
                    as="p"
                    className="flex flex-wrap items-baseline gap-x-(--space-sm) gap-y-(--space-3xs) border-t-(length:--hairline-width) border-(color:--nexus-hairline) pt-(--space-sm)"
                  >
                    <span>
                      local{" "}
                      <LocalTime
                        timeZone={IDENTITY.timeZone}
                        label={IDENTITY.timeZoneLabel}
                      />
                    </span>
                    <span aria-hidden>·</span>
                    <span>focus: {IDENTITY.focus}</span>
                    <span aria-hidden>·</span>
                    <span>{IDENTITY.availability}</span>
                  </MonoLabel>
                </Reveal>
              </div>
            </Panel>
          </Reveal>
        </div>
      </RevealGroup>
    </section>
  );
}
