import React from "react";
import Logo from "./Logo.jsx";
import { LiveDot } from "./primitives.jsx";

export default function Header({ busy, status, error, health }) {
  let tone = "muted";
  let label = "Connecting";

  if (busy) {
    tone = "signal";
    label = status;
  } else if (error) {
    tone = "ochre";
    label = "Last run failed";
  } else if (health.state === "online") {
    tone = "moss";
    label = "Engine online";
  } else if (health.state === "offline") {
    tone = "ochre";
    label = "Engine offline";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-3 lg:flex">
          <span>Plan</span>
          <span className="h-px w-6 bg-line" />
          <span>Retrieve</span>
          <span className="h-px w-6 bg-line" />
          <span>Synthesize</span>
          <span className="h-px w-6 bg-line" />
          <span>Cite</span>
        </nav>

        <div className="flex min-w-0 items-center gap-3">
          {health.model && (
            <span className="hidden truncate font-mono text-[11px] text-ink-3 xl:inline">
              {health.model}
            </span>
          )}
          <span
            className="flex min-w-0 items-center gap-2 rounded-full border border-line bg-paper-2 px-3 py-1.5 text-[13px] font-medium"
            role="status"
            aria-live="polite"
          >
            <LiveDot tone={tone} pulse={busy} />
            <span className="truncate">{label}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
