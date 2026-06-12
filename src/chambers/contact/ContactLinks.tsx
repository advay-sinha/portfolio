import { CONTACT } from "@/content/identity";
import { cn } from "@/lib/utils";

/**
 * ContactLinks — the single mono link row (homepage-experience §4.6):
 * every channel in one quiet line, no icon grid, no social spam.
 * Real anchors, the facility's standard hover ignition, nothing else.
 * Server component; CSS owns every response.
 */
export function ContactLinks() {
  return (
    <ul className="flex list-none flex-wrap items-baseline gap-x-(--space-md) gap-y-(--space-2xs)">
      {CONTACT.channels.map((channel) => (
        <li key={channel.id}>
          <a
            href={channel.href}
            {...(channel.href.startsWith("http") ||
            channel.href.endsWith(".pdf")
              ? { rel: "noreferrer", target: "_blank" }
              : {})}
            className={cn(
              "text-(length:--text-mono) leading-(--leading-mono) text-(color:--nexus-muted) [font-family:var(--font-machine)]",
              "[transition:color_var(--motion-instant)_var(--ease-out-facility)]",
              "hover:text-(color:--nexus-glow) focus-visible:text-(color:--nexus-glow)"
            )}
          >
            {channel.label}: {channel.value}
          </a>
        </li>
      ))}
    </ul>
  );
}
