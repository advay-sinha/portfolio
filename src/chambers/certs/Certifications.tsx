import {
  CERTIFICATIONS,
  PROVIDER_COUNT,
  type CertificationRecord,
} from "@/content/certifications";
import { cn } from "@/lib/utils";
import { Reveal, RevealGroup } from "@/motion/RevealGroup";
import { MonoLabel } from "@/primitives/MonoLabel";

/**
 * Certifications — DEPTH.04, the credential archive (Phase 14: this
 * chamber replaces the telemetry engine room; the atmosphere and
 * composition law stay, the semantics become credential records).
 *
 * Server component, zero behavior: every record is a real anchor to a
 * real PDF served from this facility (/public/certificates). No client
 * fetch, no viewers, no badges — verification is a link to the issued
 * artifact, nothing more.
 *
 * Layout — a ledger, not a trophy wall: compact two-column record rows
 * separated by hairlines; mono carries every piece of metadata
 * (issue stamp, provider, domain, credential id); Grotesk speaks only
 * the credential titles. Composition keeps the engine room's focal
 * law: records right (cols 5–12), the archive note left (cols 2–4).
 *
 * Emphasis discipline: no provider logos, no color coding, no
 * gamification. Hierarchy is brightness and order only — newest first,
 * the way an archive reads from the present backwards.
 *
 * Arrival: marker (0), heading (1), archive note (2), then the ledger
 * resolves as a single unit (3, cinematic opacity — records were
 * already on file; nothing "unlocks").
 */

export function Certifications() {
  const subReadout = `${CERTIFICATIONS.length} records · ${PROVIDER_COUNT} issuers`;

  return (
    <section aria-labelledby="live-title" className="relative w-full">
      {/* L1 ambient — quiet cyan, center: records under steady light.
          Slow drift, frozen under reduced motion. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-(--z-ambient) opacity-70 animate-[nexus-drift_14s_var(--ease-linear)_infinite] [animation-play-state:var(--ambient-play-state)]"
        style={{
          background:
            "radial-gradient(46% 42% at 52% 55%, var(--nexus-glow-dim), transparent 74%)",
        }}
      />

      <RevealGroup className="relative mx-auto grid w-full max-w-(--layout-max) grid-cols-12 gap-x-(--layout-gutter) gap-y-(--space-xl) px-(--layout-margin)">
        <div className="col-span-12 flex flex-col gap-(--space-2xs) md:col-span-8 md:col-start-5">
          <Reveal kind="mono" step={0}>
            <MonoLabel as="p">DEPTH.04 · CERTIFICATIONS / 04</MonoLabel>
          </Reveal>
          <Reveal kind="panel" step={1}>
            <h2
              id="live-title"
              className="text-(length:--text-h2) leading-(--leading-heading) [font-weight:var(--weight-medium)]"
            >
              Certifications
            </h2>
          </Reveal>
          <Reveal kind="mono" step={2}>
            <MonoLabel as="p">{subReadout}</MonoLabel>
          </Reveal>
        </div>

        {/* Archive note — cols 2–4. What this ledger is and is not. */}
        <Reveal
          kind="mono"
          step={2}
          className="col-span-12 md:col-span-3 md:col-start-2"
        >
          <MonoLabel
            as="p"
            className="flex flex-col gap-(--space-3xs) border-t-(length:--hairline-width) border-(color:--nexus-hairline) pt-(--space-sm)"
          >
            <span className="opacity-60">credential ledger</span>
            <span>each record links to its issued artifact</span>
            <span className="normal-case opacity-60">
              &gt; pdf · served from this facility
            </span>
          </MonoLabel>
        </Reveal>

        {/* The ledger — cols 5–12, resolving as one unit. */}
        <Reveal
          kind="resolve"
          step={3}
          className="col-span-12 md:col-span-8 md:col-start-5"
        >
          <ul className="grid list-none grid-cols-1 gap-x-(--layout-gutter) lg:grid-cols-2">
            {CERTIFICATIONS.map((record) => (
              <CertificationRow key={record.file} record={record} />
            ))}
          </ul>
        </Reveal>
      </RevealGroup>
    </section>
  );
}

/**
 * One credential record — the whole row is the anchor (≥44px target,
 * the touch law). Hover is the facility's standard ignition: hairline
 * warms, the view affordance brightens. Nothing moves.
 */
function CertificationRow({ record }: { record: CertificationRecord }) {
  return (
    <li>
      <a
        href={record.file}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "group flex flex-col gap-(--space-3xs) border-t-(length:--hairline-width) border-(color:--nexus-hairline) py-(--space-sm)",
          "[transition:var(--transition-panel-elevate)]",
          "hover:border-(color:--nexus-glow-dim) focus-visible:border-(color:--nexus-glow-dim)"
        )}
      >
        <MonoLabel
          as="p"
          className="flex flex-wrap items-baseline gap-x-(--space-2xs)"
        >
          <span>{record.issued}</span>
          <span aria-hidden>·</span>
          <span>{record.provider}</span>
          <span className="ml-auto opacity-60">{record.domain}</span>
        </MonoLabel>

        <span className="flex items-baseline justify-between gap-(--space-sm)">
          <span className="text-(color:--nexus-text)">{record.title}</span>
          <MonoLabel
            as="span"
            className="shrink-0 text-(color:--nexus-muted) [transition:color_var(--motion-instant)_var(--ease-out-facility)] group-hover:text-(color:--nexus-glow) group-focus-visible:text-(color:--nexus-glow)"
          >
            view
          </MonoLabel>
        </span>

        {record.credentialId !== undefined && (
          <MonoLabel as="p" className="normal-case break-all opacity-50">
            id: {record.credentialId}
          </MonoLabel>
        )}
      </a>
    </li>
  );
}
