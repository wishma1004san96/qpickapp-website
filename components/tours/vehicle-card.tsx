"use client";

import Image from "next/image";
import { Check, Wifi, Zap } from "lucide-react";
import type { TourVehicle } from "@/lib/tours/types";
import { formatTourPriceLkr } from "@/lib/tours/pricing-display";

type VehicleCardProps = {
  vehicle: TourVehicle;
  selected?: boolean;
  onSelect?: (id: TourVehicle["id"]) => void;
  className?: string;
  experience?: boolean;
};

export function VehicleCard({
  vehicle,
  selected = false,
  onSelect,
  className = "",
  experience = false,
}: VehicleCardProps) {
  const interactive = Boolean(onSelect);

  const body = (
    <>
      <div className="relative h-32 bg-gradient-to-b from-[#eef3f8] to-[#e4ebf2] sm:h-36">
        <Image
          src={vehicle.imageSrc}
          alt={vehicle.imageAlt}
          fill
          loading="lazy"
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          sizes="280px"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-base font-semibold text-ink">
              {vehicle.name}
            </p>
            <p className="mt-0.5 text-xs text-ink/50">{vehicle.tagline}</p>
          </div>
          {selected ? (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-paper">
              <Check className="h-3.5 w-3.5" aria-hidden />
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-ink/55">
          {vehicle.passengers} passengers · {vehicle.luggage} bags
          {vehicle.ac ? " · A/C" : ""}
        </p>
        {experience ? (
          <>
            <div className="mt-3 flex flex-wrap gap-2 text-[0.6875rem] text-ink/50">
              {vehicle.wifi ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-foam px-2 py-1">
                  <Wifi className="h-3 w-3" aria-hidden /> Wi‑Fi
                </span>
              ) : null}
              {vehicle.chargingPorts ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-foam px-2 py-1">
                  <Zap className="h-3 w-3" aria-hidden /> Charging
                </span>
              ) : null}
            </div>
            <ul className="mt-3 flex flex-wrap gap-1">
              {vehicle.recommendedTourTypes.slice(0, 3).map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-ink/8 px-2 py-0.5 text-[0.625rem] text-ink/45"
                >
                  {t}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <p className="mt-3 font-mono text-sm font-semibold text-brand-deep">
          {formatTourPriceLkr(vehicle.dayRateHintLkr)}
          {vehicle.dayRateHintLkr != null ? (
            <span className="font-sans text-xs font-normal text-ink/40"> / day</span>
          ) : null}
        </p>
      </div>
    </>
  );

  const frameClass = `group w-full overflow-hidden rounded-[1.25rem] border text-left transition-[border-color,box-shadow,transform] ${
    selected
      ? "border-brand ring-2 ring-brand/25 shadow-[0_16px_40px_rgb(0_98_250_/_0.18)]"
      : "border-ink/8 bg-white/80 shadow-[0_8px_24px_rgb(10_22_32_/_0.05)] hover:border-brand/25 hover:-translate-y-0.5"
  } ${className}`;

  if (!interactive) {
    return <div className={frameClass}>{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(vehicle.id)}
      className={`${frameClass} cursor-pointer`}
    >
      {body}
    </button>
  );
}
