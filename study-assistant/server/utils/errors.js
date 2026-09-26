// Maps a thrown error (from the Groq SDK, our own timeout abort, or
// anything unexpected) to a safe HTTP status + user-facing message.
// Never leaks stack traces, file paths, or the API key.
export function classifyGroqError(err, context) {
  const isEvaluate = context === "evaluate";

  if (err && (err.name === "AbortError" || err.isTimeout)) {
    return {
      status: 504,
      message: isEvaluate
        ? "Evaluation took too long. Your answer is still saved."
        : "The request took too long. Please try again.",
    };
  }

  const status = err?.status || err?.response?.status || err?.statusCode;

  if (status === 401 || status === 403) {
    return { status: 401, message: "AI service authentication failed." };
  }
  if (status === 429) {
    return { status: 429, message: "The AI service is temporarily busy. Please try again shortly." };
  }
  if (typeof status === "number" && status >= 500) {
    return { status: 502, message: "AI service error. Please try again." };
  }

  return {
    status: 502,
    message: isEvaluate
      ? "We couldn't evaluate that answer right now. Please try again."
      : "We couldn't generate a study set right now. Please try again.",
  };
}
