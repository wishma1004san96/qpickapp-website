"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_CLEAR_DELAY_MS = 120;

/**
 * Single source of truth for the interactive map destination.
 * Keeps active while the pointer is over a marker or the side card.
 */
export function useActiveDestination(
  clearDelayMs = DEFAULT_CLEAR_DELAY_MS,
  selectedSlug: string | null = null,
) {
  const [activeDestination, setActiveDestination] = useState<string | null>(
    selectedSlug,
  );
  const activeRef = useRef<string | null>(selectedSlug);
  const selectedRef = useRef(selectedSlug);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardBridgeRef = useRef(false);

  selectedRef.current = selectedSlug;

  const cancelClear = useCallback(() => {
    if (clearTimerRef.current != null) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  }, []);

  const commitActive = useCallback((next: string | null) => {
    if (activeRef.current === next) return;
    activeRef.current = next;
    setActiveDestination(next);
  }, []);

  const scheduleClear = useCallback(() => {
    cancelClear();
    clearTimerRef.current = setTimeout(() => {
      clearTimerRef.current = null;
      if (!cardBridgeRef.current) {
        commitActive(selectedRef.current);
      }
    }, clearDelayMs);
  }, [cancelClear, clearDelayMs, commitActive]);

  const activate = useCallback(
    (slug: string | null) => {
      cancelClear();
      commitActive(slug);
    },
    [cancelClear, commitActive],
  );

  const onMarkerEnter = useCallback(
    (slug: string) => {
      cancelClear();
      if (activeRef.current === slug) return;
      commitActive(slug);
    },
    [cancelClear, commitActive],
  );

  const onMarkerLeave = useCallback(() => {
    scheduleClear();
  }, [scheduleClear]);

  const onCardEnter = useCallback(() => {
    cardBridgeRef.current = true;
    cancelClear();
  }, [cancelClear]);

  const onCardLeave = useCallback(() => {
    cardBridgeRef.current = false;
    scheduleClear();
  }, [scheduleClear]);

  const reset = useCallback(() => {
    cancelClear();
    cardBridgeRef.current = false;
    commitActive(null);
  }, [cancelClear, commitActive]);

  useEffect(() => () => cancelClear(), [cancelClear]);

  return {
    activeDestination,
    activate,
    onMarkerEnter,
    onMarkerLeave,
    onCardEnter,
    onCardLeave,
    reset,
  };
}
