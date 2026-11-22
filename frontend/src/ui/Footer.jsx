import React from "react";
import { LogoMark } from "./Logo.jsx";

export default function Footer() {
  return (
    <footer className="overflow-hidden border-t border-line">
      <div className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">
          <span className="flex items-center gap-2 text-ink">
            <LogoMark className="h-5 w-5" />
            Adaptive · evidence-grounded · explainable
          </span>
          <span>Plan → Retrieve → Synthesize → Cite</span>
        </div>

        <div
          aria-hidden="true"
          className="mt-8 select-none whitespace-nowrap text-[15.5vw] font-semibold leading-[0.78] tracking-[-0.07em] text-ink/[0.06] sm:text-[16vw] xl:text-[214px]"
        >
          MultiHop<span className="font-serif font-normal italic tracking-[-0.02em] text-signal/25">x</span>
        </div>
      </div>
    </footer>
  );
}
