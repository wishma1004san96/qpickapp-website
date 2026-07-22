"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type TourMapSyncContextValue = {
  activeStopId: string | null;
  activeDay: number | null;
  setActiveStop: (stopId: string | null, day?: number | null) => void;
  setActiveDay: (day: number | null, stopId?: string | null) => void;
  clearActive: () => void;
};

const TourMapSyncContext = createContext<TourMapSyncContextValue | null>(null);

export function TourMapSyncProvider({ children }: { children: ReactNode }) {
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [activeDay, setActiveDayState] = useState<number | null>(null);

  const setActiveStop = useCallback(
    (stopId: string | null, day: number | null = null) => {
      setActiveStopId(stopId);
      setActiveDayState(day);
    },
    [],
  );

  const setActiveDay = useCallback(
    (day: number | null, stopId: string | null = null) => {
      setActiveDayState(day);
      if (stopId != null) setActiveStopId(stopId);
    },
    [],
  );

  const clearActive = useCallback(() => {
    setActiveStopId(null);
    setActiveDayState(null);
  }, []);

  const value = useMemo(
    () => ({
      activeStopId,
      activeDay,
      setActiveStop,
      setActiveDay,
      clearActive,
    }),
    [activeStopId, activeDay, setActiveStop, setActiveDay, clearActive],
  );

  return (
    <TourMapSyncContext.Provider value={value}>
      {children}
    </TourMapSyncContext.Provider>
  );
}

export function useTourMapSync() {
  return useContext(TourMapSyncContext);
}
