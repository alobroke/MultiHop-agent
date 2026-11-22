import React, { useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import { stageTitle } from "../lib/workflow.js";

const DOT = {
  running: "bg-signal",
  completed: "bg-paper",
  skipped: "bg-paper/30",
  failed: "bg-[#e0a53a]",
};

export default function EventLog({ events, busy }) {
  const scroller = useRef(null);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events.length, busy]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[22px] bg-night text-paper">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/55">
          Event log
        </span>
        <span className="font-mono text-[11px] text-paper/55">{events.length} events</span>
      </div>

      <div
        ref={scroller}
        className="max-h-[540px] min-h-[260px] flex-1 overflow-y-auto px-5 py-4 [scrollbar-color:rgba(243,240,232,0.2)_transparent] [scrollbar-width:thin]"
        aria-live="polite"
      >
        {events.length === 0 && !busy && (
          <p className="font-mono text-xs text-paper/40">No events yet.</p>
        )}

        <ol className="space-y-0">
          {events.map((entry, index) => (
            <li
              key={entry.eventId ?? index}
              className="relative grid grid-cols-[auto_1fr] gap-x-3 pb-4 motion-safe:animate-rise"
            >
              <span className="relative flex flex-col items-center">
                <span className={`mt-[7px] h-[7px] w-[7px] rounded-full ${DOT[entry.status] || "bg-paper/40"}`} />
                {index < events.length - 1 && <span className="mt-1 w-px flex-1 bg-white/10" />}
              </span>

              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[13px] font-medium">
                    {entry.hop_id && <span className="font-mono text-signal">{entry.hop_id} · </span>}
                    {stageTitle(entry.node)}
                  </span>
                  <span className="shrink-0 font-mono text-[10.5px] text-paper/40">{entry.time}</span>
                </div>

                <p className="mt-0.5 text-[13px] leading-snug text-paper/60">
                  {entry.message || entry.status}
                </p>

                {entry.status === "completed" && (entry.node === "documents" || entry.node === "web") && (
                  <span className="mt-1.5 inline-block rounded-full bg-white/[0.07] px-2 py-0.5 font-mono text-[10.5px] text-paper/70">
                    {entry.source_count || 0} {entry.node === "documents" ? "PDF passages" : "web results"}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>

        {busy && (
          <div className="flex items-center gap-2 font-mono text-xs text-paper/50">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-signal" />
            Agent is working
            <span className="motion-safe:animate-pulse">_</span>
          </div>
        )}
      </div>
    </div>
  );
}
