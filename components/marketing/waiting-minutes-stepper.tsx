"use client";

import { Minus, Plus } from "lucide-react";

type WaitingMinutesStepperProps = {
  id: string;
  label: string;
  hint?: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
};

/**
 * Compact waiting-time control — keeps the estimator's existing field styling.
 */
export function WaitingMinutesStepper({
  id,
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 180,
}: WaitingMinutesStepperProps) {
  const clamped = Math.min(max, Math.max(min, Math.round(value)));

  const bump = (delta: number) => {
    onChange(Math.min(max, Math.max(min, clamped + delta)));
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink"
      >
        {label}
      </label>
      <div className="inline-flex items-center gap-2 rounded-[0.9rem] border border-ink/10 bg-white/70 p-1 shadow-[0_1px_0_rgb(255_255_255_/_0.8)] backdrop-blur-md">
        <button
          type="button"
          aria-label="Decrease waiting time"
          disabled={clamped <= min}
          onClick={() => bump(-1)}
          className="grid h-10 w-10 place-items-center rounded-[0.7rem] text-ink transition-[background,opacity] hover:bg-brand/[0.08] disabled:opacity-35"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={clamped}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10);
            if (!Number.isFinite(n)) {
              onChange(min);
              return;
            }
            onChange(Math.min(max, Math.max(min, n)));
          }}
          className="h-10 w-14 border-0 bg-transparent text-center text-sm font-semibold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label="Increase waiting time"
          disabled={clamped >= max}
          onClick={() => bump(1)}
          className="grid h-10 w-10 place-items-center rounded-[0.7rem] text-ink transition-[background,opacity] hover:bg-brand/[0.08] disabled:opacity-35"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {hint ? <p className="mt-2 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
