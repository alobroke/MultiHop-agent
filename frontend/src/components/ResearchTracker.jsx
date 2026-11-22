
import React from "react";

const STAGES = [
  { id: "planner", label: "Query Planner", icon: "◇" },
  { id: "retrieval", label: "Evidence Retrieval", icon: "⌕" },
  { id: "generator", label: "Answer Generation", icon: "✦" },
  { id: "verification", label: "Citation Check", icon: "✓" },
];

function getStageStatus(stageId, events) {
  const stageEvents = events.filter(
    (event) => event.node === stageId
  );

  if (stageEvents.length === 0) {
    return "pending";
  }

  return stageEvents[stageEvents.length - 1].status;
}

export default function ResearchTracker({
  events = [],
  plan = [],
  busy = false,
}) {
  if (!busy && events.length === 0) {
    return null;
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>Live Research Tracking</h3>
        <span className="tag">
          {busy ? "● Live" : "Finished"}
        </span>
      </div>

      <div className="tracker-flow">
        {STAGES.map((stage, index) => {
          const state = getStageStatus(stage.id, events);

          return (
            <React.Fragment key={stage.id}>
              {index > 0 && (
                <span className="tracker-arrow">→</span>
              )}

              <div className={`tracker-node ${state}`}>
                <div className="tracker-icon">
                  {state === "completed"
                    ? "✓"
                    : state === "running"
                    ? "◌"
                    : stage.icon}
                </div>

                <strong>{stage.label}</strong>
                <small>{state}</small>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {plan.length > 0 && (
        <div className="tracker-plan">
          <strong>
            Research tasks: {plan.length}
          </strong>

          {plan.map((task) => (
            <div key={task.id} className="tracker-plan-item">
              <span>{task.id}</span>
              <p>{task.question}</p>
              {task.depends_on?.length > 0 && (
                <small>
                  After: {task.depends_on.join(", ")}
                </small>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="tracker-activity">
        <h4>Execution Trace</h4>

        {events.length === 0 && (
          <p>Waiting for the first research event...</p>
        )}

        {events.map((item, index) => (
          <div className="tracker-event" key={index}>
            <span className="tracker-event-time">
              {item.time}
            </span>

            <span
              className={`tracker-event-dot ${item.status}`}
            />

            <div>
              <strong>
                {item.hop_id ? `${item.hop_id} · ` : ""}
                {STAGES.find(
                  (stage) => stage.id === item.node
                )?.label || item.node}
              </strong>

              <p>
                {item.message ||
                  (item.node === "retrieval" &&
                  item.status === "completed"
                    ? `${item.local_count} PDF passages, ${item.web_count} web results`
                    : item.status)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
