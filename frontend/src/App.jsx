import React, { useEffect, useRef, useState } from "react";
import { CircleAlert, X } from "lucide-react";
import { useElapsed, useHealth, useResearch } from "./lib/useResearch.js";
import Header from "./ui/Header.jsx";
import Hero from "./ui/Hero.jsx";
import HowItWorks from "./ui/HowItWorks.jsx";
import Pipeline from "./ui/Pipeline.jsx";
import ResearchPlan from "./ui/ResearchPlan.jsx";
import EventLog from "./ui/EventLog.jsx";
import Answer from "./ui/Answer.jsx";
import Footer from "./ui/Footer.jsx";
import { SectionHead } from "./ui/primitives.jsx";

export default function App() {
  const [query, setQuery] = useState("");
  const [errorDismissed, setErrorDismissed] = useState(false);
  const health = useHealth();
  const research = useResearch();
  const elapsed = useElapsed(research.startedAt, research.finishedAt);

  const runRef = useRef(null);
  const answerShown = useRef(false);

  const { busy, plan, steps, events, result, error, status } = research;
  const hasRun = busy || events.length > 0 || plan.length > 0;

  // Bring the live run into view when research starts.
  useEffect(() => {
    if (busy) {
      answerShown.current = false;
      runRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [busy]);

  // Bring the answer into view once, when it arrives.
  useEffect(() => {
    if (result && !answerShown.current) {
      answerShown.current = true;
      document.getElementById("answer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  useEffect(() => setErrorDismissed(false), [error]);

  return (
    <div className="min-h-screen">
      <Header busy={busy} status={status} error={error} health={health} />

      <main className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <Hero
          query={query}
          setQuery={setQuery}
          busy={busy}
          onSubmit={() => research.start(query)}
          onStop={research.stop}
        />

        {health.state === "offline" && !hasRun && (
          <div className="mb-12 flex items-start gap-3 rounded-[22px] border border-ochre/30 bg-ochre-soft p-5 text-ochre">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-relaxed">
              The research engine isn’t reachable at <span className="font-mono">127.0.0.1:8000</span>.
              Start it with <span className="font-mono">python -m uvicorn backend.main:app --reload</span>.
            </p>
          </div>
        )}

        {error && !errorDismissed && (
          <div
            role="alert"
            className="mb-12 flex items-start gap-3 rounded-[22px] border border-signal/30 bg-signal-soft p-5 text-signal-deep"
          >
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Research could not complete</p>
              <p className="mt-1 text-sm leading-relaxed opacity-90">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorDismissed(true)}
              className="cursor-pointer rounded-full p-1 transition-colors hover:bg-signal/10"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {!hasRun && <HowItWorks />}

        {hasRun && (
          <section ref={runRef} className="scroll-mt-20 pb-24">
            <SectionHead
              index="02"
              title="Live run"
              meta={busy ? status : `Finished · ${events.length} events`}
            />

            <Pipeline events={events} elapsed={elapsed} busy={busy} />

            <div className="mt-10 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ResearchPlan plan={plan} steps={steps} busy={busy} />
              </div>
              <div className="lg:col-span-5">
                <EventLog events={events} busy={busy} />
              </div>
            </div>
          </section>
        )}

        <Answer result={result} elapsed={elapsed} planSize={plan.length} />
      </main>

      <Footer />
    </div>
  );
}
