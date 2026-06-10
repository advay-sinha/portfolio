import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * MonoLabel — the facility speaking (design-system §3).
 * Uppercase JetBrains Mono at label scale. The only place uppercase
 * is permitted; numerals are tabular so readouts never shift.
 */

type MonoLabelElement = "span" | "p" | "dt" | "dd" | "figcaption";

export interface MonoLabelProps extends HTMLAttributes<HTMLElement> {
  as?: MonoLabelElement;
}

export function MonoLabel({
  as: Tag = "span",
  className,
  ...props
}: MonoLabelProps) {
  return (
    <Tag
      className={cn(
        "[font-family:var(--font-machine)] [font-weight:var(--weight-medium)]",
        "text-(length:--text-label) tracking-(--tracking-label) leading-(--leading-mono)",
        "uppercase tabular-nums text-(color:--nexus-muted)",
        className
      )}
      {...props}
    />
  );
}
