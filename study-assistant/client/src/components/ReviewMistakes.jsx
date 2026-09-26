import React from "react";
import { getWeakQuestions } from "../utils/scoring.js";

export default function ReviewMistakes({ answers }) {
  const mistakes = getWeakQuestions(answers);
  if (mistakes.length === 0) return null;

  return (
    <div className="review-mistakes">
      <h3>Review Mistakes</h3>
      <ul className="mistake-list">
        {mistakes.map((a, i) => (
          <li key={a.cardId || i} className={`mistake-item verdict-${a.verdict}`}>
            <p className="mistake-question">{a.question}</p>
            <p className="mistake-your-answer">
              <strong>Your answer:</strong> {a.userAnswer || "(no answer)"}
            </p>
            <p className="mistake-reference">
              <strong>Expected answer:</strong> {a.referenceAnswer}
            </p>
            <p className="mistake-feedback">{a.feedback}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
