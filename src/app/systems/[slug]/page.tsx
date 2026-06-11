import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Schematic } from "@/chambers/vault/Schematic";
import { SYSTEMS, systemBySlug } from "@/content/systems";
import { Reveal, RevealGroup } from "@/motion/RevealGroup";
import { MonoLabel } from "@/primitives/MonoLabel";
import { StatusDot } from "@/primitives/StatusDot";

/**
 * The dossier route — "the Cut" (homepage-experience §4.2; strata-spec
 * §15: the single scene change reachable from the homepage; it exits
 * the depth simulation entirely).
 *
 * Choreography: a hard cut into a sealed archive room. No shared
 * elements, no morphing cards, no page-slide — the route changes, the
 * void persists (same G-less black, the dossier owns no depth system),
 * and the document rises from darkness through the one Framer
 * enter: the existing RevealGroup vocabulary (threshold beat, then the
 * record resolves section by section). Reduced motion collapses it to
 * the quiet opacity set via the MotionBoundary, like everything else.
 *
 * Anatomy is the postmortem, not the pitch: overview, architecture,
 * constraints, tradeoffs, failure notes, stack, reasoning, future work.
 * Failure notes are mandatory content — the archive preserves scars.
 *
 * Navigation: statically generated per system (dynamicParams=false),
 * works JS-disabled, and `return to vault` is a plain anchor back to
 * /#vault — the browser lands the visitor at the Vault with everything
 * above arrived settled (deep-link law). No scroll state is faked or
 * restored manually; the platform owns it.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return SYSTEMS.filter((s) => s.dossier !== undefined).map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const system = systemBySlug(slug);
  return {
    title: system ? `${system.designation} — ${system.title}` : "DOSSIER",
    description: system?.summary,
  };
}

export default async function DossierPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const system = systemBySlug(slug);
  if (system?.dossier === undefined) notFound();
  const dossier = system.dossier;

  const listSections: [string, readonly string[]][] = [
    ["constraints", dossier.constraints],
    ["tradeoffs", dossier.tradeoffs],
    ["failure notes", dossier.failures],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-(--layout-margin) py-(--space-3xl)">
      <RevealGroup className="flex flex-col gap-(--space-xl)">
        {/* Archive room header */}
        <Reveal kind="mono" step={0} className="flex flex-col gap-(--space-md)">
          <Link
            href="/#vault"
            className="self-start text-(length:--text-mono) text-(color:--nexus-muted) [font-family:var(--font-machine)] [transition:color_var(--motion-instant)_var(--ease-out-facility)] hover:text-(color:--nexus-glow) focus-visible:text-(color:--nexus-glow)"
          >
            &gt; return to vault
          </Link>
          <MonoLabel as="p">
            DOSSIER · {system.designation} ·{" "}
            <span className="inline-flex items-baseline gap-(--space-2xs)">
              <StatusDot
                tone={system.status === "experimental" ? "warn" : "ok"}
              />
              {system.status}
            </span>
          </MonoLabel>
        </Reveal>

        <Reveal kind="panel" step={1}>
          <h1 className="text-(length:--text-h1) leading-(--leading-display) tracking-(--tracking-display) [font-weight:var(--weight-medium)]">
            {system.title}
          </h1>
          <p className="mt-(--space-sm) max-w-(--measure-body) text-(color:--nexus-muted)">
            {system.constraint}
          </p>
        </Reveal>

        <Reveal kind="mono" step={2}>
          <DossierSection label="operational overview">
            <p>{dossier.overview}</p>
          </DossierSection>
        </Reveal>

        <Reveal kind="resolve" step={3}>
          <DossierSection label="architecture">
            <p>{dossier.architecture}</p>
            {system.schematicId !== null && (
              <Schematic
                id={system.schematicId}
                className="mt-(--space-md) h-auto w-full border-y-(length:--hairline-width) border-(color:--nexus-hairline) py-(--space-sm)"
              />
            )}
          </DossierSection>
        </Reveal>

        {listSections.map(([label, items], i) => (
          <Reveal key={label} kind="mono" step={4 + i}>
            <DossierSection label={label}>
              <ul className="flex list-none flex-col gap-(--space-2xs)">
                {items.map((item) => (
                  <li
                    key={item}
                    className="max-w-(--measure-body) border-l-(length:--hairline-width) border-(color:--nexus-hairline) pl-(--space-sm)"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </DossierSection>
          </Reveal>
        ))}

        <Reveal kind="mono" step={7}>
          <DossierSection label="infrastructure">
            <MonoLabel as="p">{system.stack.join(" · ")}</MonoLabel>
          </DossierSection>
        </Reveal>

        <Reveal kind="mono" step={8}>
          <DossierSection label="engineering reasoning">
            <p>{dossier.reasoning}</p>
          </DossierSection>
        </Reveal>

        <Reveal kind="mono" step={9}>
          <DossierSection label="future work">
            <ul className="flex list-none flex-col gap-(--space-2xs)">
              {dossier.future.map((item) => (
                <li key={item} className="max-w-(--measure-body)">
                  <span aria-hidden className="text-(color:--nexus-muted)">
                    &gt;{" "}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </DossierSection>
        </Reveal>
      </RevealGroup>
    </main>
  );
}

/** One labeled record section — mono label row, hairline rule, content. */
function DossierSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={label}
      className="border-t-(length:--hairline-width) border-(color:--nexus-hairline) pt-(--space-md)"
    >
      <MonoLabel as="p" className="mb-(--space-sm)">
        {label}
      </MonoLabel>
      <div className="flex max-w-(--measure-body) flex-col gap-(--space-sm)">
        {children}
      </div>
    </section>
  );
}
