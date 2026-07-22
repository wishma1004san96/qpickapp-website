"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Briefcase,
  Clock,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useMessages, useTranslations } from "@/components/i18n/locale-provider";
import {
  DEFAULT_FLEET_PHOTO_SRC,
  FLEET_VEHICLE_CAPACITY,
  fleetCapacityForTaxiId,
  fleetVehicleNameKey,
  vehiclePhotoSrc,
} from "@/components/icons/vehicles";
import { resolveVehicleIconId } from "@/components/icons/vehicles/types";
import farePricingCatalog from "@/data/fare-pricing.json";
import { resolveTimeOfDay } from "@/lib/fare/time-of-day";
import { formatLkr, TAXI_VEHICLE_META, type TaxiVehicleId } from "@/lib/taxi-fare-ui";

const EASE = [0.22, 1, 0.36, 1] as const;

function ratesForVehicle(id: string, at?: Date | string | number) {
  const catalog = farePricingCatalog.vehicles[id as TaxiVehicleId];
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

function capacityForId(id: string) {
  const taxiMeta = TAXI_VEHICLE_META[id as TaxiVehicleId];
  if (taxiMeta) {
    return { passengers: taxiMeta.passengers, luggage: taxiMeta.luggage };
  }
  const iconId = resolveVehicleIconId(id);
  if (iconId) {
    return FLEET_VEHICLE_CAPACITY[iconId];
  }
  return fleetCapacityForTaxiId("sedan");
}

export type VehicleCarouselCardProps = {
  id: string;
  index?: number;
  selected?: boolean;
  reduceMotion?: boolean;
  onSelect?: (id: string) => void;
  /** Numeric fare — formatted as LKR (Ride booking) */
  estimatedFareLkr?: number | null;
  /** Text price line — tours, transfers, quotes */
  priceLabel?: string | null;
  etaMinutes?: number;
  showEta?: boolean;
  showDayNightBadge?: boolean;
  at?: Date | string | number;
  name?: string;
  passengers?: number;
  luggage?: number;
  subtitle?: string;
  /** Non-interactive preview (summary, sticky card, journey) */
  displayOnly?: boolean;
  disabled?: boolean;
  fluid?: boolean;
  className?: string;
};

/**
 * Canonical Q Pick vehicle card — same layout as the Ride booking flow.
 */
export function VehicleCarouselCard({
  id,
  index = 0,
  selected = false,
  reduceMotion: reduceMotionProp,
  onSelect,
  estimatedFareLkr = null,
  priceLabel,
  etaMinutes = 8,
  showEta = true,
  showDayNightBadge = true,
  at,
  name: nameOverride,
  passengers: passengersOverride,
  luggage: luggageOverride,
  subtitle,
  displayOnly = false,
  disabled = false,
  fluid = false,
  className = "",
}: VehicleCarouselCardProps) {
  const t = useTranslations();
  const { taxiFare } = useMessages();
  const reduceMotionHook = useReducedMotion() ?? false;
  const reduceMotion = reduceMotionProp ?? reduceMotionHook;

  const fleetNameKey = fleetVehicleNameKey(id);
  const name =
    nameOverride ??
    (fleetNameKey ? t(fleetNameKey) : taxiFare.vehicles[id as TaxiVehicleId] ?? id);
  const capacity = capacityForId(id);
  const passengers = passengersOverride ?? capacity.passengers;
  const luggage = luggageOverride ?? capacity.luggage;
  const rates = ratesForVehicle(id, at);
  const hasEstimate =
    estimatedFareLkr != null && Number.isFinite(estimatedFareLkr);
  const hasPriceLabel = Boolean(priceLabel?.trim());
  const imageId = resolveVehicleIconId(id) ?? id;

  const widthClass = fluid
    ? "h-[248px] w-full max-w-none sm:h-[256px]"
    : "h-[248px] w-[220px] shrink-0 snap-center sm:h-[256px] sm:w-[236px]";

  const cardBody = (
  <>
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
        {showDayNightBadge ? (
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
        ) : null}

        <div className="mt-6 flex h-[4.5rem] w-full items-center justify-center">
          <Image
            src={vehiclePhotoSrc(imageId) ?? vehiclePhotoSrc(id) ?? DEFAULT_FLEET_PHOTO_SRC}
            alt={name}
            width={160}
            height={96}
            unoptimized
            className="h-full w-auto max-w-[9.5rem] object-contain"
            sizes="160px"
          />
        </div>

        <h4 className="mt-2.5 font-display text-[0.95rem] font-semibold tracking-tight text-ink sm:text-base">
          {name}
        </h4>

        {subtitle ? (
          <p className="mt-1 line-clamp-2 px-1 text-[0.6875rem] leading-snug text-ink-muted">
            {subtitle}
          </p>
        ) : null}

        {hasPriceLabel ? (
          <p
            className={`mt-1 font-display text-lg font-semibold tracking-tight sm:text-xl ${
              selected ? "text-brand" : "text-ink"
            }`}
          >
            {priceLabel}
          </p>
        ) : (
          <AnimateFare
            hasEstimate={hasEstimate}
            amount={estimatedFareLkr}
            reduceMotion={reduceMotion}
            selected={selected}
          />
        )}

        <div className="mt-2 flex w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[0.6875rem] text-ink-muted">
          {showEta ? (
            <>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 text-brand/70" aria-hidden />
                {etaMinutes} min
              </span>
              <span className="h-3 w-px bg-ink/10" aria-hidden />
            </>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3 text-brand/70" aria-hidden />
            {passengers}
          </span>
          <span className="h-3 w-px bg-ink/10" aria-hidden />
          <span className="inline-flex items-center gap-1">
            <Briefcase className="h-3 w-3 text-brand/70" aria-hidden />
            {luggage}
          </span>
        </div>

        {selected && !displayOnly ? (
          <p className="mt-1.5 text-[0.625rem] font-semibold text-brand">
            ✓ {t("taxiFare.vehicleSelection.selected")}
          </p>
        ) : null}
      </div>
  </>
  );

  const frameClass = `group relative flex flex-col items-center justify-start overflow-visible rounded-[24px] px-3.5 py-3.5 text-center outline-none transition-[box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-brand/45 ${widthClass} ${
    selected
      ? "shadow-[0_18px_44px_rgb(0_98_250_/_0.26)]"
      : "shadow-[0_12px_32px_rgb(10_22_32_/_0.08)] hover:shadow-[0_16px_40px_rgb(0_98_250_/_0.14)]"
  } ${disabled ? "pointer-events-none opacity-45 saturate-50" : ""} ${className}`;

  if (displayOnly) {
    return (
      <div className={frameClass} aria-label={name}>
        {cardBody}
      </div>
    );
  }

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
      onClick={() => onSelect?.(id)}
      disabled={disabled}
      className={frameClass}
    >
      {cardBody}
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
