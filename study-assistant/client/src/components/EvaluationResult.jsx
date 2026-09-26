import React from "react";

const VERDICT_META = {
  correct: { icon: "✅", label: "Correct", cls: "verdict-correct" },
  partial: { icon: "🟡", label: "Almost Correct", cls: "verdict-partial" },
  incorrect: { icon: "❌", label: "Incorrect", cls: "verdict-incorrect" },
};

export default function EvaluationResult({ evaluation, referenceAnswer, onNext, isLast }) {
  const meta = VERDICT_META[evaluation.verdict] || VERDICT_META.incorrect;
  return (
    <div className={`evaluation-result ${meta.cls}`}>
      <div className="verdict-row">
        <span className="verdict-icon" aria-hidden="true">{meta.icon}</span>
        <span className="verdict-label">{meta.label}</span>
        <span className="verdict-score">{evaluation.score}%</span>
      </div>
      <p className="evaluation-feedback">{evaluation.feedback}</p>
      <div className="reference-answer">
        <span className="reference-label">Reference answer:</span>
        <p>{referenceAnswer}</p>
      </div>
      <button className="btn btn-primary" onClick={onNext}>
        {isLast ? "See Results" : "Next Question"}
      </button>
    </div>
  );
}
