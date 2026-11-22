
const API_URL = "http://127.0.0.1:8000";

export async function getSessions() {
  const response = await fetch(`${API_URL}/sessions`);

  if (!response.ok) {
    throw new Error("Failed to load sessions");
  }

  return response.json();
}

export async function getSession(sessionId) {
  const response = await fetch(
    `${API_URL}/sessions/${sessionId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load session");
  }

  return response.json();
}

export async function streamResearch({
  question,
  sessionId,
  onEvent,
  signal,
}) {
  const response = await fetch(
    `${API_URL}/research/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        session_id: sessionId || null,
      }),
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Research request failed: HTTP ${response.status}`
    );
  }

  if (!response.body) {
    throw new Error("Streaming is unavailable");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let finished = false;

  function processBlock(block) {
    const lines = block.split("\n");

    let eventName = "message";
    const dataLines = [];

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (dataLines.length === 0) return;

    const data = JSON.parse(dataLines.join("\n"));

    onEvent(eventName, data);

    if (eventName === "completed" || eventName === "failed") {
      finished = true;
    }
  }

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder
        .decode(value, { stream: true })
        .replace(/\r\n/g, "\n");

      let boundary;

      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        if (block.trim()) {
          processBlock(block);
        }
      }
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
      processBlock(buffer.trim());
    }

    if (!finished && !signal?.aborted) {
      throw new Error(
        "Research stream ended unexpectedly"
      );
    }
  } finally {
    reader.releaseLock();
  }
}
