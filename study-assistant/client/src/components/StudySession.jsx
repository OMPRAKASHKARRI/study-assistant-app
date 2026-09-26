import React, { useState, useRef } from "react";
import ModeSelector from "./ModeSelector.jsx";
import LearnMode from "./LearnMode.jsx";
import QuizMode from "./QuizMode.jsx";
import ResultsScreen from "./ResultsScreen.jsx";
import { getWeakQuestions } from "../utils/scoring.js";

const SCREEN = {
  MODE_SELECT: "mode_select",
  LEARN: "learn",
  QUIZ: "quiz",
  RESULTS: "results",
};

export default function StudySession({
  studySet,
  submitAnswer,
  onSaveResult,
  onHome,
  restoredResult, // optional: { answers } from a completed history entry — skips straight to Results
  startMode, // optional: "quiz" — skips straight into Quiz Mode (used by Today's Review)
}) {
  const [screen, setScreen] = useState(
    restoredResult ? SCREEN.RESULTS : startMode === "quiz" ? SCREEN.QUIZ : SCREEN.MODE_SELECT
  );
  const [activeCards, setActiveCards] = useState(studySet.cards);
  const [answers, setAnswers] = useState(restoredResult ? restoredResult.answers : []);
  const [resultsHeading, setResultsHeading] = useState(
    restoredResult ? "📊 Past Results" : "🎉 Study Session Complete"
  );
  // Guards against saving the same completed attempt to history twice
  // (e.g. a re-render firing onFinish's callback more than once).
  const savedRef = useRef(false);

  const startLearn = () => {
    setActiveCards(studySet.cards);
    setScreen(SCREEN.LEARN);
  };

  const startQuiz = (cards, heading) => {
    savedRef.current = false;
    setActiveCards(cards || studySet.cards);
    setAnswers([]);
    setResultsHeading(heading || "🎉 Study Session Complete");
    setScreen(SCREEN.QUIZ);
  };

  const finishQuiz = (finalAnswers) => {
    setAnswers(finalAnswers);
    setScreen(SCREEN.RESULTS);
    if (!savedRef.current) {
      savedRef.current = true;
      onSaveResult(studySet, finalAnswers);
    }
  };

  // Practice Weak Areas must use only the individual questions that were
  // partial or incorrect — never every question from a topic that merely
  // contains one weak question.
  const practiceWeak = () => {
    const weak = getWeakQuestions(answers);
    const weakIds = new Set(weak.map((a) => a.cardId));
    const weakCards = studySet.cards.filter((c) => weakIds.has(c.id));
    startQuiz(weakCards.length > 0 ? weakCards : studySet.cards, "🎯 Practice Complete");
  };

  if (screen === SCREEN.MODE_SELECT) {
    return (
      <ModeSelector
        title={studySet.title}
        cardCount={studySet.cards.length}
        onSelectLearn={startLearn}
        onSelectQuiz={() => startQuiz()}
      />
    );
  }

  if (screen === SCREEN.LEARN) {
    return (
      <LearnMode
        cards={activeCards}
        onFinish={() => setScreen(SCREEN.MODE_SELECT)}
        onBack={() => setScreen(SCREEN.MODE_SELECT)}
      />
    );
  }

  if (screen === SCREEN.QUIZ) {
    return (
      <QuizMode
        cards={activeCards}
        submitAnswer={submitAnswer}
        onFinish={finishQuiz}
        onBack={() => setScreen(SCREEN.MODE_SELECT)}
      />
    );
  }

  return (
    <ResultsScreen
      title={studySet.title}
      heading={resultsHeading}
      answers={answers}
      onRetry={() => startQuiz()}
      onPracticeWeak={practiceWeak}
      onHome={onHome}
    />
  );
}
