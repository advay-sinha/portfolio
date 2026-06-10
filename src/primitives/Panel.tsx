import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { MonoLabel } from "@/primitives/MonoLabel";

/**
 * Panel — the L2 structural primitive of the facility.
 *
 * Anatomy (design-system §5): mono label row on top, content below.
 * Light is semantic: hover ignition exists only when `interactive`;
 * L4 treatment (raised surface, glow border, 24px glow) is reached
 * only through :focus-within or the forced `elevation="focus"` used
 * by scrub-driven choreography (Vault track). Server component —
 * every state response is CSS; no element here is ever written to
 * by GSAP or Framer (ownership law, implementation-architecture §7).
 */

const panelVariants = cva(
  [
    "relative border border-(color:--nexus-hairline) bg-(--nexus-panel)",
    "rounded-(--radius-panel)",
    "[transition:var(--transition-panel-elevate)]",
    "focus-within:z-(--z-focus) focus-within:bg-(--nexus-panel-raised)",
    "focus-within:border-(color:--nexus-glow-dim)",
    "focus-within:[box-shadow:var(--glow-focus)]",
  ],
  {
    variants: {
      elevation: {
        /* L2 — resting structure */
        structure: "z-(--z-structure)",
        /* L4 forced — only for externally driven focus (Vault scrub,
           active terminal). Never the default; light must be earned. */
        focus: [
          "z-(--z-focus) bg-(--nexus-panel-raised)",
          "border-(color:--nexus-glow-dim) [box-shadow:var(--glow-focus)]",
        ],
      },
      state: {
        operational: "",
        /* Archive shelf / operational scars: visually subordinate,
           still legible. Hover restores presence when interactive. */
        dormant: [
          "opacity-50",
          "[transition:var(--transition-panel-elevate),var(--transition-opacity-resolve)]",
        ],
      },
      interactive: {
        /* Hover ignition: raised + glow border, no shadow — the 24px
           glow belongs to L4 alone. No scale, no lift, no tilt. */
        true: "hover:bg-(--nexus-panel-raised) hover:border-(color:--nexus-glow-dim)",
        false: "",
      },
      inset: {
        standard: "p-(--space-md)",
        compact: "p-(--space-sm)",
      },
    },
    compoundVariants: [
      { state: "dormant", interactive: true, class: "hover:opacity-100" },
    ],
    defaultVariants: {
      elevation: "structure",
      state: "operational",
      interactive: false,
      inset: "standard",
    },
  }
);

type PanelElement = "section" | "article" | "aside" | "div";

export interface PanelProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof panelVariants> {
  /** Mono designation, e.g. "SYS.VAULT / 02". Doubles as the accessible name. */
  label: string;
  /** Right-aligned status slot — StatusDot + state text. */
  status?: ReactNode;
  /** Muted metadata beside the label — timestamps, counts, coordinates. */
  meta?: ReactNode;
  /** Semantic element. Labelled sections become navigable landmarks. */
  as?: PanelElement;
}

export function Panel({
  as: Tag = "section",
  label,
  status,
  meta,
  elevation,
  state,
  interactive,
  inset,
  className,
  children,
  id,
  ...rest
}: PanelProps) {
  const labelId = id != null ? `${id}-label` : undefined;

  return (
    <Tag
      id={id}
      aria-labelledby={labelId}
      aria-label={labelId === undefined ? label : undefined}
      className={cn(
        panelVariants({ elevation, state, interactive, inset }),
        className
      )}
      {...rest}
    >
      <header className="mb-(--space-sm) flex flex-wrap items-baseline gap-x-(--space-sm) gap-y-(--space-3xs)">
        <MonoLabel id={labelId}>{label}</MonoLabel>
        {meta != null ? <MonoLabel>{meta}</MonoLabel> : null}
        {status != null ? (
          <MonoLabel className="ml-auto inline-flex items-center gap-(--space-2xs)">
            {status}
          </MonoLabel>
        ) : null}
      </header>
      {children}
    </Tag>
  );
}

export { panelVariants };
