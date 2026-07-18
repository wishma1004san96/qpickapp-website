"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Bike,
  Briefcase,
  Bus,
  Car,
  CarFront,
  Check,
  ChevronLeft,
  ChevronRight,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useMessages, useTranslations } from "@/components/i18n/locale-provider";
import {
  TAXI_VEHICLE_IDS,
  TAXI_VEHICLE_META,
  type TaxiVehicleId,
} from "@/lib/taxi-fare-ui";

const EASE = [0.22, 1, 0.36, 1] as const;
/** Approximate card width + gap for arrow navigation */
const SCROLL_STEP = 268;

const VEHICLE_ICONS: Record<TaxiVehicleId, LucideIcon> = {
  bike: Bike,
  tuk: Car,
  miniCar: CarFront,
  wagon: CarFront,
  sedan: CarFront,
  miniVan: Car,
  van: Car,
  longVan: Bus,
  suv: CarFront,
  miniBus: Bus,
  longBus: Bus,
};

export type VehicleSelectionProps = {
  selectedId: TaxiVehicleId | null;
  onSelect: (id: TaxiVehicleId) => void;
  /** Hide section chrome when embedded inside a numbered step */
  embedded?: boolean;
};

/**
 * Premium horizontal vehicle carousel.
 * Cards show icon · name · seats · luggage only — no pricing.
 */
export function VehicleSelection({
  selectedId,
  onSelect,
  embedded = false,
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
      if (delta === 0) return;
      el.scrollLeft += delta;
      event.preventDefault();
    };

    updateArrows();
    el.addEventListener("wheel", onNativeWheel, { passive: false });
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);

    return () => {
      el.removeEventListener("wheel", onNativeWheel);
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollByDir = useCallback(
    (dir: -1 | 1) => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollBy({
        left: dir * SCROLL_STEP,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch") return;
      // Don't start a drag when interacting with a vehicle card / arrow
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-vehicle-id], button")) return;

      const el = scrollerRef.current;
      if (!el) return;
      dragRef.current = {
        active: true,
        startX: event.clientX,
        scrollLeft: el.scrollLeft,
        moved: false,
      };
      el.setPointerCapture(event.pointerId);
      el.classList.add("cursor-grabbing");
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const el = scrollerRef.current;
      const drag = dragRef.current;
      if (!el || !drag.active) return;
      const dx = event.clientX - drag.startX;
      if (Math.abs(dx) > 4) drag.moved = true;
      el.scrollLeft = drag.scrollLeft - dx;
    },
    [],
  );

  const endDrag = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    const drag = dragRef.current;
    if (!el || !drag.active) return;
    drag.active = false;
    el.classList.remove("cursor-grabbing");
    try {
      el.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(
      `[data-vehicle-id="${selectedId}"]`,
    );
    card?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [selectedId, reduceMotion]);

  const handleCardSelect = useCallback(
    (id: TaxiVehicleId) => {
      // Only suppress selection after a real horizontal drag on the track
      if (dragRef.current.active && dragRef.current.moved) {
        dragRef.current.moved = false;
        return;
      }
      dragRef.current.moved = false;
      onSelect(id);
    },
    [onSelect],
  );

  return (
    <section
      aria-labelledby={embedded ? undefined : "vehicle-selection-heading"}
      className={embedded ? "" : "mt-8"}
    >
      {!embedded ? (
        <div className="mb-5 max-w-xl">
          <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-brand uppercase">
            {t("taxiFare.vehicleSelection.eyebrow")}
          </p>
          <h3
            id="vehicle-selection-heading"
            className="mt-2 font-display text-[clamp(1.35rem,2.4vw,1.75rem)] font-semibold tracking-tight text-balance text-ink"
          >
            {t("taxiFare.vehicleSelection.heading")}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-pretty text-ink-muted">
            {t("taxiFare.vehicleSelection.sub")}
          </p>
        </div>
      ) : null}

      <div className="relative">
        {/* Desktop arrows */}
        <button
          type="button"
          aria-label={t("taxiFare.vehicleSelection.prev")}
          disabled={!canPrev}
          onClick={() => scrollByDir(-1)}
          className="absolute top-1/2 -left-1 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ink/8 bg-white/90 text-ink shadow-[0_8px_24px_rgb(10_22_32_/_0.12)] backdrop-blur-md transition-[opacity,transform,box-shadow] duration-300 hover:shadow-[0_12px_28px_rgb(0_98_250_/_0.18)] disabled:pointer-events-none disabled:opacity-0 md:grid lg:-left-2"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={t("taxiFare.vehicleSelection.next")}
          disabled={!canNext}
          onClick={() => scrollByDir(1)}
          className="absolute top-1/2 -right-1 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ink/8 bg-white/90 text-ink shadow-[0_8px_24px_rgb(10_22_32_/_0.12)] backdrop-blur-md transition-[opacity,transform,box-shadow] duration-300 hover:shadow-[0_12px_28px_rgb(0_98_250_/_0.18)] disabled:pointer-events-none disabled:opacity-0 md:grid lg:-right-2"
        >
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>

        <div
          ref={scrollerRef}
          role="radiogroup"
          aria-label={t("taxiFare.steps.vehicleTitle")}
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function VehicleCarouselCard({
  id,
  index,
  selected,
  reduceMotion,
  onSelect,
}: {
  id: TaxiVehicleId;
  index: number;
  selected: boolean;
  reduceMotion: boolean;
  onSelect: (id: TaxiVehicleId) => void;
}) {
  const t = useTranslations();
  const { taxiFare } = useMessages();
  const meta = TAXI_VEHICLE_META[id];
  const Icon = VEHICLE_ICONS[id];
  const name = taxiFare.vehicles[id];

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
              y: -5,
              scale: selected ? 1.035 : 1.025,
              transition: { duration: 0.28, ease: EASE },
            }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      animate={{ scale: selected ? 1.03 : 1 }}
      onClick={() => onSelect(id)}
      className={`group relative flex h-[190px] w-[240px] shrink-0 snap-center flex-col items-center justify-center overflow-visible rounded-[24px] px-4 py-5 text-center outline-none transition-[box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-brand/45 sm:h-[200px] sm:w-[260px] ${
        selected
          ? "shadow-[0_18px_44px_rgb(0_98_250_/_0.26)]"
          : "shadow-[0_12px_32px_rgb(10_22_32_/_0.08)] hover:shadow-[0_16px_40px_rgb(0_98_250_/_0.14)]"
      }`}
    >
      {/* Gradient border */}
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
        {selected ? (
          <motion.span
            initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_6px_14px_rgb(0_98_250_/_0.4)]"
            aria-hidden
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </motion.span>
        ) : null}

        <div className="grid h-14 w-14 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#2b7dff_0%,#0062fa_55%,#0036f9_100%)] shadow-[0_10px_24px_rgb(0_98_250_/_0.32),inset_0_1px_0_rgb(255_255_255_/_0.35)]">
          <Icon className="h-6 w-6 text-paper" strokeWidth={1.7} aria-hidden />
        </div>

        <h4 className="mt-3 font-display text-base font-semibold tracking-tight text-ink sm:text-lg">
          {name}
        </h4>

        <div className="mt-2.5 flex items-center justify-center gap-3 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-brand/70" aria-hidden />
            {t("taxiFare.vehicleSelection.seats", {
              count: meta.passengers,
            })}
          </span>
          <span className="h-3 w-px bg-ink/10" aria-hidden />
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 text-brand/70" aria-hidden />
            {t("taxiFare.vehicleSelection.bags", { count: meta.luggage })}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
