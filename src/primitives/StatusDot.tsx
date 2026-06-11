import { cn } from "@/lib/utils";

/**
 * StatusDot — the smallest sign the facility is alive
 * (design-system §7). 6px, semantic color only, 2s pulse owned by CSS;
 * frozen (holds its color, stops pulsing) under reduced motion via
 * --ambient-play-state. Never decorative: a dot exists only beside a
 * status word it substantiates.
 */

const TONE_CLASS = {
  /** OPERATIONAL */
  ok: "bg-(--nexus-status-ok)",
  /** STANDBY / degraded */
  warn: "bg-(--nexus-status-warn)",
} as const;

export interface StatusDotProps {
  tone?: keyof typeof TONE_CLASS;
  className?: string;
}

export function StatusDot({ tone = "ok", className }: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-(--radius-full)",
        TONE_CLASS[tone],
        "animate-[nexus-pulse_var(--motion-pulse)_var(--ease-linear)_infinite]",
        "[animation-play-state:var(--ambient-play-state)]",
        className
      )}
    />
  );
}
