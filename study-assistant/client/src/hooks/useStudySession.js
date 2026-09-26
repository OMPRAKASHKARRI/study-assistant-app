import { useState, useCallback, useRef, useEffect } from "react";
import { generateFlashcards, evaluateAnswer } from "../services/api.js";

export function useStudySession() {
  const [studySet, setStudySet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);

  // Cancel any in-flight generation if the app unmounts mid-request.
  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const generate = useCallback(async (input) => {
    // Newest request always wins: cancel whatever was in flight before
    // starting a new one, and tag this call with a fresh request id so
    // a late-arriving old response can never overwrite newer state.
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const data = await generateFlashcards(input, { signal: controller.signal });
      if (requestId !== requestIdRef.current) return null; // superseded — ignore
      setStudySet(data);
      setLoading(false);
      return data;
    } catch (err) {
      if (err.cancelled || requestId !== requestIdRef.current) return null; // superseded — ignore
      setError(err.message || "Failed to generate study set.");
      setLoading(false);
      throw err;
    }
  }, []);

  const submitAnswer = useCallback(({ question, referenceAnswer, userAnswer }, opts) => {
    return evaluateAnswer({ question, referenceAnswer, userAnswer }, opts);
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setStudySet(null);
    setError(null);
    setLoading(false);
  }, []);

  return { studySet, setStudySet, loading, error, generate, submitAnswer, reset };
}
