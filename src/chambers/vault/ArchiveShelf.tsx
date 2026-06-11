import { ARCHIVED_SYSTEMS } from "@/content/systems";
import { MonoLabel } from "@/primitives/MonoLabel";
import { Panel } from "@/primitives/Panel";

/**
 * ArchiveShelf — the operational scars (spatial-language §5.1;
 * homepage-experience §4.2: load-bearing for credibility, never cut
 * for cleanliness).
 *
 * The quieter sub-band after the lateral track. Archived systems hold
 * 50% presence (the Panel primitive's dormant state); hover restores
 * full clarity — the archive accepts attention but never demands it.
 * Archival dignity, not disabled cards: every record keeps its full
 * anatomy (designation, role, status word, retirement note), and the
 * retirement note is ALWAYS rendered — what it was and why it retired
 * is information, and information is never hover-gated (touch law).
 *
 * Semantics: a labeled region with real articles — screen readers and
 * the static tier read the archive exactly as the sighted hover user
 * does, minus the opacity theater.
 */
export function ArchiveShelf() {
  if (ARCHIVED_SYSTEMS.length === 0) return null;

  return (
    <div aria-labelledby="archive-label" role="region">
      <MonoLabel as="p" id="archive-label" className="mb-(--space-md)">
        ARCHIVE · {ARCHIVED_SYSTEMS.length} retired
      </MonoLabel>

      <div className="grid grid-cols-1 gap-(--space-md) md:grid-cols-2">
        {ARCHIVED_SYSTEMS.map((system) => (
          <Panel
            key={system.slug}
            as="article"
            id={`sys-${system.slug}`}
            label={system.designation}
            meta={system.role}
            status={<>archived</>}
            state="dormant"
            interactive
            inset="compact"
          >
            <div className="flex flex-col gap-(--space-2xs)">
              <h3 className="text-(length:--text-body) leading-(--leading-heading) [font-weight:var(--weight-medium)]">
                {system.title}
              </h3>
              <p className="max-w-(--measure-body) text-(length:--text-mono) leading-(--leading-mono) text-(color:--nexus-muted)">
                {system.summary}
              </p>
              {system.archived !== undefined && (
                <MonoLabel as="p" className="mt-(--space-2xs)">
                  &gt; retired {system.archived.retired} — {system.archived.note}
                </MonoLabel>
              )}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
