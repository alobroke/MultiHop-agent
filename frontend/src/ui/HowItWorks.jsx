import React from "react";
import { SectionHead } from "./primitives.jsx";

const STEPS = [
  {
    n: "01",
    title: "Plan",
    body: "The planner gauges how complex your question is. Simple questions stay whole; hard ones split into up to three dependent sub-queries.",
  },
  {
    n: "02",
    title: "Retrieve",
    body: "Each sub-query searches your local PDF corpus first. When local evidence is thin, it falls back to a live web search.",
  },
  {
    n: "03",
    title: "Cite",
    body: "Findings are synthesized into one answer. Every [S] citation is checked against the sources that were actually retrieved.",
  },
];

export default function HowItWorks() {
  return (
    <section className="pb-24">
      <SectionHead index="01" title="How it works" meta="Three stages, fully traced" />

      <div className="mt-10 grid gap-px overflow-hidden rounded-[22px] border border-line bg-line md:grid-cols-3">
        {STEPS.map((step) => (
          <article key={step.n} className="flex min-h-[260px] flex-col justify-between bg-paper p-7 sm:p-8">
            <span className="font-serif text-[5.5rem] italic leading-none text-ink/15">
              {step.n}
            </span>
            <div>
              <h3 className="text-2xl font-medium tracking-[-0.03em]">{step.title}</h3>
              <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink-2">{step.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
