/**
 * Contact Node silhouette proxy (strata-spec §4.1): structure only —
 * the left-set copy block and the availability panel as hairline
 * outlines, nothing readable at distance. Geometry mirrors
 * ContactNode's composition (copy + panel cols 3–8, link row beneath).
 * Always aria-hidden; mounted by the G1 layer only.
 */
export function ContactProxy() {
  return (
    <div aria-hidden className="mx-auto w-full max-w-(--layout-max) px-(--layout-margin)">
      <div className="grid grid-cols-12 gap-x-(--layout-gutter) opacity-60">
        <div className="col-span-12 flex flex-col gap-(--space-md) md:col-span-6 md:col-start-3">
          <div className="h-2 w-1/3 border-b-(length:--hairline-width) border-(color:--nexus-hairline)" />
          <div className="h-24 rounded-(--radius-panel) border border-(color:--nexus-hairline)" />
          <div className="h-2 w-2/3 border-b-(length:--hairline-width) border-(color:--nexus-hairline)" />
        </div>
      </div>
    </div>
  );
}
