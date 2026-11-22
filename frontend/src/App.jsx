
import React, { useRef, useState } from "react";

const API = "http://127.0.0.1:8000";

const WORKFLOW = [
  {
    id: "planner",
    label: "Query Planner",
    subtitle: "Analyze complexity",
    icon: "◇",
  },
  {
    id: "documents",
    label: "Document Search",
    subtitle: "Local PDF evidence",
    icon: "▤",
  },
  {
    id: "web",
    label: "Tavily Search",
    subtitle: "Web fallback",
    icon: "◎",
  },
  {
    id: "generator",
    label: "Research Agent",
    subtitle: "Generate findings",
    icon: "✦",
  },
  {
    id: "synthesis",
    label: "Answer Synthesis",
    subtitle: "Combine findings",
    icon: "≡",
  },
  {
    id: "verification",
    label: "Citation Check",
    subtitle: "Validate references",
    icon: "✓",
  },
];

function StageIcon({ status, icon }) {
  if (status === "completed") {
    return "✓";
  }

  if (status === "running") {
    return (
      <span className="spinner" />
    );
  }

  if (status === "failed") {
    return "!";
  }

  if (status === "skipped") {
    return "—";
  }

  return icon;
}

function WorkflowTracker({
  events,
  busy,
  plan,
}) {
  const latestEvents = {};

  for (const entry of events) {
    latestEvents[entry.node] = entry;
  }

  const completedCount = WORKFLOW.filter(
    (stage) =>
      latestEvents[stage.id]?.status ===
      "completed"
  ).length;

  const progress = Math.round(
    (completedCount / WORKFLOW.length) * 100
  );

  return (
    <section className="panel tracker-panel">
      <div className="panel-heading">
        <div>
          <div className="section-eyebrow">
            AGENT EXECUTION
          </div>

          <h3>Live Research Workflow</h3>
        </div>

        <span
          className={`live-pill ${
            busy ? "is-live" : ""
          }`}
        >
          <span className="live-dot" />
          {busy ? "Live" : "Stopped"}
        </span>
      </div>

      <div className="progress-header">
        <span>Workflow progress</span>
        <span>{progress}%</span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="workflow-grid">
        {WORKFLOW.map((stage, index) => {
          const entry = latestEvents[stage.id];

          const status =
            entry?.status || "pending";

          return (
            <div
              className={`workflow-step ${status}`}
              key={stage.id}
            >
              <div className="workflow-step-top">
                <span className="step-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="workflow-state">
                  {status}
                </span>
              </div>

              <div className="workflow-icon">
                <StageIcon
                  status={status}
                  icon={stage.icon}
                />
              </div>

              <strong>{stage.label}</strong>
              <p>{stage.subtitle}</p>
            </div>
          );
        })}
      </div>

      {plan.length > 0 && (
        <div className="workflow-summary">
          <span>Plan</span>
          <strong>
            {plan.length} research{" "}
            {plan.length === 1 ? "task" : "tasks"}
          </strong>
        </div>
      )}
    </section>
  );
}

function ResearchPlan({ plan, steps }) {
  if (!plan.length) {
    return null;
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <div className="section-eyebrow">
            ADAPTIVE DECOMPOSITION
          </div>
          <h3>Research Plan</h3>
        </div>

        <span className="count-pill">
          {plan.length}{" "}
          {plan.length === 1
            ? "Subquery"
            : "Subqueries"}
        </span>
      </div>

      <div className="subquery-list">
        {plan.map((task) => {
          const state = steps.find(
            (step) => step.hop_id === task.id
          );

          const status =
            state?.status || "pending";

          return (
            <article
              className={`subquery-card ${status}`}
              key={task.id}
            >
              <div className="subquery-header">
                <span className="subquery-id">
                  {task.id}
                </span>

                <span className={`subquery-status ${status}`}>
                  {status === "completed"
                    ? "✓ Completed"
                    : status === "running"
                    ? "◌ Researching"
                    : "Pending"}
                </span>
              </div>

              <p className="subquery-question">
                {task.question}
              </p>

              {task.depends_on?.length > 0 && (
                <div className="dependency-line">
                  <span>Depends on</span>
                  {task.depends_on.map((id) => (
                    <span
                      className="dependency-pill"
                      key={id}
                    >
                      {id}
                    </span>
                  ))}
                </div>
              )}

              {state?.source_count != null && (
                <div className="subquery-metadata">
                  {state.source_count} sources used
                </div>
              )}

              {state?.finding && (
                <details className="finding-details">
                  <summary>
                    View research finding
                  </summary>

                  <div className="finding-body">
                    {state.finding}
                  </div>
                </details>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ExecutionTimeline({ events, busy }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <div className="section-eyebrow">
            REAL-TIME EVENTS
          </div>

          <h3>Execution Timeline</h3>
        </div>

        <span className="count-pill">
          {events.length} events
        </span>
      </div>

      <div className="timeline">
        {events.length === 0 && (
          <div className="timeline-empty">
            Waiting for research events...
          </div>
        )}

        {events.map((entry, index) => {
          const stage = WORKFLOW.find(
            (item) => item.id === entry.node
          );

          const title =
            stage?.label ||
            (entry.node === "executor"
              ? "Subquery Executor"
              : entry.node);

          return (
            <div
              className="timeline-item"
              key={entry.eventId ?? index}
            >
              <div className="timeline-marker">
                <span
                  className={`timeline-dot ${entry.status}`}
                />
              </div>

              <div className="timeline-content">
                <div className="timeline-top">
                  <strong>
                    {entry.hop_id
                      ? `${entry.hop_id} · `
                      : ""}
                    {title}
                  </strong>

                  <span>{entry.time}</span>
                </div>

                <p>
                  {entry.message || entry.status}
                </p>

                {entry.node === "documents" &&
                  entry.status === "completed" && (
                    <div className="timeline-detail">
                      {entry.source_count || 0} PDF
                      passages
                    </div>
                  )}

                {entry.node === "web" &&
                  entry.status === "completed" && (
                    <div className="timeline-detail">
                      {entry.source_count || 0} web
                      results
                    </div>
                  )}
              </div>
            </div>
          );
        })}

        {busy && (
          <div className="timeline-waiting">
            <span className="spinner small" />
            Agent is processing...
          </div>
        )}
      </div>
    </section>
  );
}

function ResearchAnswer({ result }) {
  if (!result) {
    return null;
  }

  const verification =
    result.verification || {};

  return (
    <>
      <section className="panel answer-panel">
        <div className="panel-heading">
          <div>
            <div className="section-eyebrow">
              RESEARCH OUTPUT
            </div>

            <h3>Final Answer</h3>
          </div>

          <span className="completed-pill">
            ✓ Completed
          </span>
        </div>

        <div className="answer-content">
          {result.answer}
        </div>

        <div className="verification-box">
          <div className="verification-heading">
            <span>✓</span>
            <strong>Source Citation Check</strong>
          </div>

          <p>
            Status:{" "}
            <strong>
              {verification.status || "Unknown"}
            </strong>
          </p>

          <p>{verification.message}</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <div className="section-eyebrow">
              RETRIEVED REFERENCES
            </div>

            <h3>Evidence Sources</h3>
          </div>

          <span className="count-pill">
            {result.sources?.length || 0} sources
          </span>
        </div>

        <div className="sources-list">
          {(result.sources || []).map((source) => (
            <div
              className="source-card"
              key={source.id}
            >
              <div className="source-top">
                <span className="citation-id">
                  S{source.id}
                </span>

                <div>
                  <h4>{source.title}</h4>

                  <span className="source-type">
                    {source.type === "document"
                      ? `PDF Document · Page ${source.page}`
                      : "Tavily Web Search"}
                  </span>
                </div>
              </div>

              <p className="source-excerpt">
                {source.content}
              </p>

              {source.url && (
                <a
                  className="source-link"
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open original source ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {result.warnings?.length > 0 && (
        <section className="panel warning-panel">
          <h3>Retrieval Warnings</h3>

          {result.warnings.map(
            (warning, index) => (
              <p key={index}>{warning}</p>
            )
          )}
        </section>
      )}
    </>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Ready");

  const [plan, setPlan] = useState([]);
  const [steps, setSteps] = useState([]);
  const [events, setEvents] = useState([]);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const eventCounter = useRef(0);
  const running = useRef(false);

  function addTrace(data) {
    eventCounter.current += 1;

    setEvents((previous) => [
      ...previous,
      {
        ...data,
        eventId: eventCounter.current,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  }

  function processEvent(name, data) {
    if (name === "started") {
      setStatus("Research started");
      return;
    }

    if (name === "node_update") {
      addTrace(data);

      if (data.node === "planner") {
        if (data.plan) {
          setPlan(data.plan);
        }

        if (data.status === "running") {
          setStatus("Planning research...");
        }

        if (data.status === "completed") {
          setStatus("Research plan created");
        }
      }

      if (data.node === "executor") {
        setSteps((previousSteps) => {
          const existing = previousSteps.find(
            (step) => step.hop_id === data.hop_id
          );

          const remaining = previousSteps.filter(
            (step) => step.hop_id !== data.hop_id
          );

          return [
            ...remaining,
            {
              ...existing,
              hop_id: data.hop_id,
              question:
                data.question ||
                existing?.question ||
                "",
              status:
                data.status ||
                existing?.status ||
                "pending",
              finding:
                data.finding ||
                existing?.finding ||
                "",
              source_count:
                data.source_count ??
                existing?.source_count ??
                null,
            },
          ];
        });

        if (data.status === "running") {
          setStatus(
            `Researching ${data.hop_id}...`
          );
        }

        if (data.status === "completed") {
          setStatus(
            `${data.hop_id} completed`
          );
        }
      }

      if (data.node === "documents") {
        if (data.status === "running") {
          setStatus("Searching local documents...");
        }
      }

      if (data.node === "web") {
        if (data.status === "running") {
          setStatus("Searching Tavily...");
        }
      }

      if (data.node === "generator") {
        if (data.status === "running") {
          setStatus("Generating research...");
        }
      }

      if (data.node === "synthesis") {
        if (data.status === "running") {
          setStatus("Synthesizing answer...");
        }
      }

      if (data.node === "verification") {
        if (data.status === "running") {
          setStatus("Checking citations...");
        }
      }

      return;
    }

    if (name === "completed") {
      setResult(data);
      setStatus("Research completed");
      setBusy(false);
      running.current = false;
      return;
    }

    if (name === "failed") {
      setError(
        data.message || "Research failed."
      );
      setStatus("Research failed");
      setBusy(false);
      running.current = false;
    }
  }

  async function startResearch(event) {
    event.preventDefault();

    if (!query.trim() || running.current) {
      return;
    }

    running.current = true;
    eventCounter.current = 0;

    setBusy(true);
    setStatus("Connecting to research agent...");

    setPlan([]);
    setSteps([]);
    setEvents([]);
    setResult(null);
    setError("");

    let finished = false;

    try {
      const response = await fetch(
        `${API}/research/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: query.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Backend returned HTTP ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error(
          "The browser does not support streaming."
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      function handleBlock(block) {
        let name = "message";
        const dataLines = [];

        for (const line of block.split("\n")) {
          if (line.startsWith("event:")) {
            name = line.slice(6).trim();
          }

          if (line.startsWith("data:")) {
            dataLines.push(
              line.slice(5).trimStart()
            );
          }
        }

        if (!dataLines.length) {
          return;
        }

        const data = JSON.parse(
          dataLines.join("\n")
        );

        processEvent(name, data);

        if (
          name === "completed" ||
          name === "failed"
        ) {
          finished = true;
        }
      }

      while (true) {
        const { done, value } = await reader.read();

        buffer += decoder.decode(
          value || new Uint8Array(),
          {
            stream: !done,
          }
        );

        buffer = buffer.replace(
          /\r\n/g,
          "\n"
        );

        let boundary;

        while (
          (boundary = buffer.indexOf("\n\n")) !== -1
        ) {
          const block = buffer.slice(
            0,
            boundary
          );

          buffer = buffer.slice(
            boundary + 2
          );

          if (block.trim()) {
            handleBlock(block);
          }
        }

        if (done) {
          break;
        }
      }

      if (buffer.trim()) {
        handleBlock(buffer);
      }

      if (!finished) {
        throw new Error(
          "The server stopped streaming before "
          + "returning a research result."
        );
      }
    } catch (err) {
      setError(
        err.message ||
        "Unable to connect to backend."
      );

      setStatus("Research failed");
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  const hasResearch =
    busy ||
    events.length > 0 ||
    plan.length > 0;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-symbol">
              M
            </div>

            <div className="brand-text">
              <h1>MultiHop-X</h1>
              <span>Agentic Research System</span>
            </div>
          </div>

          <div className="topbar-right">
            <span className="model-label">
              RESEARCH AGENT
            </span>

            <span className="system-indicator">
              <span className="system-dot" />
              {status}
            </span>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <section className="hero">
          <div className="hero-eyebrow">
            INTELLIGENT MULTI-HOP RESEARCH
          </div>

          <h2>
            Research with
            <span> transparency.</span>
          </h2>

          <p>
            An adaptive research agent that plans,
            retrieves evidence from PDFs and the web,
            generates cited answers, and shows every
            step of the process.
          </p>

          <form
            className="query-form"
            onSubmit={startResearch}
          >
            <textarea
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Ask a research question..."
              rows={3}
              disabled={busy}
            />

            <div className="form-footer">
              <div className="capabilities">
                <span>◇ Adaptive Planning</span>
                <span>▤ PDF Search</span>
                <span>◎ Tavily</span>
              </div>

              <button
                type="submit"
                className="research-button"
                disabled={
                  busy || !query.trim()
                }
              >
                {busy ? (
                  <>
                    <span className="spinner small" />
                    Researching
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    Start Research
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <section className="error-banner">
            <strong>
              Research could not complete
            </strong>
            <p>{error}</p>
          </section>
        )}

        {hasResearch && (
          <div className="research-layout">
            <div className="research-main">
              <WorkflowTracker
                events={events}
                busy={busy}
                plan={plan}
              />

              <ResearchPlan
                plan={plan}
                steps={steps}
              />
            </div>

            <div className="research-sidebar">
              <ExecutionTimeline
                events={events}
                busy={busy}
              />
            </div>
          </div>
        )}

        <ResearchAnswer result={result} />
      </main>

      <footer className="footer">
        MultiHop-X · Adaptive Evidence-Grounded Research
      </footer>
    </div>
  );
}
