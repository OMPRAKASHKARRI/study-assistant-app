const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
const DEFAULT_TIMEOUT_MS = 30000;

// Combines an internal timeout with an optional caller-supplied AbortSignal
// (used for stale-request cancellation — e.g. a newer generation request
// superseding an older one, or a quiz question changing mid-evaluation).
function withTimeout(ms, externalSignal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  const onExternalAbort = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", onExternalAbort, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      if (externalSignal) externalSignal.removeEventListener("abort", onExternalAbort);
    },
  };
}

function statusMessage(status, serverMessage) {
  if (serverMessage) return serverMessage;
  if (status === 401) return "AI service authentication failed.";
  if (status === 429) return "The AI service is temporarily busy. Please try again shortly.";
  if (status >= 500) return "AI service error. Please try again.";
  return "Something went wrong. Please try again.";
}

async function post(path, body, { signal: externalSignal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const { signal, cleanup } = withTimeout(timeoutMs, externalSignal);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    cleanup();
    if (err.name === "AbortError") {
      if (externalSignal?.aborted) {
        // Superseded by a newer request, or the caller intentionally cancelled —
        // this is not a user-facing error.
        const cancelled = new Error("Request cancelled.");
        cancelled.cancelled = true;
        throw cancelled;
      }
      const timeoutErr = new Error("The request took too long. Please try again.");
      timeoutErr.timeout = true;
      throw timeoutErr;
    }
    const networkErr = new Error("Unable to connect to the server.");
    networkErr.network = true;
    throw networkErr;
  }
  cleanup();

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Server returned an unreadable response.");
  }

  if (!res.ok) {
    throw new Error(statusMessage(res.status, data?.error));
  }
  return data;
}

export function generateFlashcards(input, opts) {
  return post("/generate-flashcards", { input }, opts);
}

export function evaluateAnswer({ question, referenceAnswer, userAnswer }, opts) {
  return post("/evaluate-answer", { question, referenceAnswer, userAnswer }, opts);
}
