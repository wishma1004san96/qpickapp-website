"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslations } from "@/components/i18n/locale-provider";
import { formatLkr } from "@/lib/taxi-fare";
import type { DrivingRouteEstimate } from "@/lib/osm/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export type RouteSelectionProps = {
  routes: DrivingRouteEstimate[];
  selectedRouteId: string | null;
  onSelect: (id: string) => void;
  /** Estimated fare per route id (from pricing catalog) */
  fareByRouteId: Record<string, number | null>;
  /** Hide entirely when fewer than 2 routes */
  embedded?: boolean;
};

/**
 * Premium alternative route cards — horizontal swipe on mobile,
 * horizontal row on desktop. Hidden when only one route exists.
 */
export function RouteSelection({
  routes,
  selectedRouteId,
  onSelect,
  fareByRouteId,
  embedded = false,
}: RouteSelectionProps) {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;

  if (routes.length < 2) return null;

  return (
    <section
      aria-labelledby={embedded ? undefined : "route-selection-heading"}
      className={embedded ? "" : "mt-5"}
    >
      {!embedded ? (
        <div className="mb-3">
          <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-brand uppercase">
            {t("taxiFare.routes.eyebrow")}
          </p>
          <h3
            id="route-selection-heading"
            className="mt-1 font-display text-[clamp(1.15rem,2vw,1.35rem)] font-semibold tracking-tight text-ink"
          >
            {t("taxiFare.routes.heading")}
          </h3>
        </div>
      ) : (
        <p className="mb-3 text-sm font-medium text-ink">
          {t("taxiFare.routes.heading")}
        </p>
      )}

      <div
        role="radiogroup"
        aria-label={t("taxiFare.routes.heading")}
        className="qpick-route-carousel flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-4"
      >
        {routes.map((route, index) => {
          const id = route.id ?? `route-${index}`;
          const selected = selectedRouteId === id;
          const fare = fareByRouteId[id];
          const badge = route.isRecommended
            ? t("taxiFare.routes.recommended")
            : t("taxiFare.routes.alternative");
          const tag = resolveTagLabel(t, route.tagKey);
          const roadLabel =
            route.roadType === "highway"
              ? t("taxiFare.routes.roadHighway")
              : t("taxiFare.routes.roadNormal");

          return (
            <motion.button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(id)}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.32,
                delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.16),
                ease: EASE,
              }}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -3, transition: { duration: 0.22, ease: EASE } }
              }
              className={`group relative flex w-[min(72vw,15.5rem)] shrink-0 snap-center flex-col overflow-hidden rounded-[1.25rem] px-4 py-4 text-left outline-none transition-[box-shadow,transform] duration-300 focus-visible:ring-2 focus-visible:ring-brand/45 sm:w-[15.75rem] ${
                selected
                  ? "shadow-[0_16px_40px_rgb(37_99_235_/_0.28)]"
                  : "shadow-[0_10px_28px_rgb(10_22_32_/_0.08)] hover:shadow-[0_14px_32px_rgb(37_99_235_/_0.14)]"
              }`}
            >
              <span
                className={`pointer-events-none absolute inset-0 rounded-[1.25rem] p-[1.5px] ${
                  selected
                    ? "bg-[linear-gradient(145deg,#0193fb_0%,#2563EB_48%,#0036f9_100%)]"
                    : "bg-[linear-gradient(145deg,rgb(255_255_255_/_0.9)_0%,rgb(37_99_235_/_0.14)_55%,rgb(10_22_32_/_0.08)_100%)]"
                }`}
                aria-hidden
              >
                <span className="block h-full w-full rounded-[1.15rem] bg-[linear-gradient(165deg,#ffffff_0%,#f4f8fc_100%)]" />
              </span>

              <span className="relative z-[1] flex flex-col gap-2.5">
                <span className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide uppercase ${
                      route.isRecommended
                        ? "bg-[#2563EB]/10 text-[#2563EB]"
                        : "bg-ink/[0.06] text-ink-muted"
                    }`}
                  >
                    {route.isRecommended ? (
                      <Star
                        className="h-3 w-3 fill-current"
                        aria-hidden
                      />
                    ) : null}
                    {badge}
                  </span>
                  <span className="text-[0.6875rem] font-medium text-ink-muted">
                    {roadLabel}
                  </span>
                </span>

                <span className="font-display text-[1.35rem] font-semibold tracking-tight text-ink">
                  {route.distanceText}
                </span>

                <span className="text-sm text-ink-muted">
                  {route.durationText}
                </span>

                <span className="font-display text-[1.15rem] font-semibold tracking-tight text-[#2563EB]">
                  {fare != null && Number.isFinite(fare)
                    ? formatLkr(fare)
                    : "—"}
                </span>

                <span className="text-xs font-medium text-ink/70">
                  {tag}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

function resolveTagLabel(
  t: (key: string, values?: Record<string, string | number>) => string,
  tagKey: string | undefined,
): string {
  switch (tagKey) {
    case "fastest":
      return t("taxiFare.routes.tags.fastest");
    case "avoidHighway":
      return t("taxiFare.routes.tags.avoidHighway");
    case "highway":
      return t("taxiFare.routes.tags.highway");
    case "scenic":
      return t("taxiFare.routes.tags.scenic");
    default:
      return t("taxiFare.routes.tags.alternative");
  }
}
