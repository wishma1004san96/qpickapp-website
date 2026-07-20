"use client";

import { TOUR_ACCOMMODATIONS } from "@/lib/tours/constants";
import type { TourAccommodationId } from "@/lib/tours/types";

type StepAccommodationProps = {
  selected: TourAccommodationId | null;
  onSelect: (id: TourAccommodationId) => void;
};

export function StepAccommodation({
  selected,
  onSelect,
}: StepAccommodationProps) {
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 5
        </p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Accommodation preference
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          Hotels are arranged separately — share your preference so we can advise.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {TOUR_ACCOMMODATIONS.map((item) => {
          const active = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`rounded-[1.15rem] border px-4 py-4 text-left text-sm font-semibold transition-colors ${
                active
                  ? "border-brand bg-brand/[0.06] text-ink ring-2 ring-brand/20"
                  : "border-ink/10 bg-white text-ink hover:border-brand/25"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
