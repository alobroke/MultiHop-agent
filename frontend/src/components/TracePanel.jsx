
import React from "react";
import {
  Activity,
  CheckCircle2,
  CircleDot,
  AlertCircle,
} from "lucide-react";

export default function TracePanel({
  events = [],
  activeNode,
  hops = [],
  attempts = {},
  criticResults = {},
}) {
  return (
    <div className="panel trace-panel">
      <div className="panel-header">
        <h3>Execution Trace</h3>
        <Activity size={18} />
      </div>

      <div className="trace-section">
        <h4>Subquery Progress</h4>

        {hops.length === 0 && (
          <p className="muted">
            No research plan yet.
          </p>
        )}

        {hops.map((hop) => {
          const critic = criticResults[hop.id];

          return (
            <div className="hop-row" key={hop.id}>
              <div className="hop-heading">
                <strong>{hop.id}</strong>

                <span className={`pill ${hop.status}`}>
                  {hop.status}
                </span>
              </div>

              <p>{hop.question}</p>

              {hop.depends_on.length > 0 && (
                <small>
                  Depends on: {hop.depends_on.join(", ")}
                </small>
              )}

              <small>
                Attempts: {attempts[hop.id] || 0}
              </small>

              {critic && (
                <div className="critic-details">
                  <small>
                    <strong>Critic score:</strong>{" "}
                    {critic.score}/100
                  </small>

                  <small>
                    <strong>Reason:</strong>{" "}
                    {critic.reason}
                  </small>

                  {critic.missing?.length > 0 && (
                    <small>
                      <strong>Missing evidence:</strong>{" "}
                      {critic.missing.join(", ")}
                    </small>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="trace-section">
        <h4>Live Events</h4>

        <div className="event-list">
          {events.length === 0 && (
            <p className="muted">
              Waiting for execution...
            </p>
          )}

          {events.map((event, index) => (
            <div className="event-row" key={index}>
              {event.type === "completed" ? (
                <CheckCircle2
                  size={15}
                  color="#47b89a"
                />
              ) : event.type === "failed" ? (
                <AlertCircle
                  size={15}
                  color="#fb7185"
                />
              ) : (
                <CircleDot
                  size={15}
                  color="#8faaff"
                />
              )}

              <div>
                <strong>{event.label}</strong>
                <small>{event.time}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="trace-footer">
        Current node:{" "}
        <strong>{activeNode || "Idle"}</strong>
      </div>
    </div>
  );
}
