import React from "react";
import StudyInput from "./StudyInput.jsx";
import RecentSessions from "./RecentSessions.jsx";
import ErrorState from "./ErrorState.jsx";

export default function Home({
  onGenerate,
  loading,
  error,
  history,
  onOpenHistory,
  onRetryHistory,
  onDeleteHistory,
  todaysReviewCount,
  onStartTodaysReview,
}) {
  return (
    <div className="home-page">
      <p className="tagline">Turn your notes into an interactive study session.</p>

      {todaysReviewCount > 0 && (
        <div className="todays-review-banner">
          <div>
            <p className="todays-review-title">🔥 Today's Review</p>
            <p className="todays-review-subtitle">
              {todaysReviewCount} question{todaysReviewCount === 1 ? "" : "s"} need practice.
            </p>
          </div>
          <button className="btn btn-primary" onClick={onStartTodaysReview}>
            Start Review
          </button>
        </div>
      )}

      <StudyInput onGenerate={onGenerate} loading={loading} />
      {error && <ErrorState message={error} />}
      <RecentSessions
        history={history}
        onOpen={onOpenHistory}
        onRetry={onRetryHistory}
        onDelete={onDeleteHistory}
      />
    </div>
  );
}
