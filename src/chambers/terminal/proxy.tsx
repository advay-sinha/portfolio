/**
 * Terminal silhouette proxy (strata-spec §4.1): structure only — the
 * single centered panel outline at silhouette presence. No text, no
 * data, no live filter (softness is baked via opacity, not blur).
 * Geometry mirrors TerminalInterface's composition: one panel,
 * max-w-3xl, centered — the honest-anticipation law by construction.
 *
 * Mounted by the G1 layer when the visibility horizon opens; renders
 * nothing meaningful on its own and is always aria-hidden.
 */
export function TerminalProxy() {
  return (
    <div aria-hidden className="mx-auto w-full max-w-3xl px-(--layout-margin)">
      <div className="h-56 rounded-(--radius-panel) border border-(color:--nexus-hairline) opacity-60">
        <div className="mx-(--space-md) mt-(--space-md) h-2 w-1/4 border-b-(length:--hairline-width) border-(color:--nexus-hairline)" />
      </div>
    </div>
  );
}
