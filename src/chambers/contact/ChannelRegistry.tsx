import { CONTACT, type ContactChannel } from "@/content/identity";
import { cn } from "@/lib/utils";
import { MonoLabel } from "@/primitives/MonoLabel";
import { Panel } from "@/primitives/Panel";
import { StatusDot } from "@/primitives/StatusDot";

/**
 * ChannelRegistry — the operator's direct channels, as a registry
 * (Phase 14.2: this replaces the availability readout; the channels
 * ARE the chamber now, not a footnote under it).
 *
 * One L2 panel, a vertical mono registry inside: label column dim,
 * value column bright — the same label/readout hierarchy the terminal
 * uses, because this is the same infrastructure one room over. Every
 * row is one real anchor spanning the full row (≥44px target, the
 * touch law): email is mailto, github/linkedin open in a new tab with
 * rel safety, the resume downloads the real PDF.
 *
 * Hover is the facility's standard ignition only — value warms to
 * glow, the row's hairline brightens. No cards, no icons, no buttons,
 * nothing moves.
 */

/** Per-channel anchor behavior — external opens away, the PDF downloads. */
function anchorProps(channel: ContactChannel) {
  if (channel.href.startsWith("http")) {
    return { rel: "noreferrer", target: "_blank" } as const;
  }
  if (channel.href.endsWith(".pdf")) {
    return { download: "" } as const;
  }
  return {};
}

export function ChannelRegistry() {
  return (
    <Panel
      as="div"
      label="CHANNELS"
      meta="direct"
      status={
        <>
          <StatusDot tone="ok" />
          open
        </>
      }
    >
      <ul className="flex list-none flex-col">
        {CONTACT.channels.map((channel) => (
          <li key={channel.id}>
            <a
              href={channel.href}
              {...anchorProps(channel)}
              className={cn(
                "group flex min-h-11 flex-wrap items-baseline gap-x-(--space-sm) gap-y-(--space-3xs) py-(--space-2xs)",
                "border-t-(length:--hairline-width) border-(color:--nexus-hairline) first:border-t-0",
                "[transition:var(--transition-panel-elevate)]",
                "hover:border-(color:--nexus-glow-dim) focus-visible:border-(color:--nexus-glow-dim)"
              )}
            >
              <MonoLabel as="span" className="w-24 shrink-0 opacity-50">
                {channel.label}
              </MonoLabel>
              <span
                className={cn(
                  "text-(length:--text-mono) leading-(--leading-mono) text-(color:--nexus-text) [font-family:var(--font-machine)]",
                  "[transition:color_var(--motion-instant)_var(--ease-out-facility)]",
                  "group-hover:text-(color:--nexus-glow) group-focus-visible:text-(color:--nexus-glow)"
                )}
              >
                {channel.value}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
