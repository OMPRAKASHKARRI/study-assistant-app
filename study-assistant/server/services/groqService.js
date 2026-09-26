import Groq from "groq-sdk";

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set on the server.");
    }
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

const FLASHCARD_SYSTEM_PROMPT = `You are a study-set generator. Given study material or a topic, produce a JSON object and NOTHING else — no markdown, no code fences, no commentary.

Schema:
{
  "title": string,
  "cards": [
    {
      "id": string,
      "question": string,
      "answer": string,
      "difficulty": "easy" | "medium" | "hard",
      "topic": string
    }
  ]
}

Rules:
- Generate between 5 and 10 cards.
- Cover different concepts from the material; do not generate repetitive questions.
- Answers must be concise but useful (1-3 sentences).
- Each card needs a unique id.
- difficulty MUST be exactly one of: "easy", "medium", "hard" — no other values.
- Return ONLY the JSON object.`;

const EVALUATION_SYSTEM_PROMPT = `You are grading a student's typed answer against a reference answer. Return a JSON object and NOTHING else — no markdown, no code fences, no commentary.

Schema:
{
  "verdict": "correct" | "partial" | "incorrect",
  "score": number (0-100),
  "feedback": string
}

Rules:
- Judge on meaning, not exact wording. Tolerate different phrasing, minor
  grammar mistakes, and capitalization differences.
- "correct": captures the key idea(s) accurately, even if worded differently.
- "partial": captures some of the idea but misses or misstates an essential part.
- "incorrect": wrong, off-topic, or empty.
- verdict MUST be exactly one of: "correct", "partial", "incorrect".
- feedback: 1-2 short, encouraging sentences explaining the verdict, and what
  was missing if not fully correct.
- Return ONLY the JSON object.`;

// signal: an AbortSignal from the caller (route handler), used to cancel
// the underlying HTTP request to Groq when a request times out or a
// newer request supersedes this one.
async function callGroqJSON(systemPrompt, userPrompt, signal) {
  const groq = getClient();
  const completion = await groq.chat.completions.create(
    {
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    },
    { signal }
  );

  const text = completion?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response from AI model.");
  }
  return text;
}

export async function generateFlashcardsRaw(input, signal) {
  return callGroqJSON(
    FLASHCARD_SYSTEM_PROMPT,
    `Generate a study set from this material:\n\n${input}`,
    signal
  );
}

export async function evaluateAnswerRaw({ question, referenceAnswer, userAnswer }, signal) {
  return callGroqJSON(
    EVALUATION_SYSTEM_PROMPT,
    `Question: ${question}\nReference answer: ${referenceAnswer}\nStudent's answer: ${userAnswer}`,
    signal
  );
}
