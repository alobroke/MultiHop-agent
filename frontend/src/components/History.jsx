
import { History as HistoryIcon, Plus } from "lucide-react";
import React from "react";
export default function History({
  sessions = [],
  selectedSession,
  onSelect,
  onNew,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">X</div>
        <div>
          <strong>MultiHop-X</strong>
          <small>Research Studio</small>
        </div>
      </div>

      <button
        className="new-session-button"
        onClick={onNew}
      >
        <Plus size={16} /> New Research
      </button>

      <div className="sidebar-heading">
        <HistoryIcon size={15} />
        <span>Research History</span>
      </div>

      <div className="session-list">
        {sessions.map((session) => (
          <button
            key={session.id}
            className={
              selectedSession === session.id
                ? "session-item selected"
                : "session-item"
            }
            onClick={() => onSelect(session.id)}
          >
            <span>{session.title}</span>
            <small>
              {new Date(
                session.updated_at
              ).toLocaleDateString()}
            </small>
          </button>
        ))}
      </div>
    </aside>
  );
}
