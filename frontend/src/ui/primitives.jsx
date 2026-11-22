import React from "react";
import { Check, LoaderCircle, Minus, TriangleAlert } from "lucide-react";

export function Eyebrow({ children, className = "" }) {
  return (
    <div
      className={`font-mono text-[11px] uppercase tracking-[0.16em] text-ink-3 ${className}`}
    >
      {children}
    </div>
  );
}

/** Numbered editorial section header with a heavy top rule. */
export function SectionHead({ index, title, meta, id }) {
  return (
    <div id={id} className="scroll-mt-24 border-t-2 border-ink pt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-4 sm:gap-6">
          <span className="font-mono text-xs text-signal">({index})</span>
          <h2 className="text-[clamp(1.75rem,3.6vw,2.75rem)] font-medium leading-none tracking-[-0.035em]">
            {title}
          </h2>
        </div>
        {meta && <div className="font-mono text-xs text-ink-2">{meta}</div>}
      </div>
    </div>
  );
}

export function LiveDot({ tone = "signal", pulse = false }) {
  const color = {
    signal: "bg-signal",
    moss: "bg-moss",
    ochre: "bg-ochre",
    muted: "bg-ink-3",
  }[tone];

  return (
    <span className="relative inline-flex h-2 w-2">
      {pulse && (
        <span
          className={`absolute inset-0 rounded-full ${color} motion-safe:animate-ping-slow`}
        />
      )}
      <span className={`relative h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

const STATUS_STYLES = {
  pending: "border-line text-ink-3",
  running: "border-signal/40 bg-signal-soft text-signal-deep",
  completed: "border-ink bg-ink text-paper-2",
  skipped: "border-dashed border-ink-3 text-ink-3",
  failed: "border-ochre/40 bg-ochre-soft text-ochre",
};

export function StatusTag({ status }) {
  const label = {
    pending: "Pending",
    running: "Running",
    completed: "Done",
    skipped: "Skipped",
    failed: "Failed",
  }[status] || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] font-mono text-[10px] uppercase tracking-[0.12em] ${
        STATUS_STYLES[status] || STATUS_STYLES.pending
      }`}
    >
      {status === "running" && <LoaderCircle className="h-3 w-3 animate-spin" />}
      {status === "completed" && <Check className="h-3 w-3" strokeWidth={2.5} />}
      {status === "skipped" && <Minus className="h-3 w-3" />}
      {status === "failed" && <TriangleAlert className="h-3 w-3" />}
      {label}
    </span>
  );
}

export function formatSeconds(seconds) {
  if (seconds == null) return "—";
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
