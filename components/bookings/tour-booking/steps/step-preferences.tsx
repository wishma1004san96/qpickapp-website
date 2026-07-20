"use client";

import { TOUR_PREFERENCES } from "@/lib/tours/constants";
import type { TourPreferenceId } from "@/lib/tours/types";

type StepPreferencesProps = {
  selected: TourPreferenceId[];
  onChange: (ids: TourPreferenceId[]) => void;
};

export function StepPreferences({ selected, onChange }: StepPreferencesProps) {
  function toggle(id: TourPreferenceId) {
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 4
        </p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Travel style
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          Adventure, luxury, nature, beach, culture, photography, wildlife,
          family, honeymoon, or wellness — pick what shapes the journey.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {TOUR_PREFERENCES.map((pref) => {
          const active = selected.includes(pref.id);
          return (
            <button
              key={pref.id}
              type="button"
              onClick={() => toggle(pref.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-brand bg-brand text-paper"
                  : "border-ink/12 bg-white text-ink hover:border-brand/30"
              }`}
            >
              {pref.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
