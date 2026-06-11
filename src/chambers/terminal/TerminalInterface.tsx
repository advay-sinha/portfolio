"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { execute, type TerminalLineSpec } from "@/chambers/terminal/commands";
import { TerminalOutput } from "@/chambers/terminal/TerminalOutput";
import { TerminalPrompt } from "@/chambers/terminal/TerminalPrompt";
import { Reveal, RevealGroup } from "@/motion/RevealGroup";
import { MonoLabel } from "@/primitives/MonoLabel";
import { Panel } from "@/primitives/Panel";
import { StatusDot } from "@/primitives/StatusDot";

/**
 * TerminalInterface — DEPTH.05, bare metal (homepage-experience §4.5).
 * The facility removes its last filter: one panel, a caret, silence.
 *
 * The chamber's only interaction island, and the page's largest
 * allowed component (implementation-architecture §3). No animation
 * libraries in here — the reveal wrappers come from the shared
 * vocabulary, everything else is CSS + minimal React state. Command
 * execution is synchronous and deterministic (commands.ts): no fake
 * async, no spinners, no simulated work.
 *
 * State (all local, §8): the immutable output log (append/replace,
 * never mutate — capped so a long session can't grow unbounded),
 * command history with arrow-recall, the controlled input value.
 * Nothing here is per-frame; React renders only on keystroke/submit.
 *
 * Keyboard contract: Enter executes (native form submit), ArrowUp /
 * ArrowDown walk history (draft preserved), Ctrl+L clears, Escape
 * blurs — returning scroll to the camera. The history pane carries
 * data-lenis-prevent, so hovering it scrolls the log natively (the
 * §4.5 scroll exception with zero JS).
 *
 * Visual law: L2 structure at rest, L4 only through :focus-within
 * (the Panel primitive owns that). Low contrast by default, glow
 * earned by focus — a maintenance access layer, not a cyberpunk prop.
 *
 * SSR/degradation: the greeting lines are the deterministic initial
 * state, so the server HTML is a complete, readable chamber.
 * JS-disabled, the panel reads as a quiet access point ("> type
 * 'help'") — the information elsewhere never depended on it.
 */

const GREETING: readonly TerminalLineSpec[] = [
  { kind: "output", text: "maintenance access layer · direct interface" },
  { kind: "muted", text: "> type 'help' for the command index" },
];

/** Log ceiling — a long session stays bounded, oldest lines drop. */
const MAX_LINES = 200;

export function TerminalInterface() {
  const [lines, setLines] = useState<readonly TerminalLineSpec[]>(GREETING);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<readonly string[]>([]);
  // null = not walking history; otherwise index into history.
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const draftRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Keep the newest line in view — event-driven, never per-frame.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines]);

  const submit = (raw: string) => {
    const input = raw.trim();
    setValue("");
    setHistoryIndex(null);
    draftRef.current = "";
    if (input === "") return;

    setHistory((prev) =>
      prev[prev.length - 1] === input ? prev : [...prev, input]
    );

    const result = execute(input);
    setLines((prev) => {
      if (result.clear === true) return [];
      const echo: TerminalLineSpec = { kind: "echo", text: `> ${input}` };
      return [...prev, echo, ...result.lines].slice(-MAX_LINES);
    });
  };

  const run = () => submit(value);

  const clearLog = () => {
    setLines([]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      const next =
        historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      if (historyIndex === null) draftRef.current = value;
      setHistoryIndex(next);
      setValue(history[next]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setValue(draftRef.current);
      } else {
        setHistoryIndex(next);
        setValue(history[next]);
      }
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      clearLog();
    } else if (event.key === "Escape") {
      event.currentTarget.blur();
    }
  };

  // Clicking the panel engages the prompt — explicit focus, never a
  // captured passing scroll. Text selection is left alone.
  const onPanelClick = (event: MouseEvent<HTMLElement>) => {
    if (window.getSelection()?.toString()) return;
    if ((event.target as HTMLElement).closest("a")) return;
    inputRef.current?.focus();
  };

  return (
    <section aria-labelledby="terminal-title" className="relative w-full">
      {/* No ambient. The terminal is found, not lit (strata-spec §6). */}
      <RevealGroup className="relative mx-auto flex w-full max-w-3xl flex-col gap-(--space-md) px-(--layout-margin)">
        <Reveal kind="mono" step={0}>
          <MonoLabel as="p">DEPTH.05 · TERMINAL</MonoLabel>
        </Reveal>
        <h2 id="terminal-title" className="sr-only">
          Terminal Interface
        </h2>

        <Reveal kind="panel" step={1}>
          <Panel
            as="div"
            label="TERMINAL"
            meta="maintenance access"
            status={
              <>
                <StatusDot tone="ok" />
                open
              </>
            }
            onClick={onPanelClick}
            className="cursor-text"
          >
            <div className="flex flex-col gap-(--space-sm)">
              <TerminalOutput lines={lines} scrollRef={logRef} />

              {/* Quick commands — the touch law (interaction-principles
                  §4): typing stays optional. Real buttons, ≥44px targets,
                  rendered for every input mode. */}
              <div className="flex flex-wrap gap-(--space-2xs)">
                {(["help", "systems", "logs", "contact"] as const).map(
                  (cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        submit(cmd);
                      }}
                      className="min-h-11 rounded-(--radius-control) border border-(color:--nexus-hairline) px-(--space-sm) text-(length:--text-label) tracking-(--tracking-label) text-(color:--nexus-muted) uppercase [font-family:var(--font-machine)] [font-weight:var(--weight-medium)] [transition:var(--transition-panel-elevate)] hover:border-(color:--nexus-glow-dim) hover:text-(color:--nexus-text)"
                    >
                      {cmd}
                    </button>
                  )
                )}
              </div>

              <TerminalPrompt
                value={value}
                onChange={(next) => {
                  setValue(next);
                  setHistoryIndex(null);
                }}
                onSubmit={run}
                onKeyDown={onKeyDown}
                inputRef={inputRef}
              />
            </div>
          </Panel>
        </Reveal>

        <Reveal kind="mono" step={2}>
          <MonoLabel as="p" className="normal-case opacity-60">
            &gt; enter executes · arrow-up recalls · esc releases
          </MonoLabel>
        </Reveal>
      </RevealGroup>
    </section>
  );
}
