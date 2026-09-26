import express from "express";
import { generateFlashcardsRaw, evaluateAnswerRaw } from "../services/groqService.js";
import {
  validateStudyInput,
  validateFlashcardSet,
  validateEvaluation,
  safeJsonParse,
} from "../utils/validation.js";
import { classifyGroqError } from "../utils/errors.js";

const router = express.Router();

const REQUEST_TIMEOUT_MS = 30000;

// Runs fn(signal) with a hard timeout: aborts the underlying request via
// the AbortController and rejects with an AbortError-shaped error so
// classifyGroqError can turn it into a friendly 504.
async function withTimeout(fn, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

// POST /api/generate-flashcards
router.post("/generate-flashcards", async (req, res) => {
  const inputCheck = validateStudyInput(req.body?.input);
  if (!inputCheck.valid) {
    return res.status(400).json({ error: inputCheck.error });
  }

  try {
    const raw = await withTimeout(
      (signal) => generateFlashcardsRaw(inputCheck.value, signal),
      REQUEST_TIMEOUT_MS
    );

    const parsed = safeJsonParse(raw);
    if (!parsed.ok) {
      return res.status(502).json({ error: parsed.error });
    }
    const validated = validateFlashcardSet(parsed.value);
    if (!validated.valid) {
      return res.status(502).json({ error: validated.error });
    }
    return res.json(validated.value);
  } catch (err) {
    console.error("generate-flashcards error:", err);
    const { status, message } = classifyGroqError(err, "generate");
    return res.status(status).json({ error: message });
  }
});

// POST /api/evaluate-answer
router.post("/evaluate-answer", async (req, res) => {
  const { question, referenceAnswer, userAnswer } = req.body || {};

  if (typeof question !== "string" || question.trim().length === 0) {
    return res.status(400).json({ error: "Missing question." });
  }
  if (typeof referenceAnswer !== "string" || referenceAnswer.trim().length === 0) {
    return res.status(400).json({ error: "Missing reference answer." });
  }
  if (typeof userAnswer !== "string" || userAnswer.trim().length === 0) {
    return res.status(400).json({ error: "Please enter an answer before submitting." });
  }

  try {
    const raw = await withTimeout(
      (signal) => evaluateAnswerRaw({ question, referenceAnswer, userAnswer }, signal),
      REQUEST_TIMEOUT_MS
    );

    const parsed = safeJsonParse(raw);
    if (!parsed.ok) {
      return res.status(502).json({ error: parsed.error });
    }
    const validated = validateEvaluation(parsed.value);
    if (!validated.valid) {
      return res.status(502).json({ error: validated.error });
    }
    return res.json(validated.value);
  } catch (err) {
    console.error("evaluate-answer error:", err);
    const { status, message } = classifyGroqError(err, "evaluate");
    return res.status(status).json({ error: message });
  }
});

export default router;
