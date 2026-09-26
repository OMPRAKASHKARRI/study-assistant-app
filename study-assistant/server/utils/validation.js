import { randomUUID } from "node:crypto";

// ---- Input validation ----

export function validateStudyInput(input) {
  if (input === undefined || input === null) {
    return { valid: false, error: "Please enter some notes or a topic." };
  }
  if (typeof input !== "string") {
    return { valid: false, error: "Input must be text." };
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Please enter some notes or a topic." };
  }
  if (input.length > 10000) {
    return { valid: false, error: "Input must be 10,000 characters or fewer." };
  }
  return { valid: true, value: trimmed };
}

const DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const VERDICTS = new Set(["correct", "partial", "incorrect"]);

const UNEXPECTED_AI_RESPONSE = "AI returned an unexpected response. Please try again.";

// ---- AI output schema validation: /api/generate-flashcards ----
// STRICT: we never "repair" bad AI output (e.g. coercing an invalid
// difficulty into "medium"). Anything that doesn't match the schema
// exactly is rejected with a safe, generic error.
export function validateFlashcardSet(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { valid: false, error: UNEXPECTED_AI_RESPONSE };
  }
  if (typeof data.title !== "string" || data.title.trim().length === 0) {
    return { valid: false, error: UNEXPECTED_AI_RESPONSE };
  }
  if (!Array.isArray(data.cards) || data.cards.length === 0) {
    return { valid: false, error: UNEXPECTED_AI_RESPONSE };
  }

  const cards = [];
  const seenIds = new Set();

  for (const raw of data.cards) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { valid: false, error: UNEXPECTED_AI_RESPONSE };
    }
    const { id, question, answer, difficulty, topic } = raw;

    if (typeof question !== "string" || question.trim().length === 0) {
      return { valid: false, error: UNEXPECTED_AI_RESPONSE };
    }
    if (typeof answer !== "string" || answer.trim().length === 0) {
      return { valid: false, error: UNEXPECTED_AI_RESPONSE };
    }
    // Difficulty must be one of the three allowed values — reject, never coerce.
    if (!DIFFICULTIES.has(difficulty)) {
      return { valid: false, error: UNEXPECTED_AI_RESPONSE };
    }
    // Topic is genuinely optional per spec — safe to default an absent one;
    // this is filling an optional field, not repairing invalid data.
    let safeTopic = "General";
    if (topic !== undefined && topic !== null) {
      if (typeof topic !== "string") {
        return { valid: false, error: UNEXPECTED_AI_RESPONSE };
      }
      if (topic.trim().length > 0) safeTopic = topic.trim();
    }

    let cardId = typeof id === "string" && id.trim().length > 0 ? id.trim() : randomUUID();
    if (seenIds.has(cardId)) cardId = randomUUID();
    seenIds.add(cardId);

    cards.push({
      id: cardId,
      question: question.trim(),
      answer: answer.trim(),
      difficulty,
      topic: safeTopic,
    });
  }

  return { valid: true, value: { title: data.title.trim(), cards } };
}

// ---- AI output schema validation: /api/evaluate-answer ----
export function validateEvaluation(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { valid: false, error: UNEXPECTED_AI_RESPONSE };
  }
  if (!VERDICTS.has(data.verdict)) {
    return { valid: false, error: UNEXPECTED_AI_RESPONSE };
  }
  if (typeof data.score !== "number" || Number.isNaN(data.score) || data.score < 0 || data.score > 100) {
    return { valid: false, error: UNEXPECTED_AI_RESPONSE };
  }
  if (typeof data.feedback !== "string" || data.feedback.trim().length === 0) {
    return { valid: false, error: UNEXPECTED_AI_RESPONSE };
  }

  return {
    valid: true,
    value: {
      verdict: data.verdict,
      score: Math.round(data.score),
      feedback: data.feedback.trim(),
    },
  };
}

// Strip ```json ... ``` or ``` ... ``` fences some models still add
// even when asked for a raw JSON response.
export function stripCodeFences(text) {
  if (typeof text !== "string") return text;
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

export function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(stripCodeFences(text)) };
  } catch {
    return { ok: false, error: "AI returned a response we couldn't read. Please try again." };
  }
}
