import { NormalizedContentItem } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SessionState = {
  running: boolean;
  paused: boolean;
  currentIndex: number;
  currentDhikr?: NormalizedContentItem;
  elapsedMs: number;
  totalDhikrCount: number; // number of adhkar items in session
  totalRepetitions: number; // sum of reps
  completedCount: number; // number of dhikr items fully completed
};

export function useDhikrSession(items: NormalizedContentItem[]) {
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const intervalRef = useRef<any>(null);

  const totalRepetitions = useMemo(
    () => items.reduce((s, it) => s + (it.repetitions ?? 1), 0),
    [items],
  );

  const start = useCallback(() => {
    setRunning(true);
    setPaused(false);
    startedAtRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      if (!paused && startedAtRef.current) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 500);
  }, [paused]);

  const pause = useCallback(() => {
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    setPaused(false);
  }, []);

  const stop = useCallback(() => {
    setRunning(false);
    setPaused(false);
    setIndex(0);
    setCompletedCount(0);
    startedAtRef.current = null;
    setElapsedMs(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const currentDhikr = items[index];

  const next = useCallback(() => {
    setIndex((i) => {
      const ni = i + 1;
      if (ni >= items.length) {
        setRunning(false);
        return i;
      }
      return ni;
    });
  }, [items.length]);

  // Called when a dhikr is completed (i.e., its repetition reached)
  const handleItemComplete = useCallback(() => {
    setCompletedCount((c) => c + 1);
    // auto move to next after a brief delay
    setTimeout(() => {
      setIndex((i) => {
        const ni = i + 1;
        if (ni >= items.length) {
          setRunning(false);
          return i;
        }
        return ni;
      });
    }, 300);
  }, [items.length]);

  return {
    state: {
      running,
      paused,
      currentIndex: index,
      currentDhikr,
      elapsedMs,
      totalDhikrCount: items.length,
      totalRepetitions,
      completedCount,
    } as SessionState,
    actions: { start, pause, resume, stop, next, handleItemComplete },
  };
}
