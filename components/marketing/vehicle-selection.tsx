"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useTranslations } from "@/components/i18n/locale-provider";
import { VehicleCarouselCard } from "@/components/marketing/vehicle-carousel-card";
import { TAXI_VEHICLE_IDS } from "@/lib/taxi-fare-ui";

const SCROLL_STEP = 268;

export type { VehicleCarouselCardProps } from "@/components/marketing/vehicle-carousel-card";
export { VehicleCarouselCard } from "@/components/marketing/vehicle-carousel-card";

function estimateArrivalMinutes(
  tripDurationSeconds: number | undefined,
  index: number,
): number {
  const tripMin =
    tripDurationSeconds != null && tripDurationSeconds > 0
      ? tripDurationSeconds / 60
      : 20;
  return Math.max(3, Math.min(18, Math.round(4 + index * 0.4 + tripMin * 0.08)));
}

export type VehicleSelectionProps = {
  vehicleIds?: readonly string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  embedded?: boolean;
  tripDurationSeconds?: number;
  at?: Date | string | number;
  fareByVehicleId?: Partial<Record<string, number | null>>;
  priceByVehicleId?: Partial<Record<string, string | null>>;
  showEta?: boolean;
  showDayNightBadge?: boolean;
  layout?: "carousel" | "grid";
};

/**
 * Premium vehicle picker — horizontal carousel (ride) or responsive grid (tours/transfers).
 */
export function VehicleSelection({
  vehicleIds = TAXI_VEHICLE_IDS,
  selectedId,
  onSelect,
  embedded = false,
  tripDurationSeconds,
  at,
  fareByVehicleId,
  priceByVehicleId,
  showEta = true,
  showDayNightBadge = true,
  layout = "carousel",
}: VehicleSelectionProps) {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    scrollLeft: number;
    moved: boolean;
  }>({ active: false, startX: 0, scrollLeft: 0, moved: false });

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    if (layout !== "carousel") return;
    const el = scrollerRef.current;
    if (!el) return;

    const onNativeWheel = (event: WheelEvent) => {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (Math.abs(delta) < 1) return;
      if (el.scrollWidth <= el.clientWidth) return;
      event.preventDefault();
      el.scrollLeft += delta;
      updateArrows();
    };

    el.addEventListener("wheel", onNativeWheel, { passive: false });
    el.addEventListener("scroll", updateArrows, { passive: true });
    updateArrows();
    return () => {
      el.removeEventListener("wheel", onNativeWheel);
      el.removeEventListener("scroll", updateArrows);
    };
  }, [updateArrows, layout]);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * SCROLL_STEP, behavior: "smooth" });
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    if ((e.target as HTMLElement).closest("[data-vehicle-id]")) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const el = scrollerRef.current;
    const drag = dragRef.current;
    if (!el || !drag.active) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 6) drag.moved = true;
    el.scrollLeft = drag.scrollLeft - dx;
  };

  const endDrag = (e: ReactPointerEvent) => {
    const el = scrollerRef.current;
    const drag = dragRef.current;
    if (!el || !drag.active) return;
    drag.active = false;
    drag.moved = false;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    updateArrows();
  };

  const handleCardSelect = (id: string) => {
    if (dragRef.current.moved) return;
    onSelect(id);
  };

  const renderCard = (id: string, index: number, fluid: boolean) => (
    <VehicleCarouselCard
      key={id}
      id={id}
      index={index}
      selected={selectedId === id}
      reduceMotion={reduceMotion}
      onSelect={handleCardSelect}
      etaMinutes={estimateArrivalMinutes(tripDurationSeconds, index)}
      estimatedFareLkr={fareByVehicleId?.[id] ?? null}
      priceLabel={priceByVehicleId?.[id] ?? null}
      showEta={showEta}
      showDayNightBadge={showDayNightBadge}
      at={at}
      fluid={fluid}
    />
  );

  const grid = (
    <div
      className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      role="radiogroup"
      aria-label={t("taxiFare.vehicleSelection.heading")}
    >
      {vehicleIds.map((id, index) => renderCard(id, index, true))}
    </div>
  );

  const mobileStack = (
    <div
      className="grid w-full min-w-0 grid-cols-1 gap-4 sm:hidden"
      role="radiogroup"
      aria-label={t("taxiFare.vehicleSelection.heading")}
    >
      {vehicleIds.map((id, index) => renderCard(id, index, true))}
    </div>
  );

  const desktopCarousel = (
    <div className="relative hidden min-w-0 sm:block">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] flex items-center pl-0.5">
        <button
          type="button"
          aria-label={t("taxiFare.vehicleSelection.prev")}
          disabled={!canPrev}
          onClick={() => scrollByDir(-1)}
          className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-white/90 text-ink shadow-sm transition-opacity disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] flex items-center pr-0.5">
        <button
          type="button"
          aria-label={t("taxiFare.vehicleSelection.next")}
          disabled={!canNext}
          onClick={() => scrollByDir(1)}
          className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-white/90 text-ink shadow-sm transition-opacity disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="qpick-vehicle-carousel flex w-full min-w-0 cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-2 py-4 md:px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {vehicleIds.map((id, index) => renderCard(id, index, false))}
      </div>
    </div>
  );

  const carousel = (
    <div className="min-w-0 w-full overflow-hidden">
      {mobileStack}
      {desktopCarousel}
    </div>
  );

  const inner = layout === "grid" ? grid : carousel;

  if (embedded) return inner;

  return (
    <section className="min-w-0 space-y-3">
      <div>
        <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-brand uppercase">
          {t("taxiFare.vehicleSelection.eyebrow")}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold text-ink">
          {t("taxiFare.vehicleSelection.heading")}
        </h3>
      </div>
      {inner}
    </section>
  );
}
