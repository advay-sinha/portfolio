import { Panel } from "@/primitives/Panel";

/**
 * Temporary primitive staging view. Replaced by the chamber sequence
 * (boot → core → vault → logs → live → terminal → contact) as
 * chambers land. Content here documents the primitive itself —
 * nothing simulated, no placeholder telemetry.
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-(--layout-max) flex-1 flex-col gap-(--space-lg) px-(--layout-margin) py-(--section-padding)">
      <Panel id="panel-structure" label="SYS.PANEL / L2" meta="primitive · staging" interactive>
        <p className="max-w-(--measure-body)">
          Resting structure. Hairline border, panel surface. Hover ignites
          the border and raises the surface — light responds to presence.
        </p>
      </Panel>

      <Panel
        id="panel-focus"
        label="SYS.PANEL / L4"
        meta="forced focus"
        elevation="focus"
      >
        <p className="max-w-(--measure-body)">
          L4 treatment: raised surface, glow border, 24px glow shadow.
          Reached via focus-within or forced by scrub choreography.
        </p>
      </Panel>

      <Panel
        id="panel-dormant"
        label="SYS.PANEL / ARCHIVED"
        meta="dormant"
        state="dormant"
        interactive
      >
        <p className="max-w-(--measure-body)">
          Dormant panel at half presence. Hover restores it — the archive
          accepts attention but never demands it.
        </p>
      </Panel>
    </main>
  );
}
