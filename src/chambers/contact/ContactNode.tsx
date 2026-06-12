import { ChannelRegistry } from "@/chambers/contact/ChannelRegistry";
import { CONTACT } from "@/content/identity";
import { Reveal, RevealGroup } from "@/motion/RevealGroup";
import { MonoLabel } from "@/primitives/MonoLabel";
import { StatusDot } from "@/primitives/StatusDot";

/**
 * ContactNode — DEPTH.06, the quiet room (homepage-experience §4.6).
 * The facility stops speaking; the engineer speaks — once.
 *
 * Server component, zero interaction islands: the chamber's whole
 * vocabulary is anchors and a static readout. No form (a giant intake
 * form is a CRM pattern, not a channel), no CTA, no sign-off energy.
 * The page's final interactive moment is its smallest: four quiet
 * links.
 *
 * Ambient: one faint static glow-dim pool — the only chamber whose
 * ambient does NOT drift (stillness law). No animation class at all;
 * reduced motion and full motion are identical here by construction.
 *
 * Composition (strata-spec §3.1; Phase 14.2 — slightly more intimate):
 * sentence + channel registry, cols 3–7. The registry IS the chamber:
 * four direct channels in a vertical mono ledger, nothing else.
 * CONTACT.sentence is the page's single first-person line.
 *
 * Page end: ~30vh of near-empty void, then the footer-small mono line
 * with one pulsing dot — the facility keeps running after the visitor
 * leaves. The year derives from the build clock, never hardcoded.
 *
 * Arrival: marker (0), the sentence (1), channel panel (2), link row
 * (3). The footer is not revealed — it was always there.
 */
export function ContactNode() {
  return (
    <section aria-labelledby="contact-title" className="relative w-full">
      {/* L1 ambient — faint static pool. Deliberately no drift keyframe. */}
      {/* Tighter, dimmer pool than any chamber above — the deepest,
          quietest room. Still no drift: stillness law. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-(--z-ambient) opacity-30"
        style={{
          background:
            "radial-gradient(30% 26% at 40% 60%, var(--nexus-glow-dim), transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-(--layout-max) grid-cols-12 gap-x-(--layout-gutter) px-(--layout-margin)">
        <RevealGroup className="col-span-12 flex flex-col gap-(--space-lg) md:col-span-5 md:col-start-3">
          <div className="flex flex-col gap-(--space-2xs)">
            <Reveal kind="mono" step={0}>
              <MonoLabel as="p">DEPTH.06 · NODE: CONTACT</MonoLabel>
            </Reveal>
            <h2 id="contact-title" className="sr-only">
              Contact Node
            </h2>
            <Reveal kind="panel" step={1}>
              {/* The only first-person sentence on the page. */}
              <p className="max-w-(--measure-body) text-(length:--text-h3) leading-(--leading-heading)">
                {CONTACT.sentence}
              </p>
            </Reveal>
          </div>

          <Reveal kind="panel" step={2}>
            <ChannelRegistry />
          </Reveal>
        </RevealGroup>
      </div>

      {/* The footer breath — ~30vh of void, then the smallest line on
          the page. The facility keeps running after the visitor leaves. */}
      <footer className="relative mt-[30vh]">
        <div className="mx-auto w-full max-w-(--layout-max) px-(--layout-margin)">
          <MonoLabel
            as="p"
            className="inline-flex items-baseline gap-(--space-2xs)"
          >
            PORTFOLIO · {new Date().getFullYear()} · status: operational
            <StatusDot tone="ok" className="self-center" />
          </MonoLabel>
        </div>
      </footer>
    </section>
  );
}
