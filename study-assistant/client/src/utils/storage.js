const KEY = "study-assistant-history";

export function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function loadHistory() {
  let raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // localStorage unavailable (private browsing, disabled, etc.) — degrade gracefully.
    return [];
  }
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("history is not an array");
    return parsed;
  } catch {
    // Corrupted data must not crash the app — reset only this key and continue.
    console.warn("Study Assistant: stored history was corrupted; resetting history only.");
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
    return [];
  }
}

export function saveHistory(history) {
  try {
    localStorage.setItem(KEY, JSON.stringify(history));
    return true;
  } catch {
    return false;
  }
}

export function addHistoryEntry(entry) {
  const history = loadHistory();
  const updated = [entry, ...history].slice(0, 50);
  saveHistory(updated);
  return updated;
}

export function deleteHistoryEntry(id) {
  const updated = loadHistory().filter((h) => h.id !== id);
  saveHistory(updated);
  return updated;
}
