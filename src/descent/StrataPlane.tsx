"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { useDescent } from "@/descent/DescentProvider";
import type { StratumId } from "@/descent/scroll-map";
import { cn } from "@/lib/utils";

export type { StratumPhase } from "@/descent/depth-math";

/**
 * StrataPlane — G3, the structural wrapper every chamber lives inside
 * (strata-spec §4, §10; implementation-architecture §2–4).
 *
 * One element. It owns plane identity (id, depth coordinate) and its
 * registration with the depth system — nothing else: no chamber
 * knowledge, no animation logic, no phase math. It renders children it
 * never inspects.
 *
 * Client boundary reasoning: the component is "use client" solely for
 * the registration effect (a ref handed to DescentProvider). Children
 * arrive through the `children` prop, so chamber content stays
 * server-rendered — the client cost is the wrapper, not the contents.
 * Without a provider (isolation gate / static tier), registration is a
 * no-op and the plane is exactly its server-rendered self.
 *
 * Semantics: deliberately a `div`, not a `section` — the plane is
 * camera mechanics. The chamber inside owns the semantic landmark
 * (`<section aria-labelledby>`) per implementation-architecture §3, so
 * each stratum produces exactly one landmark.
 *
 * SSR contract: data-phase="focus" — the server document IS the static
 * tier (every plane settled, sharp, interactive). The engine drives
 * data-phase / transform / opacity / filter / inert imperatively after
 * hydration and restores this exact state on teardown.
 *
 * Fragile-coupling firewall (implementation-architecture §4.3): the
 * engine writes ONLY to this element; content animation (future Framer
 * reveals) writes only to nodes inside it. One element-property pair,
 * one owner — enforced by DOM shape.
 *
 * Future: proxies mount as siblings at G1 (never inside the plane);
 * phase-boundary callbacks for chamber islands arrive via context, not
 * via new props here.
 */

export interface StrataPlaneProps {
  /** Stratum identity: anchor target and registration key (strata-spec §2). */
  id: StratumId;
  /** Depth coordinate 0–6. Data for inspection/markers, never styling. */
  depth: number;
  /** Chamber content. The plane renders it without inspecting it. */
  children: ReactNode;
  /** Layout-only classes from the page (sizing, rhythm). Never transforms or filters. */
  className?: string;
  /** Layout-only inline style — the page sets min-height from the scroll map. */
  style?: CSSProperties;
}

export function StrataPlane({
  id,
  depth,
  children,
  className,
  style,
}: StrataPlaneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { registerPlane } = useDescent();

  useEffect(() => {
    if (ref.current === null) return;
    return registerPlane(id, ref.current);
  }, [id, registerPlane]);

  return (
    <div
      ref={ref}
      id={id}
      data-stratum={id}
      data-depth={depth}
      data-phase="focus"
      className={cn("relative z-(--z-plane)", className)}
      style={style}
    >
      {children}
    </div>
  );
}
