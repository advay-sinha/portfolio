import { cn } from "@/lib/utils";

import { SESSION_PROMPT, type TerminalLineSpec } from "@/chambers/terminal/commands";

/**
 * TerminalLine — one immutable line of session output.
 *
 * Pure presentation, mono throughout. Hierarchy is brightness, never
 * color (the terminal has no neon): muted recedes, output holds the
 * muted register, errors take full text color — urgency by
 * typography, the same law as the Mission Logs. Links are real
 * anchors with the facility's standard hover ignition; navigation is
 * native, never a routing trick.
 *
 * Echo lines render as a real shell record — dim session prompt,
 * brighter command — and open a margin above themselves, so the
 * scrollback reads as command/result groups instead of one undivided
 * stream (Phase 13.8 TUI calibration).
 */

const KIND_CLASS: Record<TerminalLineSpec["kind"], string> = {
  echo: "",
  output: "text-(color:--nexus-muted)",
  muted: "text-(color:--nexus-muted) opacity-60",
  error: "text-(color:--nexus-text)",
  link: "",
};

export function TerminalLine({ line }: { line: TerminalLineSpec }) {
  const base =
    "text-(length:--text-mono) leading-(--leading-mono) tabular-nums [font-family:var(--font-machine)] whitespace-pre-wrap break-words";

  if (line.kind === "echo") {
    return (
      <div className={cn(base, "mt-(--space-xs) first:mt-0")}>
        <span className="text-(color:--nexus-muted) opacity-50">
          {SESSION_PROMPT}{" "}
        </span>
        <span className="text-(color:--nexus-text) opacity-85">
          {line.text}
        </span>
      </div>
    );
  }

  if (line.kind === "link" && line.href !== undefined) {
    return (
      <div className={base}>
        <a
          href={line.href}
          {...(line.href.startsWith("http") || line.href.endsWith(".pdf")
            ? { rel: "noreferrer", target: "_blank" }
            : {})}
          className={cn(
            "text-(color:--nexus-muted)",
            "[transition:color_var(--motion-instant)_var(--ease-out-facility)]",
            "hover:text-(color:--nexus-glow) focus-visible:text-(color:--nexus-glow)"
          )}
        >
          {line.text}
        </a>
      </div>
    );
  }

  return <div className={cn(base, KIND_CLASS[line.kind])}>{line.text}</div>;
}
