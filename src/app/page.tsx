import { BOOT_LINES } from "@/chambers/boot/boot-lines";
import { BootSequence } from "@/chambers/boot/BootSequence";
import { NeuralCore } from "@/chambers/core/NeuralCore";
import { SystemVault } from "@/chambers/vault/SystemVault";
import { IDENTITY } from "@/content/identity";
import { DeepVoid } from "@/descent/DeepVoid";
import { FogVeil } from "@/descent/FogVeil";
import { NavRail, type NavRailItem } from "@/descent/NavRail";
import { SCROLL_MAP, type StratumId } from "@/descent/scroll-map";
import { StrataPlane } from "@/descent/StrataPlane";
import { cn } from "@/lib/utils";
import { MonoLabel } from "@/primitives/MonoLabel";
import { Panel } from "@/primitives/Panel";

/**
 * Homepage — the descent, laid out as a real document.
 *
 * The page renders SCROLL_MAP directly: focus segments become
 * StrataPlanes at their §9 lengths, corridor segments become spacers.
 * Document height therefore equals the scroll map by construction.
 *
 * Built chambers: Boot Sequence (DEPTH.00) and Neural Core (DEPTH.01).
 * The boot→core passage is environmental, not choreographed: the boot
 * departs through C0's thin fog (engine phases), and the Core arrives
 * led by its violet ambient — light emergence, no scene cut. Remaining
 * strata hold structural shells until their chambers land.
 */

const NAV_LABELS: Record<StratumId, string> = {
  boot: "BOOT",
  core: "SYS.CORE",
  vault: "SYS.VAULT",
  logs: "SYS.LOGS",
  live: "SYS.LIVE",
  terminal: "TERMINAL",
  contact: "CONTACT",
};

const NAV_ITEMS: NavRailItem[] = SCROLL_MAP.flatMap((segment) =>
  segment.kind === "focus"
    ? [
        {
          id: segment.id,
          depth: `DEPTH.0${segment.depth}`,
          label: NAV_LABELS[segment.id],
        },
      ]
    : []
);

type ShellId = Exclude<StratumId, "boot" | "core" | "vault">;

interface ShellSpec {
  /** Full corridor-marker designation shown in the chamber. */
  marker: string;
  /** Chamber name — Grotesk, never uppercase. */
  title: string;
  /** Composition note from strata-spec §3.1; doubles as shell metadata. */
  note: string;
  /** Focal-mass placement on the 12-col grid (desktop). */
  placement: string;
  /** Centered composition — Terminal only (allowed centered composition #2). */
  centered?: boolean;
}

const SHELLS: Record<ShellId, ShellSpec> = {
  logs: {
    marker: "DEPTH.03 · SYS.LOGS / 03",
    title: "Mission Logs",
    note: "center-left spine col 6 · entries alternate cols 2–5 / 7–11",
    placement: "md:col-span-7 md:col-start-3",
  },
  live: {
    marker: "DEPTH.04 · SYS.LIVE / 04",
    title: "Live Systems",
    note: "focal mass right · telemetry cols 5–12 · source notes cols 2–4",
    placement: "md:col-span-8 md:col-start-5",
  },
  terminal: {
    marker: "DEPTH.05 · TERMINAL",
    title: "Terminal Interface",
    note: "centered console · single panel ≈60% width",
    placement: "md:col-span-6 md:col-start-4",
    centered: true,
  },
  contact: {
    marker: "DEPTH.06 · NODE: CONTACT",
    title: "Contact Node",
    note: "focal mass left · copy + form cols 3–8 · the quiet room",
    placement: "md:col-span-6 md:col-start-3",
  },
};

function chamberFor(id: StratumId) {
  switch (id) {
    case "boot":
      return (
        <BootSequence
          name={IDENTITY.name}
          role={IDENTITY.role}
          lines={BOOT_LINES}
        />
      );
    case "core":
      return <NeuralCore />;
    case "vault":
      return <SystemVault />;
    default:
      return <ChamberShell id={id} />;
  }
}

export default function Home() {
  return (
    <>
      <DeepVoid />
      <FogVeil />
      <NavRail items={NAV_ITEMS} />
      <main className="relative flex-1">
        {SCROLL_MAP.map((segment) =>
          segment.kind === "focus" ? (
            <StrataPlane
              key={segment.id}
              id={segment.id}
              depth={segment.depth}
              className="flex items-center py-(--section-padding)"
              style={{ minHeight: `${segment.length}vh` }}
            >
              {chamberFor(segment.id)}
            </StrataPlane>
          ) : (
            <CorridorSpacer
              key={segment.id}
              id={segment.id}
              lengthVh={segment.length}
            />
          )
        )}
      </main>
    </>
  );
}

/**
 * Corridor — empty depth between strata (strata-spec §11: a corridor
 * with nothing but fog and the G0 grid is correct). Height scales via
 * --corridor-scale, mirroring the scroll map's viewport derivation.
 */
function CorridorSpacer({ id, lengthVh }: { id: string; lengthVh: number }) {
  return (
    <div
      aria-hidden
      data-corridor={id}
      style={{ height: `calc(${lengthVh}vh * var(--corridor-scale))` }}
    />
  );
}

/**
 * Structural placeholder for one unbuilt chamber. Owns the semantic
 * landmark; replaced wholesale when its chamber lands.
 */
function ChamberShell({ id }: { id: ShellId }) {
  const { marker, title, note, placement, centered } = SHELLS[id];
  const headingId = `${id}-title`;

  return (
    <section aria-labelledby={headingId} className="w-full">
      <div className="mx-auto grid w-full max-w-(--layout-max) grid-cols-12 gap-x-(--layout-gutter) px-(--layout-margin)">
        <div
          className={cn(
            "col-span-12 flex flex-col gap-(--space-md)",
            centered && "items-center text-center",
            placement
          )}
        >
          <MonoLabel as="p">{marker}</MonoLabel>
          <h2
            id={headingId}
            className="text-(length:--text-h2) leading-(--leading-heading) [font-weight:var(--weight-medium)]"
          >
            {title}
          </h2>
          <Panel
            as="div"
            label={`SHELL.${id.toUpperCase()}`}
            meta={note}
            inset="compact"
            className="w-full"
          >
            <p className="text-(length:--text-mono) leading-(--leading-mono) text-(color:--nexus-muted) [font-family:var(--font-machine)]">
              &gt; chamber framed — installation pending
            </p>
          </Panel>
        </div>
      </div>
    </section>
  );
}
