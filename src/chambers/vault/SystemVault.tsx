import { ArchiveShelf } from "@/chambers/vault/ArchiveShelf";
import { SystemPanel } from "@/chambers/vault/SystemPanel";
import { VaultTrack } from "@/chambers/vault/VaultTrack";
import {
  ACTIVE_SYSTEMS,
  ARCHIVED_SYSTEMS,
  EXPERIMENTAL_COUNT,
} from "@/content/systems";
import { Reveal, RevealGroup } from "@/motion/RevealGroup";
import { MonoLabel } from "@/primitives/MonoLabel";

/**
 * SystemVault — DEPTH.02, the machinery (homepage-experience §4.2).
 * The centerpiece chamber: maximum density, controlled overload —
 * an archive corridor, not a showcase.
 *
 * Server component. Composition, zoning, and semantics live here;
 * every behavior lives in the islands it composes (VaultTrack owns the
 * pin; panels own nothing but markup).
 *
 * Zoning, top to bottom:
 * 1. Arrival block — depth marker, heading, the sub-readout
 *    (`N systems · N archived · N experimental` — counts DERIVED from
 *    content/systems.ts, real by construction).
 * 2. The lateral track — active systems traverse as one dominant focal
 *    mass while the camera plateaus. Asymmetry comes from the traverse
 *    itself: one panel holds L4 focus, the rest recede.
 * 3. The archive shelf — the visibly quieter sub-band of retired
 *    systems. Lower energy by design; scars, not failures to hide.
 *
 * Ambient: glow-dim cyan, upper-left, slow drift — the Vault's beacon
 * color (strata-spec §6), present before the visitor arrives.
 *
 * Arrival reveals: marker (0), heading (1), sub-readout (2); panels
 * rise inside the track (3,4,5 — transforms on panel wrappers inside
 * the pinned subtree, never on its ancestors); the shelf is its own
 * later group — it settles before the visitor reaches it.
 */
export function SystemVault() {
  // Real counts only — zero-count categories simply don't speak.
  const subReadout = [
    `${ACTIVE_SYSTEMS.length} systems`,
    ARCHIVED_SYSTEMS.length > 0 ? `${ARCHIVED_SYSTEMS.length} archived` : null,
    EXPERIMENTAL_COUNT > 0 ? `${EXPERIMENTAL_COUNT} experimental` : null,
  ]
    .filter((part) => part !== null)
    .join(" · ");

  return (
    <section aria-labelledby="vault-title" className="relative w-full">
      {/* L1 ambient — cyan, upper-left, slow drift (frozen under reduced motion). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-(--z-ambient) animate-[nexus-drift_18s_var(--ease-linear)_infinite] [animation-play-state:var(--ambient-play-state)]"
        style={{
          background:
            "radial-gradient(40% 36% at 24% 18%, var(--nexus-glow-dim), transparent 72%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-(--layout-max) px-(--layout-margin)">
        <RevealGroup className="flex flex-col gap-(--space-2xs) pb-(--space-xl)">
          <Reveal kind="mono" step={0}>
            <MonoLabel as="p">DEPTH.02 · SYS.VAULT / 02</MonoLabel>
          </Reveal>
          <Reveal kind="panel" step={1}>
            <h2
              id="vault-title"
              className="text-(length:--text-h2) leading-(--leading-heading) [font-weight:var(--weight-medium)]"
            >
              System Vault
            </h2>
          </Reveal>
          <Reveal kind="mono" step={2}>
            <MonoLabel as="p">{subReadout}</MonoLabel>
          </Reveal>
        </RevealGroup>
      </div>

      {/* The lateral track. Full-bleed: the traverse uses the whole
          viewport width; panels carry their own measure. */}
      <RevealGroup>
        <VaultTrack>
          {ACTIVE_SYSTEMS.map((system, i) => (
            <Reveal
              key={system.slug}
              kind="panel"
              step={3 + i}
              className="shrink-0 px-(--layout-margin) group-data-[track-active]/track:w-[min(64vw,52rem)] group-data-[track-active]/track:px-0 group-data-[track-active]/track:first:ml-(--layout-margin)"
            >
              <SystemPanel system={system} className="h-full" />
            </Reveal>
          ))}
        </VaultTrack>
      </RevealGroup>

      {/* The quieter sub-band after the traverse releases. Renders only
          when retired systems actually exist — no empty shelf theater. */}
      {ARCHIVED_SYSTEMS.length > 0 && (
        <div className="relative mx-auto w-full max-w-(--layout-max) px-(--layout-margin) pt-(--space-3xl)">
          <RevealGroup>
            <Reveal kind="mono" step={0}>
              <ArchiveShelf />
            </Reveal>
          </RevealGroup>
        </div>
      )}
    </section>
  );
}
