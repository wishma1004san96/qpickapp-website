import { Check, X } from "lucide-react";
import { TourSectionHeader } from "@/components/tours/package-detail-ui";

type IncludedExcludedProps = {
  included: string[];
  excluded: string[];
  className?: string;
};

export function IncludedExcluded({
  included,
  excluded,
  className = "",
}: IncludedExcludedProps) {
  return (
    <section className={className} aria-label="Included and excluded">
      <TourSectionHeader
        eyebrow="What's included"
        title="Included & excluded"
      />
      <div className="tour-detail-grid tour-detail-grid--2 tour-detail-stack">
        <div className="tour-detail-card flex h-full flex-col p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Check className="h-4 w-4" aria-hidden />
            </span>
            Included
          </h3>
          <ul className="mt-4 space-y-2.5">
            {included.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-sm leading-[1.65] text-ink/70"
              >
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="tour-detail-card flex h-full flex-col p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/6 text-ink/45">
              <X className="h-4 w-4" aria-hidden />
            </span>
            Excluded
          </h3>
          <ul className="mt-4 space-y-2.5">
            {excluded.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-sm leading-[1.65] text-ink/62"
              >
                <X
                  className="mt-0.5 h-4 w-4 shrink-0 text-ink/30"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
