"use client";

import { VehicleCard } from "@/components/tours/vehicle-card";
import type { TourVehicle, TourVehicleId } from "@/lib/tours/types";

type StepVehicleTourProps = {
  vehicles: TourVehicle[];
  selected: TourVehicleId | null;
  passengers: number;
  onSelect: (id: TourVehicleId) => void;
  onPassengersChange: (count: number) => void;
};

export function StepVehicleTour({
  vehicles,
  selected,
  passengers,
  onSelect,
  onPassengersChange,
}: StepVehicleTourProps) {
  const selectedVehicle = vehicles.find((v) => v.id === selected);

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 3
        </p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Choose your vehicle
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          Luxury private vehicles with air conditioning — sized for passengers
          and luggage.
        </p>
      </header>

      <label className="block max-w-xs">
        <span className="text-xs font-medium tracking-wide text-ink/50 uppercase">
          Passenger count
        </span>
        <input
          type="number"
          min={1}
          max={20}
          value={passengers}
          onChange={(e) =>
            onPassengersChange(
              Math.min(20, Math.max(1, Number(e.target.value) || 1)),
            )
          }
          className="mt-2 w-full rounded-[14px] border border-ink/10 bg-white px-3.5 py-3 text-sm outline-none focus:border-brand/35 focus:ring-2 focus:ring-brand/20"
        />
        {selectedVehicle ? (
          <p className="mt-2 text-xs text-ink/45">
            {selectedVehicle.name} seats up to {selectedVehicle.passengers}{" "}
            passengers with {selectedVehicle.luggage} bags
            {selectedVehicle.ac ? " and A/C" : ""}.
          </p>
        ) : null}
      </label>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            selected={selected === vehicle.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
