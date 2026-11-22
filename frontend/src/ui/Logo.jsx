import React from "react";

/*
  The mark: two hops between three nodes, which together
  read as a lowercase "m". The last node — the answer —
  lands in signal vermilion.
*/
export function LogoMark({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M5 24 C5 9.5, 16 9.5, 16 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M16 24 C16 9.5, 27 9.5, 27 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="5" cy="24" r="2.5" fill="currentColor" />
      <circle cx="16" cy="24" r="2.5" fill="currentColor" />
      <circle cx="27" cy="24" r="3.6" className="fill-signal" />
    </svg>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <span className={`inline-flex items-baseline leading-none ${className}`}>
      <span className="font-semibold tracking-[-0.03em]">MultiHop</span>
      <span className="ml-[0.06em] font-serif text-[1.2em] italic text-signal">x</span>
    </span>
  );
}

export default function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5 text-ink" aria-label="MultiHop-X home">
      <LogoMark />
      <Wordmark className="text-[18px]" />
    </a>
  );
}
