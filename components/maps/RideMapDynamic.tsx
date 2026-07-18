"use client";

import dynamic from "next/dynamic";
import type { RideMapProps } from "@/components/maps/RideMap";

export const RideMapDynamic = dynamic(
  () => import("@/components/maps/RideMap").then((m) => m.RideMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[14rem] w-full items-center justify-center rounded-[1.15rem] border border-ink/8 bg-[#e8eef3] text-sm text-ink-muted sm:h-[16.5rem] lg:h-[19rem]">
        Loading map…
      </div>
    ),
  },
);

export type { RideMapProps };
