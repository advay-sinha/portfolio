import { BOOT_LINES } from "@/chambers/boot/boot-lines";
import { BootSequence } from "@/chambers/boot/BootSequence";
import { ContactNode } from "@/chambers/contact/ContactNode";
import { NeuralCore } from "@/chambers/core/NeuralCore";
import { LiveSystems } from "@/chambers/live/LiveSystems";
import { MissionLogs } from "@/chambers/logs/MissionLogs";
import { TerminalInterface } from "@/chambers/terminal/TerminalInterface";
import { SystemVault } from "@/chambers/vault/SystemVault";
import { IDENTITY } from "@/content/identity";
import { DeepVoid } from "@/descent/DeepVoid";
import { FogVeil } from "@/descent/FogVeil";
import { NavRail, type NavRailItem } from "@/descent/NavRail";
import { SCROLL_MAP, type StratumId } from "@/descent/scroll-map";
import { StrataPlane } from "@/descent/StrataPlane";
import { MonoLabel } from "@/primitives/MonoLabel";

/**
 * Homepage — the descent, laid out as a real document.
 *
 * The page renders SCROLL_MAP directly: focus segments become
 * StrataPlanes at their §9 lengths, corridor segments become spacers.
 * Document height therefore equals the scroll map by construction.
 *
 * All seven chambers are installed: Boot (DEPTH.00) through Contact
 * (DEPTH.06). Passages are environmental, not choreographed: each
 * stratum departs through its corridor's fog and the next arrives led
 * by its own ambient — no wipes, no scene cuts (the dossier route is
 * the page's single Cut).
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
    case "logs":
      return <MissionLogs />;
    case "live":
      // Async server component — telemetry fetched at render, ISR 60s.
      // Returns null when every source degrades: the stratum band stays
      // as honest dark void (height comes from the map, never content).
      return <LiveSystems />;
    case "terminal":
      return <TerminalInterface />;
    case "contact":
      return <ContactNode />;
  }
}

export default function Home() {
  return (
    <>
      <DeepVoid />
      <FogVeil />
      <NavRail items={NAV_ITEMS} />
      <main className="relative flex-1">
        {SCROLL_MAP.map((segment, i) => {
          if (segment.kind === "focus") {
            return (
              <StrataPlane
                key={segment.id}
                id={segment.id}
                depth={segment.depth}
                // Pin measurement law: the pinned stratum is top-flowed,
                // never centered. Vertical centering distributes the
                // min-height slack around the content, so the pin
                // trigger's position would change by half the pin
                // spacing every time ScrollTrigger reverts the spacer
                // to measure — start and reality could never agree.
                // Top flow puts all slack below the pin, where it
                // cannot move the trigger.
                className={
                  segment.pin !== undefined
                    ? "py-(--section-padding)"
                    : "flex items-center py-(--section-padding)"
                }
                style={{ minHeight: `${segment.length}vh` }}
              >
                {chamberFor(segment.id)}
              </StrataPlane>
            );
          }
          const next = SCROLL_MAP[i + 1];
          return (
            <CorridorSpacer
              key={segment.id}
              id={segment.id}
              lengthVh={segment.length}
              ahead={
                next?.kind === "focus"
                  ? { depth: next.depth, label: NAV_LABELS[next.id] }
                  : undefined
              }
            />
          );
        })}
      </main>
    </>
  );
}

/**
 * Corridor — depth between strata (strata-spec §11: a corridor with
 * nothing but fog and the G0 grid is correct). Height scales via
 * --corridor-scale, mirroring the scroll map's viewport derivation.
 *
 * Passage marker: one mono readout of what lies ahead — real
 * wayfinding derived from the map, not decoration. It renders without
 * a z-index, so the fixed fog veil (z-fog) paints OVER it: the marker
 * dims through peak fog and resolves as the next chamber approaches —
 * depth signage behaving like it's actually in the corridor, with
 * zero JS. It sits at ~38% of the corridor rather than dead center,
 * so it reads early in the transit and has already cleared the fog
 * peak by mid-descent — signage resolves sooner, the corridor never
 * holds an unmarked stretch (Phase 13.8). aria-hidden: the nav rail
 * already owns this information semantically.
 */
function CorridorSpacer({
  id,
  lengthVh,
  ahead,
}: {
  id: string;
  lengthVh: number;
  ahead?: { depth: number; label: string };
}) {
  return (
    <div
      aria-hidden
      data-corridor={id}
      className="flex items-start justify-center"
      style={{
        height: `calc(${lengthVh}vh * var(--corridor-scale))`,
        paddingTop: `calc(${lengthVh * 0.38}vh * var(--corridor-scale))`,
      }}
    >
      {ahead !== undefined && (
        <MonoLabel
          as="p"
          className="flex items-center gap-(--space-sm) opacity-35"
        >
          <span className="inline-block h-px w-(--space-xl) bg-(--nexus-hairline)" />
          {id} · transit → depth.0{ahead.depth} · {ahead.label}
          <span className="inline-block h-px w-(--space-xl) bg-(--nexus-hairline)" />
        </MonoLabel>
      )}
    </div>
  );
}
