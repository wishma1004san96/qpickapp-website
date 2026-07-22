"use client";

import { TourMapSyncProvider } from "@/components/tours/tour-map-sync-context";
import type { ReactNode } from "react";

export function PackageDetailJourneySync({ children }: { children: ReactNode }) {
  return <TourMapSyncProvider>{children}</TourMapSyncProvider>;
}
