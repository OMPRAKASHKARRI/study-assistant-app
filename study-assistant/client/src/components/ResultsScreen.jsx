import React from "react";
import { countResults, calculatePercentage, getWeakTopics } from "../utils/scoring.js";
import WeakAreas from "./WeakAreas.jsx";
import ReviewMistakes from "./ReviewMistakes.jsx";

export default function ResultsScreen({
  title,
  answers,
  onRetry,
  onPracticeWeak,
  onHome,
  heading = "🎉 Study Session Complete",
}) {
  const { correct, partial, incorrect } = countResults(answers);
  const total = answers.length;
  const percent = calculatePercentage(answers);
  const weakAreas = getWeakTopics(answers);
  const hasWeakQuestions = correct < total;

  return (
    <div className="results-screen">
      <h2>{heading}</h2>
      <p className="results-subtitle">{title}</p>

      <div className="results-summary">
        <div className="results-score-circle">
          <span className="results-fraction">
            {correct} / {total}
          </span>
          <span className="results-percent">{percent}%</span>
        </div>
        <div className="results-breakdown">
          <div className="breakdown-item verdict-correct">✅ Correct: {correct}</div>
          <div className="breakdown-item verdict-partial">🟡 Partial: {partial}</div>
          <div className="breakdown-item verdict-incorrect">❌ Incorrect: {incorrect}</div>
        </div>
      </div>

      <WeakAreas weakAreas={weakAreas} />
      <ReviewMistakes answers={answers} />

      {!hasWeakQuestions && (
        <p className="no-weak-areas-note">🎉 Great job! You don't have any weak areas to review.</p>
      )}

      <div className="results-actions">
        <button className="btn btn-secondary" onClick={onHome}>
          Back to Home
        </button>
        {hasWeakQuestions && (
          <button className="btn btn-primary" onClick={onPracticeWeak}>
            Practice Weak Areas
          </button>
        )}
        <button className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      </div>
    </div>
  );
}
