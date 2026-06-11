import Link from "next/link";

import { MonoLabel } from "@/primitives/MonoLabel";

/**
 * 404 — no stratum at this coordinate. In-universe but unmistakably
 * clear (interaction-principles §7: clarity beats fiction — the
 * message states exactly what to do next). Static, no islands.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-(--space-md) px-(--layout-margin) py-(--space-3xl)">
      <MonoLabel as="p">SIGNAL.404</MonoLabel>
      <h1 className="text-(length:--text-h1) leading-(--leading-display) tracking-(--tracking-display) [font-weight:var(--weight-medium)]">
        No record at this address
      </h1>
      <p className="max-w-(--measure-body) text-(color:--nexus-muted)">
        The coordinate resolves to nothing — the page may have been
        archived, moved, or never existed.
      </p>
      <Link
        href="/"
        className="self-start text-(length:--text-mono) text-(color:--nexus-muted) [font-family:var(--font-machine)] [transition:color_var(--motion-instant)_var(--ease-out-facility)] hover:text-(color:--nexus-glow) focus-visible:text-(color:--nexus-glow)"
      >
        &gt; return to facility
      </Link>
    </main>
  );
}
