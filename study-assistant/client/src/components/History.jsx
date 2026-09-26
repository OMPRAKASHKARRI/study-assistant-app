import React from "react";
import RecentSessions from "./RecentSessions.jsx";

// Full history view — same list UI as the home page's recent sessions,
// available for a dedicated "History" screen if the app grows one.
export default function History({ history, onOpen, onRetry, onDelete, onBack }) {
  return (
    <div className="history-page">
      <button className="btn btn-ghost" onClick={onBack}>
        ← Back
      </button>
      <RecentSessions history={history} onOpen={onOpen} onRetry={onRetry} onDelete={onDelete} />
    </div>
  );
}
