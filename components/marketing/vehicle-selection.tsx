"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useMessages, useTranslations } from "@/components/i18n/locale-provider";
import { vehiclePhotoSrc } from "@/components/icons/vehicles";
import farePricingCatalog from "@/data/fare-pricing.json";
import { resolveTimeOfDay } from "@/lib/fare/time-of-day";
import {
  formatLkr,
  TAXI_VEHICLE_IDS,
  TAXI_VEHICLE_META,
  type TaxiVehicleId,
} from "@/lib/taxi-fare-ui";

const EASE = [0.22, 1, 0.36, 1] as const;
const SCROLL_STEP = 268;

export type VehicleSelectionProps = {
  selectedId: TaxiVehicleId | null;
  onSelect: (id: TaxiVehicleId) => void;
  embedded?: boolean;
  tripDurationSeconds?: number;
  at?: Date | string | number;
  fareByVehicleId?: Partial<Record<TaxiVehicleId, number | null>>;
};

function ratesForVehicle(id: TaxiVehicleId, at?: Date | string | number) {
  const catalog = farePricingCatalog.vehicles[id];
  const period = resolveTimeOfDay(at);
  if (!catalog) {
    return { baseFare: 0, perKm: 0, period };
  }
  if (period === "night") {
    return {
      baseFare: catalog.nightBaseFare,
      perKm: catalog.nightPerKmRate,
      period,
    };
  }
  return {
    baseFare: catalog.dayBaseFare,
    perKm: catalog.dayPerKmRate,
    period,
  };
}

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

/**
 * Premium horizontal vehicle carousel — price-first cards.
 */
export function VehicleSelection({
  selectedId,
  onSelect,
  embedded = false,
  tripDurationSeconds,
  at,
  fareByVehicleId,
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
  }, [updateArrows]);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * SCROLL_STEP, behavior: "smooth" });
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
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
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const handleCardSelect = (id: TaxiVehicleId) => {
    if (dragRef.current.moved) return;
    onSelect(id);
  };

  const inner = (
    <div className="relative">
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
        className="qpick-vehicle-carousel flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-2 py-4 md:px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TAXI_VEHICLE_IDS.map((id, index) => (
          <VehicleCarouselCard
            key={id}
            id={id}
            index={index}
            selected={selectedId === id}
            reduceMotion={reduceMotion}
            onSelect={handleCardSelect}
            etaMinutes={estimateArrivalMinutes(tripDurationSeconds, index)}
            rates={ratesForVehicle(id, at)}
            estimatedFareLkr={fareByVehicleId?.[id] ?? null}
          />
        ))}
      </div>
    </div>
  );

  if (embedded) return inner;

  return (
    <section className="space-y-3">
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

function VehicleCarouselCard({
  id,
  index,
  selected,
  reduceMotion,
  onSelect,
  etaMinutes,
  rates,
  estimatedFareLkr,
}: {
  id: TaxiVehicleId;
  index: number;
  selected: boolean;
  reduceMotion: boolean;
  onSelect: (id: TaxiVehicleId) => void;
  etaMinutes: number;
  rates: { baseFare: number; perKm: number; period: "day" | "night" };
  estimatedFareLkr: number | null;
}) {
  const t = useTranslations();
  const { taxiFare } = useMessages();
  const meta = TAXI_VEHICLE_META[id];
  const name = taxiFare.vehicles[id];
  const hasEstimate =
    estimatedFareLkr != null && Number.isFinite(estimatedFareLkr);

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      data-vehicle-id={id}
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{
        duration: 0.35,
        delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.25),
        ease: EASE,
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -4,
              scale: selected ? 1.03 : 1.02,
              transition: { duration: 0.28, ease: EASE },
            }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      animate={{
        scale: selected ? 1.025 : 1,
        y: selected && !reduceMotion ? -2 : 0,
      }}
      onClick={() => onSelect(id)}
      className={`group relative flex h-[248px] w-[220px] shrink-0 snap-center flex-col items-center justify-start overflow-visible rounded-[24px] px-3.5 py-3.5 text-center outline-none transition-[box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-brand/45 sm:h-[256px] sm:w-[236px] ${
        selected
          ? "shadow-[0_18px_44px_rgb(0_98_250_/_0.26)]"
          : "shadow-[0_12px_32px_rgb(10_22_32_/_0.08)] hover:shadow-[0_16px_40px_rgb(0_98_250_/_0.14)]"
      }`}
    >
      <span
        className={`pointer-events-none absolute inset-0 rounded-[24px] p-[1.5px] ${
          selected
            ? "bg-[linear-gradient(145deg,#0193fb_0%,#0062fa_48%,#0036f9_100%)]"
            : "bg-[linear-gradient(145deg,rgb(255_255_255_/_0.85)_0%,rgb(0_98_250_/_0.16)_52%,rgb(10_22_32_/_0.08)_100%)]"
        }`}
        aria-hidden
      >
        <span className="block h-full w-full rounded-[22.5px] bg-[linear-gradient(165deg,rgb(255_255_255_/_0.94)_0%,rgb(238_244_251_/_0.86)_100%)] backdrop-blur-xl" />
      </span>

      {selected ? (
        <span
          className="pointer-events-none absolute -top-6 left-1/2 h-24 w-32 -translate-x-1/2 rounded-full bg-brand/28 blur-3xl"
          aria-hidden
        />
      ) : null}

      <div className="relative z-[1] flex w-full flex-col items-center">
        <span
          className={`absolute top-0 left-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold tracking-wide ${
            rates.period === "night"
              ? "bg-ink/90 text-foam"
              : "bg-brand/12 text-brand"
          }`}
        >
          {rates.period === "night" ? (
            <Moon className="h-3 w-3" aria-hidden />
          ) : (
            <Sun className="h-3 w-3" aria-hidden />
          )}
          {rates.period === "night"
            ? t("taxiFare.vehicleSelection.night")
            : t("taxiFare.vehicleSelection.day")}
        </span>

        <div className="mt-6 flex h-[4.5rem] w-full items-center justify-center">
          <Image
            src={vehiclePhotoSrc(id) ?? "/images/fleet/vehicles/sedan.webp"}
            alt={name}
            width={160}
            height={96}
            className="h-full w-auto max-w-[9.5rem] object-contain"
            sizes="160px"
          />
        </div>

        <h4 className="mt-2.5 font-display text-[0.95rem] font-semibold tracking-tight text-ink sm:text-base">
          {name}
        </h4>

        <AnimateFare
          hasEstimate={hasEstimate}
          amount={estimatedFareLkr}
          reduceMotion={reduceMotion}
          selected={selected}
        />

        <div className="mt-2 flex w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[0.6875rem] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3 text-brand/70" aria-hidden />
            {etaMinutes} min
          </span>
          <span className="h-3 w-px bg-ink/10" aria-hidden />
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3 text-brand/70" aria-hidden />
            {meta.passengers}
          </span>
          <span className="h-3 w-px bg-ink/10" aria-hidden />
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-3 w-3 text-brand/70" aria-hidden />
            {meta.luggage}
          </span>
        </div>

        {selected ? (
          <p className="mt-1.5 text-[0.625rem] font-semibold text-brand">
            ✓ {t("taxiFare.vehicleSelection.selected")}
          </p>
        ) : null}
      </div>
    </motion.button>
  );
}

function AnimateFare({
  hasEstimate,
  amount,
  reduceMotion,
  selected,
}: {
  hasEstimate: boolean;
  amount: number | null;
  reduceMotion: boolean;
  selected: boolean;
}) {
  return (
    <motion.p
      key={hasEstimate ? String(amount) : "pending"}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE }}
      className={`mt-1 font-display text-lg font-semibold tracking-tight sm:text-xl ${
        selected ? "text-brand" : "text-ink"
      }`}
    >
      {hasEstimate && amount != null ? formatLkr(amount) : "—"}
    </motion.p>
  );
}
