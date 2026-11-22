import React from "react";
import { Check, LoaderCircle, Minus, TriangleAlert } from "lucide-react";
import { WORKFLOW } from "../lib/workflow.js";
import { StatusTag, formatSeconds } from "./primitives.jsx";

function StageGlyph({ status, Icon }) {
  const base = "relative grid h-11 w-11 place-items-center rounded-full transition-colors duration-300";

  if (status === "running") {
    return (
      <span className={`${base} bg-signal text-paper-2`}>
        <span className="absolute inset-0 rounded-full bg-signal motion-safe:animate-ping-slow" />
        <LoaderCircle className="relative h-5 w-5 animate-spin" />
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className={`${base} bg-ink text-paper-2`}>
        <Check className="h-5 w-5" strokeWidth={2.5} />
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span className={`${base} border border-dashed border-ink-3 text-ink-3`}>
        <Minus className="h-5 w-5" />
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className={`${base} bg-ochre-soft text-ochre`}>
        <TriangleAlert className="h-5 w-5" />
      </span>
    );
  }
  return (
    <span className={`${base} border border-line text-ink-3`}>
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </span>
  );
}

export default function Pipeline({ events, elapsed, busy }) {
  const latest = {};
  for (const entry of events) latest[entry.node] = entry;

  const done = WORKFLOW.filter((stage) =>
    ["completed", "skipped"].includes(latest[stage.id]?.status)
  ).length;
  const progress = Math.round((done / WORKFLOW.length) * 100);

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between font-mono text-xs text-ink-2">
        <span>
          {done}/{WORKFLOW.length} stages
        </span>
        <span className="flex items-center gap-4">
          <span className={busy ? "text-signal-deep" : ""}>{formatSeconds(elapsed)}</span>
          <span className="text-ink">{progress}%</span>
        </span>
      </div>

      <div
        className="h-[3px] w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Workflow progress"
      >
        <div
          className="h-full rounded-full bg-signal transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] border border-line bg-line sm:grid-cols-3 xl:grid-cols-6">
        {WORKFLOW.map((stage, index) => {
          const status = latest[stage.id]?.status || "pending";
          const active = status === "running";

          return (
            <li
              key={stage.id}
              className={`flex min-h-[188px] flex-col justify-between p-5 transition-colors duration-300 ${
                active ? "bg-paper-2" : "bg-paper"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs text-ink-3">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <StatusTag status={status} />
              </div>

              <div>
                <StageGlyph status={status} Icon={stage.Icon} />
                <h3 className="mt-4 text-[15px] font-medium tracking-[-0.01em]">{stage.label}</h3>
                <p className="mt-0.5 text-[13px] text-ink-3">{stage.subtitle}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
