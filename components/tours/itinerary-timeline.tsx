import type { TourItineraryDay } from "@/lib/tours/types";

type ItineraryTimelineProps = {
  itinerary: TourItineraryDay[];
  className?: string;
};

export function ItineraryTimeline({
  itinerary,
  className = "",
}: ItineraryTimelineProps) {
  return (
    <ol className={`space-y-0 ${className}`}>
      {itinerary.map((day, index) => (
        <li key={day.day} className="relative flex gap-4 pb-8 last:pb-0">
          {index < itinerary.length - 1 ? (
            <span
              className="absolute top-10 bottom-0 left-[1.15rem] w-px bg-ink/12"
              aria-hidden
            />
          ) : null}
          <span className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-paper shadow-[0_8px_20px_rgb(0_98_250_/_0.3)]">
            {day.day}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
              Day {day.day}: {day.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/60">
              {day.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
