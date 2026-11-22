import React, { useState } from "react";
import { ArrowUpRight, FileText, Globe, ShieldCheck, TriangleAlert } from "lucide-react";
import RichText from "../lib/RichText.jsx";
import { hostname } from "../lib/workflow.js";
import { Eyebrow, SectionHead, formatSeconds } from "./primitives.jsx";

const VERIFICATION = {
  citations_valid: {
    label: "Citations valid",
    box: "border-moss/30 bg-moss-soft text-moss",
  },
  uncited: {
    label: "No citations",
    box: "border-ochre/30 bg-ochre-soft text-ochre",
  },
  invalid: {
    label: "Unknown citations",
    box: "border-signal/30 bg-signal-soft text-signal-deep",
  },
};

function Stat({ label, value }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-3 last:border-b-0">
      <span className="text-[13px] text-ink-2">{label}</span>
      <span className="font-mono text-sm text-ink">{value}</span>
    </div>
  );
}

function SourceCard({ source, highlighted }) {
  const isDoc = source.type === "document";

  return (
    <article
      id={`source-${source.id}`}
      className={`flex scroll-mt-28 flex-col rounded-[22px] border bg-paper-2 p-5 transition-all duration-500 sm:p-6 ${
        highlighted ? "border-signal shadow-[0_0_0_4px_var(--color-signal-soft)]" : "border-line"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-serif text-4xl italic leading-none text-signal">S{source.id}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-2">
          {isDoc ? <FileText className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
          {isDoc ? `PDF · p.${source.page}` : "Web"}
        </span>
      </div>

      <h4 className="mt-5 line-clamp-2 text-[15px] font-medium leading-snug tracking-[-0.01em]">
        {source.title}
      </h4>

      <p className="mt-2 line-clamp-4 flex-1 text-[13.5px] leading-relaxed text-ink-2">
        {source.content}
      </p>

      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 self-start border-b border-ink/20 pb-0.5 font-mono text-[11.5px] text-ink transition-colors hover:border-signal hover:text-signal-deep"
        >
          {hostname(source.url)}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      )}
    </article>
  );
}

export default function Answer({ result, elapsed, planSize }) {
  const [highlight, setHighlight] = useState(null);

  if (!result) return null;

  const sources = result.sources || [];
  const verification = result.verification || {};
  const v = VERIFICATION[verification.status] || {
    label: verification.status || "Unknown",
    box: "border-line bg-paper-2 text-ink-2",
  };
  const docCount = sources.filter((s) => s.type === "document").length;

  function onCite(n) {
    const el = document.getElementById(`source-${n}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlight(n);
    window.setTimeout(() => setHighlight((h) => (h === n ? null : h)), 2200);
  }

  return (
    <section className="pb-24 motion-safe:animate-rise">
      <SectionHead id="answer" index="03" title="Answer" meta={result.run_id ? `run ${String(result.run_id).slice(0, 8)}` : null} />

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">
          <Eyebrow className="mb-5">Question</Eyebrow>
          <p className="mb-10 border-l-2 border-signal pl-4 font-serif text-[clamp(1.4rem,2.4vw,1.9rem)] italic leading-snug text-ink">
            {result.query}
          </p>

          <div className="text-[clamp(1.02rem,1.3vw,1.15rem)] leading-[1.75] text-ink/90">
            <RichText text={result.answer} onCite={onCite} />
          </div>
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <div className="lg:sticky lg:top-24 lg:space-y-6">
            <div className={`rounded-[22px] border p-5 ${v.box}`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4" />
                {v.label}
              </div>
              {verification.message && (
                <p className="mt-2 text-[13px] leading-relaxed opacity-90">{verification.message}</p>
              )}
            </div>

            <div className="mt-6 rounded-[22px] border border-line bg-paper-2 px-5 py-2 lg:mt-0">
              <Stat label="Sub-queries" value={planSize || "—"} />
              <Stat label="Sources" value={sources.length} />
              <Stat label="PDF passages" value={docCount} />
              <Stat label="Web results" value={sources.length - docCount} />
              <Stat label="Citations used" value={verification.cited_count ?? "—"} />
              <Stat label="Duration" value={formatSeconds(elapsed)} />
            </div>

            {result.warnings?.length > 0 && (
              <div className="mt-6 rounded-[22px] border border-ochre/30 bg-ochre-soft p-5 text-ochre lg:mt-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TriangleAlert className="h-4 w-4" />
                  Retrieval warnings
                </div>
                <ul className="mt-2 space-y-1.5 text-[13px] leading-relaxed">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      {sources.length > 0 && (
        <div className="mt-20">
          <SectionHead index="04" title="Evidence" meta={`${sources.length} sources`} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sources.map((source) => (
              <SourceCard key={source.id} source={source} highlighted={highlight === source.id} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
