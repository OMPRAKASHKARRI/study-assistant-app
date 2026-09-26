import React, { useState } from "react";
import EmptyState from "./EmptyState.jsx";

export default function RecentSessions({ history, onOpen, onRetry, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);

  return (
    <section className="recent-sessions">
      <h2>Recent Study Sessions</h2>
      {history.length === 0 ? (
        <EmptyState
          title="No study sessions yet."
          subtitle="Generate your first session to start learning."
        />
      ) : (
        <ul className="session-list">
          {history.map((h) => (
            <li key={h.id} className="session-item">
              <div className="session-info">
                <span className="session-title">{h.title}</span>
                <span className="session-meta">
                  {h.questionCount} questions · {h.percent}% · {h.date}
                </span>
              </div>

              {confirmId === h.id ? (
                <div className="session-confirm" role="alertdialog" aria-label="Confirm delete">
                  <span>Are you sure you want to delete this study session?</span>
                  <div className="session-actions">
                    <button className="btn btn-small btn-secondary" onClick={() => setConfirmId(null)}>
                      Cancel
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => {
                        onDelete(h.id);
                        setConfirmId(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="session-actions">
                  <button className="btn btn-small" onClick={() => onOpen(h)}>
                    Open
                  </button>
                  <button className="btn btn-small btn-secondary" onClick={() => onRetry(h)}>
                    Retry
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => setConfirmId(h.id)}
                    aria-label={`Delete ${h.title}`}
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
