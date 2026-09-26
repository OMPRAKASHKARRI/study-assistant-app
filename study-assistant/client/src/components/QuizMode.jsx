import React, { useState, useRef, useEffect, useCallback } from "react";
import ProgressBar from "./ProgressBar.jsx";
import QuestionCard from "./QuestionCard.jsx";
import AnswerInput from "./AnswerInput.jsx";
import EvaluationResult from "./EvaluationResult.jsx";
import LoadingState from "./LoadingState.jsx";

// phase machine: editing -> evaluating -> evaluated
//                                      \-> error -> (retry -> evaluating) | (edit -> editing)
export default function QuizMode({ cards, submitAnswer, onFinish, onBack }) {
  const [index, setIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [phase, setPhase] = useState("editing");
  const [evaluation, setEvaluation] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [validationMessage, setValidationMessage] = useState(null);
  const [answers, setAnswers] = useState([]);

  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const textareaRef = useRef(null);

  const card = cards[index];
  const isLast = index + 1 >= cards.length;

  // Abort any in-flight evaluation on unmount so a late response can never
  // land after the component is gone.
  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const runEvaluation = useCallback(
    async (textToEvaluate) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const requestId = ++requestIdRef.current;
      const questionIndexAtSubmit = index;

      setPhase("evaluating");
      setErrorMessage(null);

      try {
        const result = await submitAnswer(
          { question: card.question, referenceAnswer: card.answer, userAnswer: textToEvaluate },
          { signal: controller.signal }
        );
        // Stale-response guard: ignore if a newer evaluation started, or the
        // user has since moved to a different question.
        if (requestId !== requestIdRef.current || questionIndexAtSubmit !== index) return;
        setEvaluation(result);
        setPhase("evaluated");
        setAnswers((prev) => [
          ...prev,
          {
            cardId: card.id,
            question: card.question,
            referenceAnswer: card.answer,
            userAnswer: textToEvaluate,
            topic: card.topic,
            ...result,
          },
        ]);
      } catch (err) {
        if (err.cancelled || requestId !== requestIdRef.current || questionIndexAtSubmit !== index) return;
        setPhase("error");
        setErrorMessage(err.message || "Failed to evaluate your answer.");
      }
    },
    [card, index, submitAnswer]
  );

  const handleSubmit = (text) => {
    if (text.trim().length === 0) {
      setValidationMessage("Please enter an answer before submitting.");
      textareaRef.current?.focus();
      return;
    }
    setValidationMessage(null);
    setAnswerText(text);
    runEvaluation(text);
  };

  const handleRetry = () => {
    runEvaluation(answerText);
  };

  const handleEditAnswer = () => {
    setPhase("editing");
    setErrorMessage(null);
  };

  const goToNextQuestion = () => {
    controllerRef.current?.abort();
    setEvaluation(null);
    setPhase("editing");
    setErrorMessage(null);
    setValidationMessage(null);
    setAnswerText("");
    if (isLast) {
      onFinish(answers);
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <div className="quiz-mode">
      <ProgressBar current={index + 1} total={cards.length} />
      <QuestionCard card={card} />

      {(phase === "editing" || phase === "evaluating") && (
        <AnswerInput
          value={answerText}
          onChange={setAnswerText}
          onSubmit={handleSubmit}
          disabled={phase === "evaluating"}
          validationMessage={validationMessage}
          textareaRef={textareaRef}
        />
      )}

      {phase === "evaluating" && <LoadingState message="Evaluating your answer..." />}

      {phase === "error" && (
        <div className="eval-error-box" role="alert">
          <p className="preserved-answer-label">Your answer:</p>
          <p className="preserved-answer-text">{answerText}</p>
          <p className="error-message">{errorMessage}</p>
          <p className="eval-error-note">Your answer is still saved.</p>
          <div className="eval-error-actions">
            <button className="btn btn-primary" onClick={handleRetry}>
              Retry Evaluation
            </button>
            <button className="btn btn-secondary" onClick={handleEditAnswer}>
              Edit Answer
            </button>
          </div>
        </div>
      )}

      {phase === "evaluated" && evaluation && (
        <EvaluationResult
          evaluation={evaluation}
          referenceAnswer={card.answer}
          onNext={goToNextQuestion}
          isLast={isLast}
        />
      )}

      <button className="btn btn-ghost quiz-back" onClick={onBack}>
        Back to Modes
      </button>
    </div>
  );
}
