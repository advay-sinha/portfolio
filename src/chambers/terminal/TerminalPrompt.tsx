import type { KeyboardEvent, Ref } from "react";

import { SESSION_PROMPT } from "@/chambers/terminal/commands";

/**
 * TerminalPrompt — the input row.
 *
 * A real form with a real text input: Enter submits natively,
 * software keyboards get a return key, and the browser owns the caret
 * (its blink is the chamber's caret law, no CSS imitation needed —
 * caret-color borrows the glow token, the one earned accent here).
 * The prompt label is the derived session string (operator@host),
 * matching the echo lines so the scrollback reads as one session.
 * History recall, Ctrl+L and Escape are handled one level up — this
 * component only reports keys.
 *
 * Mono, transparent fill, no border of its own: the surrounding panel
 * is the structure; focus elevation (L2 → L4) comes from the Panel
 * primitive's :focus-within, not from here.
 */

export interface TerminalPromptProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  inputRef: Ref<HTMLInputElement>;
}

export function TerminalPrompt({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  inputRef,
}: TerminalPromptProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex items-baseline gap-(--space-2xs) border-t-(length:--hairline-width) border-(color:--nexus-hairline) pt-(--space-sm)"
    >
      <span
        aria-hidden
        className="whitespace-nowrap text-(length:--text-mono) leading-(--leading-mono) text-(color:--nexus-muted) opacity-50 [font-family:var(--font-machine)]"
      >
        {SESSION_PROMPT}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        aria-label="terminal command input"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="send"
        className="min-w-0 flex-1 bg-transparent text-(length:--text-mono) leading-(--leading-mono) text-(color:--nexus-text) caret-(color:--nexus-glow) [font-family:var(--font-machine)] outline-none placeholder:text-(color:--nexus-muted) placeholder:opacity-40"
        placeholder="help"
      />
    </form>
  );
}
