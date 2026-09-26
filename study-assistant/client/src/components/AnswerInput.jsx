import React from "react";

// Fully controlled — the parent (QuizMode) owns the answer text so it can
// preserve it across evaluation failures, retries, and edits.
export default function AnswerInput({ value, onChange, onSubmit, disabled, validationMessage, textareaRef }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <form className="answer-form" onSubmit={handleSubmit}>
      <label className="visually-hidden" htmlFor="answer-textarea">
        Your answer
      </label>
      <textarea
        id="answer-textarea"
        ref={textareaRef}
        className="answer-textarea"
        placeholder="Type your answer..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={4}
        aria-invalid={validationMessage ? "true" : "false"}
        aria-describedby={validationMessage ? "answer-validation-error" : undefined}
      />
      {validationMessage && (
        <p id="answer-validation-error" className="field-error" role="alert">
          {validationMessage}
        </p>
      )}
      <button className="btn btn-primary" type="submit" disabled={disabled}>
        {disabled ? "Evaluating..." : "Submit Answer"}
      </button>
    </form>
  );
}
