"use client";

import dynamic from "next/dynamic";
import type { FixedCenterMapProps } from "@/components/maps/map-types";

export const FixedCenterMapDynamic = dynamic(
  () =>
    import("@/components/maps/FixedCenterMap").then((m) => m.FixedCenterMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[18rem] w-full items-center justify-center bg-[#e8eef3] text-sm text-ink-muted">
        Loading map…
      </div>
    ),
  },
);

export type { FixedCenterMapProps };
