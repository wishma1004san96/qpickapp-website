"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const DEFAULT_CLEAR_DELAY_MS = 120;

type BridgeZone = "card" | "tooltip";

/**
 * Hover preview with delayed clear — keeps active while the pointer is over
 * the map marker, map tooltip, or destination card.
 */
export function useHoverBridge(clearDelayMs = DEFAULT_CLEAR_DELAY_MS) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bridgeZonesRef = useRef<Record<BridgeZone, boolean>>({
    card: false,
    tooltip: false,
  });

  const isBridgeActive = useCallback(
    () => bridgeZonesRef.current.card || bridgeZonesRef.current.tooltip,
    [],
  );

  const cancelClear = useCallback(() => {
    if (clearTimerRef.current != null) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  }, []);

  const scheduleClear = useCallback(() => {
    cancelClear();
    clearTimerRef.current = setTimeout(() => {
      clearTimerRef.current = null;
      if (!isBridgeActive()) {
        setHoveredId(null);
      }
    }, clearDelayMs);
  }, [cancelClear, clearDelayMs, isBridgeActive]);

  const setBridgeZone = useCallback(
    (zone: BridgeZone, active: boolean) => {
      bridgeZonesRef.current[zone] = active;
      if (active) {
        cancelClear();
      } else {
        scheduleClear();
      }
    },
    [cancelClear, scheduleClear],
  );

  const onHoverStart = useCallback(
    (id: string) => {
      cancelClear();
      setHoveredId(id);
    },
    [cancelClear],
  );

  const onHoverEnd = useCallback(() => {
    scheduleClear();
  }, [scheduleClear]);

  const onCardEnter = useCallback(() => {
    setBridgeZone("card", true);
  }, [setBridgeZone]);

  const onCardLeave = useCallback(() => {
    setBridgeZone("card", false);
  }, [setBridgeZone]);

  const onTooltipEnter = useCallback(() => {
    setBridgeZone("tooltip", true);
  }, [setBridgeZone]);

  const onTooltipLeave = useCallback(() => {
    setBridgeZone("tooltip", false);
  }, [setBridgeZone]);

  const reset = useCallback(() => {
    cancelClear();
    bridgeZonesRef.current = { card: false, tooltip: false };
    setHoveredId(null);
  }, [cancelClear]);

  useEffect(() => () => cancelClear(), [cancelClear]);

  return {
    hoveredId,
    onHoverStart,
    onHoverEnd,
    onCardEnter,
    onCardLeave,
    onTooltipEnter,
    onTooltipLeave,
    reset,
    /** @deprecated use onCardEnter */
    onBridgeEnter: onCardEnter,
    /** @deprecated use onCardLeave */
    onBridgeLeave: onCardLeave,
  };
}
