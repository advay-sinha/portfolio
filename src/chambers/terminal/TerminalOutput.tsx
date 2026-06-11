import { TerminalLine } from "@/chambers/terminal/TerminalLine";

import type { TerminalLineSpec } from "@/chambers/terminal/commands";

/**
 * TerminalOutput — the session log.
 *
 * role="log" + aria-live="polite": appended lines announce to screen
 * readers without interrupting; the log is append-only by contract
 * (the interface holds it immutably — `clear` replaces, never mutates).
 *
 * data-lenis-prevent is the §4.5 scroll exception with zero JS: while
 * the pointer is over the history, native overflow scroll moves the
 * log, not the camera. Esc / clicking outside returns the dolly by
 * doing nothing at all.
 */

export interface TerminalOutputProps {
  lines: readonly TerminalLineSpec[];
  /** Set by the interface to keep the latest line in view. */
  scrollRef?: React.Ref<HTMLDivElement>;
}

export function TerminalOutput({ lines, scrollRef }: TerminalOutputProps) {
  return (
    <div
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-label="terminal session log"
      data-lenis-prevent
      className="flex max-h-[40vh] min-h-32 flex-col gap-(--space-3xs) overflow-y-auto"
    >
      {lines.map((line, i) => (
        <TerminalLine key={i} line={line} />
      ))}
    </div>
  );
}
