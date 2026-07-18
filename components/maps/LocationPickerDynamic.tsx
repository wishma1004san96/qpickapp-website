"use client";

import dynamic from "next/dynamic";
import type { LocationPickerProps } from "@/components/maps/map-types";

/**
 * Client-only location picker — Leaflet must never evaluate on the server.
 */
export const LocationPickerDynamic = dynamic(
  () =>
    import("@/components/maps/LocationPicker").then((m) => m.LocationPicker),
  { ssr: false },
);

export type { LocationPickerProps };
