// Central scoring utilities — every component that needs a score,
// percentage, or "which questions were weak" number goes through these
// instead of recomputing it locally.

export function countResults(answers) {
  return {
    correct: answers.filter((a) => a.verdict === "correct").length,
    partial: answers.filter((a) => a.verdict === "partial").length,
    incorrect: answers.filter((a) => a.verdict === "incorrect").length,
  };
}

export function calculateScore(answers) {
  return answers.reduce((sum, a) => sum + (typeof a.score === "number" ? a.score : 0), 0);
}

export function calculatePercentage(answers) {
  if (answers.length === 0) return 0;
  return Math.round(calculateScore(answers) / answers.length);
}

// "Weak" questions are exactly the ones that were NOT fully correct —
// partial or incorrect. Practice Weak Areas and Review Mistakes must use
// this precise set, never every question from a topic that merely
// contains one weak question.
export function getWeakQuestions(answers) {
  return answers.filter((a) => a.verdict === "partial" || a.verdict === "incorrect");
}

// Topic-level rollup — informational only (the "Weak Areas by topic" panel).
// A topic is flagged when its average score across answered questions
// in that topic falls below 70%.
export function getWeakTopics(answers) {
  const stats = {};
  for (const a of answers) {
    const topic = a.topic || "General";
    if (!stats[topic]) stats[topic] = { total: 0, score: 0 };
    stats[topic].total += 1;
    stats[topic].score += typeof a.score === "number" ? a.score : 0;
  }
  return Object.entries(stats)
    .map(([topic, s]) => ({ topic, avgScore: Math.round(s.score / s.total) }))
    .filter((t) => t.avgScore < 70)
    .sort((a, b) => a.avgScore - b.avgScore);
}

export function computeResults(answers) {
  const counts = countResults(answers);
  const percent = calculatePercentage(answers);
  return {
    total: answers.length,
    ...counts,
    avgScore: percent,
    percent,
    weakAreas: getWeakTopics(answers),
    weakQuestions: getWeakQuestions(answers),
  };
}
