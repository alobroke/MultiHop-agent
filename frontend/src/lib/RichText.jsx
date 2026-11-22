import React from "react";

/*
  Minimal, safe Markdown-ish renderer for LLM answers.
  Supports: headings, bullet / numbered lists, paragraphs,
  **bold**, `code`, and [S1] / [S1, S2] citations.
  Builds React elements only — no innerHTML.
*/

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[S\d+(?:\s*,\s*S?\d+)*\])/g;

function Citation({ n, onCite }) {
  return (
    <button
      type="button"
      onClick={() => onCite?.(n)}
      className="mx-[2px] inline-flex -translate-y-[0.3em] cursor-pointer items-center rounded-full bg-signal-soft px-[6px] py-[1px] align-baseline font-mono text-[10.5px] font-medium leading-[1.5] text-signal-deep transition-colors hover:bg-signal hover:text-paper-2"
      aria-label={`Jump to source ${n}`}
    >
      S{n}
    </button>
  );
}

function renderInline(text, onCite, keyBase) {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={key} className="rounded bg-ink/[0.06] px-1 py-0.5 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }

    if (/^\[S\d/.test(part)) {
      const ids = part.match(/\d+/g) || [];
      return (
        <React.Fragment key={key}>
          {ids.map((n) => (
            <Citation key={`${key}-${n}`} n={Number(n)} onCite={onCite} />
          ))}
        </React.Fragment>
      );
    }

    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

export default function RichText({ text = "", onCite }) {
  const blocks = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "p", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);

    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h", text: heading[1] });
    } else if (bullet || numbered) {
      flushParagraph();
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.type === "h") {
          return (
            <h4 key={i} className="pt-2 text-[1.35em] font-medium tracking-[-0.02em] text-ink">
              {renderInline(block.text, onCite, i)}
            </h4>
          );
        }

        if (block.type === "ul" || block.type === "ol") {
          const List = block.type;
          return (
            <List key={i} className="space-y-2.5">
              {block.items.map((item, j) => (
                <li key={j} className="relative flex gap-3">
                  <span className="mt-[0.2em] shrink-0 font-mono text-[0.75em] text-signal">
                    {block.type === "ol" ? String(j + 1).padStart(2, "0") : "—"}
                  </span>
                  <span>{renderInline(item, onCite, `${i}-${j}`)}</span>
                </li>
              ))}
            </List>
          );
        }

        return <p key={i}>{renderInline(block.text, onCite, i)}</p>;
      })}
    </div>
  );
}
