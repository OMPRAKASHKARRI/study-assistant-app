import React, { useState } from "react";
import ProgressBar from "./ProgressBar.jsx";

export default function LearnMode({ cards, onFinish, onBack }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];

  const next = () => {
    if (index + 1 >= cards.length) {
      onFinish();
      return;
    }
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  const prev = () => {
    setFlipped(false);
    setIndex((i) => Math.max(0, i - 1));
  };

  return (
    <div className="learn-mode">
      <ProgressBar current={index + 1} total={cards.length} />
      <div className={`flip-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((f) => !f)}>
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <div className="card-badges">
              <span className={`badge badge-${card.difficulty}`}>{card.difficulty}</span>
              <span className="badge badge-topic">{card.topic}</span>
            </div>
            <p className="card-question">{card.question}</p>
            <span className="flip-hint">Tap to reveal answer</span>
          </div>
          <div className="flip-card-back">
            <p className="card-answer">{card.answer}</p>
            <span className="flip-hint">Tap to see question</span>
          </div>
        </div>
      </div>
      <div className="learn-controls">
        <button className="btn btn-secondary" onClick={prev} disabled={index === 0}>
          Previous
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          Back to Modes
        </button>
        <button className="btn btn-primary" onClick={next}>
          {index + 1 >= cards.length ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
