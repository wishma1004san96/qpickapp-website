"use client";

import dynamic from "next/dynamic";
import type { SriLankaTourMapProps } from "@/components/tours/maps/sri-lanka-tour-map";

export const SriLankaTourMapDynamic = dynamic(
  () =>
    import("@/components/tours/maps/sri-lanka-tour-map").then(
      (m) => m.SriLankaTourMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(68vh,560px)] min-h-[320px] w-full items-center justify-center rounded-[1.25rem] border border-ink/8 bg-[#e8eef3] text-sm text-ink/45">
        Loading Sri Lanka map…
      </div>
    ),
  },
);

export type { SriLankaTourMapProps };
