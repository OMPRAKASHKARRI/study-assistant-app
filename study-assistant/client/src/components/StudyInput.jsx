import React, { useState } from "react";
import { validateStudyInput } from "../utils/validation.js";

const MAX = 10000;

export default function StudyInput({ onGenerate, loading }) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return; // guard against double-submit
    const check = validateStudyInput(text);
    if (!check.valid) {
      setError(check.error);
      return;
    }
    setError(null);
    onGenerate(text.trim());
  };

  return (
    <form className="study-input-card" onSubmit={handleSubmit}>
      <h2>Create New Study Session</h2>
      <label className="visually-hidden" htmlFor="study-textarea">
        Notes or topic to study
      </label>
      <textarea
        id="study-textarea"
        className="study-textarea"
        placeholder="Paste your notes, textbook excerpts, lecture notes, or enter a topic you want to study..."
        value={text}
        maxLength={MAX}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        rows={8}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? "study-input-error" : undefined}
      />
      <div className="input-footer">
        <span className={`char-counter ${text.length > MAX ? "over" : ""}`}>
          {text.length} / {MAX}
        </span>
        <button className="btn btn-primary" type="submit" disabled={loading} aria-busy={loading}>
          {loading ? "Generating..." : "Generate Study Session"}
        </button>
      </div>
      {error && (
        <p id="study-input-error" className="field-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
