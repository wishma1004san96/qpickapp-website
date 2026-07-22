"use client";

import type { TourVehicle } from "@/lib/tours/types";
import { formatTourPriceLkr } from "@/lib/tours/pricing-display";
import { VehicleCarouselCard } from "@/components/marketing/vehicle-carousel-card";

type VehicleCardProps = {
  vehicle: TourVehicle;
  selected?: boolean;
  onSelect?: (id: TourVehicle["id"]) => void;
  disabled?: boolean;
  className?: string;
  experience?: boolean;
  index?: number;
};

/** Tour vehicle card — uses the Ride booking VehicleCarouselCard. */
export function VehicleCard({
  vehicle,
  selected = false,
  onSelect,
  disabled = false,
  className = "",
  experience = false,
  index = 0,
}: VehicleCardProps) {
  const fleetId = vehicle.fleetIconId ?? vehicle.id;
  const price =
    vehicle.dayRateHintLkr != null
      ? formatTourPriceLkr(vehicle.dayRateHintLkr)
      : null;

  return (
    <VehicleCarouselCard
      id={fleetId}
      index={index}
      selected={selected}
      onSelect={onSelect ? () => onSelect(vehicle.id) : undefined}
      disabled={disabled}
      name={vehicle.name}
      passengers={vehicle.passengers}
      luggage={vehicle.luggage}
      subtitle={experience ? vehicle.tagline : undefined}
      priceLabel={price}
      showEta={false}
      showDayNightBadge={false}
      fluid
      className={className}
    />
  );
}
