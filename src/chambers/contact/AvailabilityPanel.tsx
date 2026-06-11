import { CONTACT, IDENTITY } from "@/content/identity";
import { MonoLabel } from "@/primitives/MonoLabel";
import { Panel } from "@/primitives/Panel";
import { StatusDot } from "@/primitives/StatusDot";

/**
 * AvailabilityPanel — channel state as a quiet readout.
 *
 * The page's last panel: L2 structure, mono <dl>, no form, no CTA.
 * Every row derives from content/identity.ts — the same truth the
 * terminal's `contact` command reads. Fully static by design: this is
 * the stillness chamber (homepage-experience §4.6), so the timezone
 * is a label, not a ticking clock — nothing in the quiet room moves
 * except the status dot's heartbeat.
 */
export function AvailabilityPanel() {
  return (
    <Panel
      as="div"
      label="CHANNEL"
      meta={IDENTITY.focus}
      status={
        <>
          <StatusDot tone="ok" />
          {IDENTITY.availability}
        </>
      }
    >
      <dl className="flex flex-col gap-(--space-2xs)">
        {CONTACT.state.map((row) => (
          <div
            key={row.term}
            className="flex flex-wrap items-baseline gap-x-(--space-sm)"
          >
            <MonoLabel as="dt" className="opacity-60">
              {row.term}
            </MonoLabel>
            <dd className="text-(length:--text-mono) leading-(--leading-mono) text-(color:--nexus-muted) [font-family:var(--font-machine)]">
              {row.value}
            </dd>
          </div>
        ))}
        <div className="flex flex-wrap items-baseline gap-x-(--space-sm)">
          <MonoLabel as="dt" className="opacity-60">
            timezone
          </MonoLabel>
          <dd className="text-(length:--text-mono) leading-(--leading-mono) text-(color:--nexus-muted) [font-family:var(--font-machine)]">
            {IDENTITY.timeZone.toLowerCase()} · {IDENTITY.timeZoneLabel.toLowerCase()}
          </dd>
        </div>
      </dl>
    </Panel>
  );
}
