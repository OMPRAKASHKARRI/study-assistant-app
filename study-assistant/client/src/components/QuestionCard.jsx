import React from "react";

export default function QuestionCard({ card }) {
  return (
    <div className="question-card">
      <div className="card-badges">
        <span className={`badge badge-${card.difficulty}`}>{card.difficulty}</span>
        <span className="badge badge-topic">{card.topic}</span>
      </div>
      <p className="card-question">{card.question}</p>
    </div>
  );
}
