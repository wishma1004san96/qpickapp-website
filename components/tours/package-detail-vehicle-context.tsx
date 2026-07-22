"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TourVehicle, TourVehicleId } from "@/lib/tours/types";

type PackageDetailVehicleContextValue = {
  vehicles: TourVehicle[];
  selectedVehicleId: TourVehicleId;
  selectedVehicle: TourVehicle;
  recommendedVehicleId: TourVehicleId;
  selectVehicle: (id: TourVehicleId) => void;
  isVehicleSelectable: (id: TourVehicleId) => boolean;
};

const PackageDetailVehicleContext =
  createContext<PackageDetailVehicleContextValue | null>(null);

type PackageDetailVehicleProviderProps = {
  children: ReactNode;
  vehicles: TourVehicle[];
  initialVehicleId: TourVehicleId;
  recommendedVehicleId: TourVehicleId;
  supportedVehicleIds?: TourVehicleId[];
};

export function PackageDetailVehicleProvider({
  children,
  vehicles,
  initialVehicleId,
  recommendedVehicleId,
  supportedVehicleIds,
}: PackageDetailVehicleProviderProps) {
  const selectableIds = useMemo(
    () => supportedVehicleIds ?? vehicles.map((v) => v.id),
    [supportedVehicleIds, vehicles],
  );

  const resolveInitial = useCallback(
    (id: TourVehicleId) =>
      selectableIds.includes(id) ? id : (selectableIds[0] ?? id),
    [selectableIds],
  );

  const [selectedVehicleId, setSelectedVehicleId] = useState<TourVehicleId>(
    () => resolveInitial(initialVehicleId),
  );

  const selectedVehicle = useMemo(() => {
    const match = vehicles.find((v) => v.id === selectedVehicleId);
    if (match) return match;
    const fallback = vehicles.find((v) => v.id === resolveInitial(initialVehicleId));
    return fallback ?? vehicles[0];
  }, [vehicles, selectedVehicleId, initialVehicleId, resolveInitial]);

  const selectVehicle = useCallback(
    (id: TourVehicleId) => {
      if (selectableIds.includes(id)) {
        setSelectedVehicleId(id);
      }
    },
    [selectableIds],
  );

  const isVehicleSelectable = useCallback(
    (id: TourVehicleId) => selectableIds.includes(id),
    [selectableIds],
  );

  const value = useMemo(
    () => ({
      vehicles,
      selectedVehicleId: selectedVehicle?.id ?? selectedVehicleId,
      selectedVehicle,
      recommendedVehicleId,
      selectVehicle,
      isVehicleSelectable,
    }),
    [
      vehicles,
      selectedVehicle,
      selectedVehicleId,
      recommendedVehicleId,
      selectVehicle,
      isVehicleSelectable,
    ],
  );

  return (
    <PackageDetailVehicleContext.Provider value={value}>
      {children}
    </PackageDetailVehicleContext.Provider>
  );
}

export function usePackageDetailVehicle() {
  const ctx = useContext(PackageDetailVehicleContext);
  if (!ctx) {
    throw new Error(
      "usePackageDetailVehicle must be used within PackageDetailVehicleProvider",
    );
  }
  return ctx;
}
