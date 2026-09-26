import React from "react";

export default function ModeSelector({ title, cardCount, onSelectLearn, onSelectQuiz }) {
  return (
    <div className="mode-selector">
      <h2>{title}</h2>
      <p className="mode-subtitle">{cardCount} questions generated</p>
      <div className="mode-options">
        <button className="mode-card" onClick={onSelectLearn}>
          <span className="mode-icon">📖</span>
          <span className="mode-name">Learn Mode</span>
          <span className="mode-desc">Flip through cards at your own pace</span>
        </button>
        <button className="mode-card" onClick={onSelectQuiz}>
          <span className="mode-icon">✍️</span>
          <span className="mode-name">Quiz Mode</span>
          <span className="mode-desc">Type answers, get AI-graded feedback</span>
        </button>
      </div>
    </div>
  );
}
