"use client";

import { addDaysISO } from "@/lib/tours/mappers";
import { useTranslations } from "@/components/i18n/locale-provider";

type StepDatesProps = {
  startDate: string;
  numberOfDays: number;
  onChange: (patch: { startDate?: string; numberOfDays?: number }) => void;
};

export function StepDates({ startDate, numberOfDays, onChange }: StepDatesProps) {
  const t = useTranslations();
  const endDate = addDaysISO(startDate, numberOfDays);

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          {t("tourBooking.steps.dates.kicker")}
        </p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          {t("tourBooking.steps.dates.title")}
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          {t("tourBooking.steps.dates.subtitle")}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium tracking-wide text-ink/50 uppercase">
            {t("tourBooking.steps.dates.startDate")}
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="mt-2 w-full rounded-[14px] border border-ink/10 bg-white px-3.5 py-3 text-sm outline-none focus:border-brand/35 focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium tracking-wide text-ink/50 uppercase">
            {t("tourBooking.steps.dates.numberOfDays")}
          </span>
          <input
            type="number"
            min={1}
            max={30}
            value={numberOfDays}
            onChange={(e) =>
              onChange({
                numberOfDays: Math.min(
                  30,
                  Math.max(1, Number(e.target.value) || 1),
                ),
              })
            }
            className="mt-2 w-full rounded-[14px] border border-ink/10 bg-white px-3.5 py-3 text-sm outline-none focus:border-brand/35 focus:ring-2 focus:ring-brand/20"
          />
        </label>
      </div>

      <p className="rounded-[1.15rem] border border-ink/8 bg-foam px-4 py-3 text-sm text-ink/60">
        {t("tourBooking.steps.dates.estimatedEnd")}{" "}
        <span className="font-semibold text-ink">{endDate || "—"}</span>
      </p>
    </div>
  );
}
