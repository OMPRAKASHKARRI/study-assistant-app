import React from "react";

export default function WeakAreas({ weakAreas }) {
  if (weakAreas.length === 0) return null;
  return (
    <div className="weak-areas">
      <h3>Weak Areas</h3>
      <ul className="weak-area-list">
        {weakAreas.map((w) => (
          <li key={w.topic} className="weak-area-item">
            <span>{w.topic}</span>
            <span className="weak-area-score">{w.avgScore}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
