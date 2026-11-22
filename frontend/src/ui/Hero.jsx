import React, { useRef } from "react";
import { ArrowRight, LoaderCircle, Square } from "lucide-react";
import { Eyebrow } from "./primitives.jsx";

const EXAMPLES = [
  "How does ReAct differ from Retrieval-Augmented Generation?",
  "What are the limits of chain-of-thought prompting, and how does ReAct address them?",
  "Compare self-consistency and tree-of-thoughts for multi-step reasoning.",
];

export default function Hero({ query, setQuery, busy, onSubmit, onStop }) {
  const inputRef = useRef(null);
  const canSubmit = !busy && query.trim().length > 0;

  function handleKeyDown(event) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (canSubmit) onSubmit();
    }
  }

  function pickExample(text) {
    setQuery(text);
    inputRef.current?.focus();
  }

  return (
    <section className="pt-12 pb-16 sm:pt-20 sm:pb-24">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8 motion-safe:animate-rise">
          <Eyebrow className="mb-6 flex items-center gap-3">
            <span className="text-signal">●</span> Research Studio — Multi-hop agent
          </Eyebrow>

          <h1 className="text-[clamp(2.9rem,8.2vw,7.25rem)] font-medium leading-[0.92] tracking-[-0.055em]">
            Answers that take
            <br />
            <span className="font-serif font-normal italic tracking-[-0.03em]">more than</span>{" "}
            one hop<span className="text-signal">.</span>
          </h1>
        </div>

        <div
          className="flex flex-col justify-end gap-6 lg:col-span-4 motion-safe:animate-rise"
          style={{ animationDelay: "120ms" }}
        >
          <p className="max-w-md text-[17px] leading-relaxed text-ink-2">
            MultiHop<span className="font-serif italic text-signal">x</span> breaks hard
            questions into dependent sub-questions, gathers evidence from your PDFs and the
            open web, and cites every claim it makes.
          </p>

          <ol className="grid grid-cols-3 border-t border-line pt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">
            <li>
              <span className="block text-ink-3">01</span>Plan
            </li>
            <li>
              <span className="block text-ink-3">02</span>Retrieve
            </li>
            <li>
              <span className="block text-ink-3">03</span>Cite
            </li>
          </ol>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit();
        }}
        className="group mt-12 rounded-[22px] border border-ink/15 bg-paper-2 shadow-[0_1px_0_rgba(21,20,15,0.04),0_24px_48px_-32px_rgba(21,20,15,0.35)] transition-colors focus-within:border-ink motion-safe:animate-rise sm:mt-16"
        style={{ animationDelay: "220ms" }}
      >
        <label htmlFor="query" className="sr-only">
          Research question
        </label>
        <textarea
          id="query"
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a research question…"
          rows={3}
          disabled={busy}
          className="block w-full resize-none bg-transparent px-5 pt-5 text-[clamp(1.15rem,2vw,1.5rem)] leading-snug tracking-[-0.015em] text-ink outline-none placeholder:text-ink-3 disabled:opacity-60 sm:px-7 sm:pt-7"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4 sm:px-7">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
            <span className="rounded-full border border-line px-2.5 py-1">Adaptive plan</span>
            <span className="rounded-full border border-line px-2.5 py-1">PDF corpus</span>
            <span className="rounded-full border border-line px-2.5 py-1">Web fallback</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] text-ink-3 sm:inline">
              Ctrl ↵ to run
            </span>

            {busy ? (
              <button
                type="button"
                onClick={onStop}
                className="inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-full border border-ink px-5 text-sm font-medium transition-colors hover:bg-ink hover:text-paper-2"
              >
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Researching
                <span className="mx-1 h-4 w-px bg-current opacity-30" />
                <Square className="h-3 w-3 fill-current" />
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit}
                className="group/btn inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-ink pl-5 pr-2 text-sm font-medium text-paper-2 transition-colors hover:bg-signal disabled:cursor-not-allowed disabled:bg-ink/25"
              >
                Start research
                <span className="grid h-7 w-7 place-items-center rounded-full bg-paper-2 text-ink transition-transform group-hover/btn:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
          Try
        </span>
        {EXAMPLES.map((text) => (
          <button
            key={text}
            type="button"
            disabled={busy}
            onClick={() => pickExample(text)}
            className="max-w-full cursor-pointer truncate rounded-full border border-line px-3.5 py-1.5 text-left text-[13px] text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {text}
          </button>
        ))}
      </div>
    </section>
  );
}
