import { useState, useCallback } from "react";
import { loadHistory, addHistoryEntry, deleteHistoryEntry } from "../utils/storage.js";

export function useHistory() {
  const [history, setHistory] = useState(() => loadHistory());

  const addEntry = useCallback((entry) => {
    setHistory(addHistoryEntry(entry));
  }, []);

  const removeEntry = useCallback((id) => {
    setHistory(deleteHistoryEntry(id));
  }, []);

  return { history, addEntry, removeEntry };
}
