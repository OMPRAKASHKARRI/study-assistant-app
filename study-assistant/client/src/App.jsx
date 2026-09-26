import React, { useState, useMemo } from "react";
import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import StudySession from "./components/StudySession.jsx";
import { useTheme } from "./hooks/useTheme.js";
import { useHistory } from "./hooks/useHistory.js";
import { useStudySession } from "./hooks/useStudySession.js";
import { countResults, calculatePercentage, calculateScore, getWeakQuestions } from "./utils/scoring.js";
import { generateId } from "./utils/storage.js";

const SCREEN = { HOME: "home", SESSION: "session" };

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { history, addEntry, removeEntry } = useHistory();
  const { studySet, setStudySet, loading, error, generate, submitAnswer, reset } = useStudySession();
  const [screen, setScreen] = useState(SCREEN.HOME);
  const [restoredResult, setRestoredResult] = useState(null);
  const [startMode, setStartMode] = useState(null);

  const handleGenerate = async (input) => {
    try {
      await generate(input);
      setRestoredResult(null);
      setStartMode(null);
      setScreen(SCREEN.SESSION);
    } catch {
      // error already captured by the hook and shown on Home
    }
  };

  // Open a past session: restore its cards and its saved result (score,
  // breakdown, mistakes) without calling Groq again.
  const handleOpenHistory = (entry) => {
    setStudySet({ title: entry.title, cards: entry.cards });
    setRestoredResult(entry.answers ? { answers: entry.answers } : null);
    setStartMode(null);
    setScreen(SCREEN.SESSION);
  };

  // Retry a past session: reuse its cards for a brand-new attempt —
  // fresh quiz state, no regeneration.
  const handleRetryHistory = (entry) => {
    setStudySet({ title: entry.title, cards: entry.cards });
    setRestoredResult(null);
    setStartMode(null);
    setScreen(SCREEN.SESSION);
  };

  const handleStartTodaysReview = () => {
    if (todaysReviewCards.length === 0) return;
    setStudySet({ title: "Today's Review", cards: todaysReviewCards });
    setRestoredResult(null);
    setStartMode("quiz");
    setScreen(SCREEN.SESSION);
  };

  const handleSaveResult = (set, answers) => {
    const { correct, partial, incorrect } = countResults(answers);
    addEntry({
      id: generateId(),
      title: set.title,
      cards: set.cards,
      answers,
      questionCount: set.cards.length,
      correct,
      partial,
      incorrect,
      score: calculateScore(answers),
      percent: calculatePercentage(answers),
      createdAt: Date.now(),
      date: new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
    });
  };

  const goHome = () => {
    reset();
    setRestoredResult(null);
    setStartMode(null);
    setScreen(SCREEN.HOME);
  };

  // "Today's Review": weak (partial/incorrect) questions from the most
  // recent completed session. No spaced-repetition algorithm — just the
  // latest attempt's mistakes, ready to retry.
  const todaysReviewCards = useMemo(() => {
    const latest = history[0];
    if (!latest || !latest.answers) return [];
    return getWeakQuestions(latest.answers).map((a) => ({
      id: a.cardId,
      question: a.question,
      answer: a.referenceAnswer,
      difficulty: "medium",
      topic: a.topic || "General",
    }));
  }, [history]);

  return (
    <div className="app-shell">
      <Header theme={theme} onToggleTheme={toggleTheme} onHome={goHome} />
      <main className="app-main">
        {screen === SCREEN.HOME && (
          <Home
            onGenerate={handleGenerate}
            loading={loading}
            error={error}
            history={history}
            onOpenHistory={handleOpenHistory}
            onRetryHistory={handleRetryHistory}
            onDeleteHistory={removeEntry}
            todaysReviewCount={todaysReviewCards.length}
            onStartTodaysReview={handleStartTodaysReview}
          />
        )}
        {screen === SCREEN.SESSION && studySet && (
          <StudySession
            studySet={studySet}
            submitAnswer={submitAnswer}
            onSaveResult={handleSaveResult}
            onHome={goHome}
            restoredResult={restoredResult}
            startMode={startMode}
          />
        )}
      </main>
    </div>
  );
}
