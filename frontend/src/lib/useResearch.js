import { useCallback, useEffect, useRef, useState } from "react";

export const API = "http://127.0.0.1:8000";

const RUNNING_COPY = {
  planner: "Planning research",
  documents: "Searching local documents",
  web: "Searching the web",
  generator: "Generating findings",
  synthesis: "Synthesizing answer",
  verification: "Checking citations",
};

/** Backend health: model name + online flag. */
export function useHealth() {
  const [health, setHealth] = useState({ state: "checking" });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const response = await fetch(`${API}/health`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!cancelled) setHealth({ state: "online", model: data.model });
      } catch {
        if (!cancelled) setHealth({ state: "offline" });
      }
    }

    check();
    const timer = setInterval(check, 30000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return health;
}

/** Streams a research run from the backend over SSE. */
export function useResearch() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [plan, setPlan] = useState([]);
  const [steps, setSteps] = useState([]);
  const [events, setEvents] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [finishedAt, setFinishedAt] = useState(null);

  const eventCounter = useRef(0);
  const running = useRef(false);
  const controller = useRef(null);

  function addTrace(data) {
    eventCounter.current += 1;
    setEvents((previous) => [
      ...previous,
      {
        ...data,
        eventId: eventCounter.current,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
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
        if (data.plan) setPlan(data.plan);
        if (data.status === "completed") setStatus("Research plan created");
      }

      if (data.node === "executor") {
        setSteps((previous) => {
          const existing = previous.find((s) => s.hop_id === data.hop_id);
          const remaining = previous.filter((s) => s.hop_id !== data.hop_id);

          return [
            ...remaining,
            {
              ...existing,
              hop_id: data.hop_id,
              question: data.question || existing?.question || "",
              status: data.status || existing?.status || "pending",
              finding: data.finding || existing?.finding || "",
              source_count:
                data.source_count ?? existing?.source_count ?? null,
            },
          ];
        });

        if (data.status === "running") setStatus(`Researching ${data.hop_id}`);
        if (data.status === "completed") setStatus(`${data.hop_id} completed`);
      }

      if (data.status === "running" && RUNNING_COPY[data.node]) {
        setStatus(RUNNING_COPY[data.node]);
      }

      return;
    }

    if (name === "completed") {
      setResult(data);
      setStatus("Research completed");
      setFinishedAt(Date.now());
      setBusy(false);
      running.current = false;
      return;
    }

    if (name === "failed") {
      setError(data.message || "Research failed.");
      setStatus("Research failed");
      setFinishedAt(Date.now());
      setBusy(false);
      running.current = false;
    }
  }

  const start = useCallback(async (query) => {
    const question = query.trim();
    if (!question || running.current) return;

    running.current = true;
    eventCounter.current = 0;
    controller.current = new AbortController();

    setBusy(true);
    setStatus("Connecting to research agent");
    setPlan([]);
    setSteps([]);
    setEvents([]);
    setResult(null);
    setError("");
    setStartedAt(Date.now());
    setFinishedAt(null);

    let finished = false;

    try {
      const response = await fetch(`${API}/research/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question }),
        signal: controller.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}`);
      }
      if (!response.body) {
        throw new Error("The browser does not support streaming.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const handleBlock = (block) => {
        let name = "message";
        const dataLines = [];

        for (const line of block.split("\n")) {
          if (line.startsWith("event:")) name = line.slice(6).trim();
          if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
        }

        if (!dataLines.length) return;

        processEvent(name, JSON.parse(dataLines.join("\n")));

        if (name === "completed" || name === "failed") finished = true;
      };

      while (true) {
        const { done, value } = await reader.read();

        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        buffer = buffer.replace(/\r\n/g, "\n");

        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
          const block = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          if (block.trim()) handleBlock(block);
        }

        if (done) break;
      }

      if (buffer.trim()) handleBlock(buffer);

      if (!finished) {
        throw new Error(
          "The server stopped streaming before returning a research result."
        );
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setStatus("Stopped");
      } else {
        setError(err.message || "Unable to connect to backend.");
        setStatus("Research failed");
      }
      setFinishedAt(Date.now());
    } finally {
      running.current = false;
      controller.current = null;
      setBusy(false);
    }
    // processEvent only uses state setters and refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = useCallback(() => {
    controller.current?.abort();
  }, []);

  return {
    busy,
    status,
    plan,
    steps,
    events,
    result,
    error,
    startedAt,
    finishedAt,
    start,
    stop,
  };
}

/** Live elapsed seconds between start and finish. */
export function useElapsed(startedAt, finishedAt) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!startedAt || finishedAt) return;
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, [startedAt, finishedAt]);

  if (!startedAt) return null;
  return ((finishedAt ?? now) - startedAt) / 1000;
}
