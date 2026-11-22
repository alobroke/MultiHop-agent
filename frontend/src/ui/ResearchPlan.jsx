import React from "react";
import { ChevronDown } from "lucide-react";
import RichText from "../lib/RichText.jsx";
import { Eyebrow, StatusTag } from "./primitives.jsx";

export default function ResearchPlan({ plan, steps, busy }) {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <Eyebrow>Research plan</Eyebrow>
        {plan.length > 0 && (
          <span className="font-mono text-xs text-ink-2">
            {plan.length} {plan.length === 1 ? "sub-query" : "sub-queries"}
          </span>
        )}
      </div>

      {plan.length === 0 && (
        <div className="grid min-h-[220px] place-items-center rounded-[22px] border border-dashed border-line px-6 text-center">
          <p className="max-w-xs text-[15px] text-ink-3">
            {busy
              ? "The planner is weighing your question and deciding how to break it down…"
              : "No plan was produced for this run."}
          </p>
        </div>
      )}

      <ol className="space-y-3">
        {plan.map((task, index) => {
          const state = steps.find((s) => s.hop_id === task.id);
          const status = state?.status || "pending";
          const active = status === "running";

          return (
            <li
              key={task.id}
              className={`rounded-[22px] border bg-paper-2 p-5 transition-colors duration-300 motion-safe:animate-rise sm:p-6 ${
                active ? "border-signal/50" : "border-line"
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs font-medium text-signal-deep">{task.id}</span>
                <StatusTag status={status} />
              </div>

              <p className="mt-3 text-[clamp(1.05rem,1.6vw,1.25rem)] leading-snug tracking-[-0.015em]">
                {task.question}
              </p>

              {(task.depends_on?.length > 0 || state?.source_count != null) && (
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-ink-2">
                  {task.depends_on?.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className="uppercase tracking-[0.12em] text-ink-3">Depends on</span>
                      {task.depends_on.map((id) => (
                        <span key={id} className="rounded-full border border-line px-2 py-0.5 text-ink">
                          {id}
                        </span>
                      ))}
                    </span>
                  )}
                  {state?.source_count != null && (
                    <span>
                      <span className="text-ink">{state.source_count}</span> sources used
                    </span>
                  )}
                </div>
              )}

              {state?.finding && (
                <details className="group mt-4 border-t border-line pt-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-medium text-ink-2 hover:text-ink">
                    View finding
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-3 text-[15px] leading-relaxed text-ink-2">
                    <RichText text={state.finding} />
                  </div>
                </details>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
