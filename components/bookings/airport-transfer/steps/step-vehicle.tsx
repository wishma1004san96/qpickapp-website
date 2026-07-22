"use client";

import { formatAirportFare } from "@/lib/airport-rates";
import {
  formatDistance,
  formatDuration,
} from "@/lib/airport-destination-scenes";
import { VehicleSelection } from "@/components/marketing/vehicle-selection";
import type { SelectedDestination, VehicleId } from "../types";
import {
  estimateDisplayFare,
  TRANSFER_VEHICLES,
} from "../vehicles";

type StepVehicleProps = {
  destination: SelectedDestination;
  selectedId: VehicleId | null;
  onSelect: (id: VehicleId) => void;
};

export function StepVehicle({
  destination,
  selectedId,
  onSelect,
}: StepVehicleProps) {
  const base = destination.rate.rate;
  const duration = destination.scene.durationMin;
  const distance = destination.scene.distanceKm;
  const vehicleIds = TRANSFER_VEHICLES.map((v) => v.id);
  const priceByVehicleId = Object.fromEntries(
    TRANSFER_VEHICLES.map((v) => [
      v.id,
      formatAirportFare(estimateDisplayFare(base, v.fareFactor)),
    ]),
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 2 of 5
        </p>
        <h2 className="font-display text-[clamp(1.65rem,3.5vw,2.35rem)] font-semibold tracking-tight text-ink">
          Choose your vehicle
        </h2>
        <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink/60">
          To {destination.label} · {formatDistance(distance)} ·{" "}
          {formatDuration(duration)}. Every transfer includes a professional
          chauffeur and climate control.
        </p>
      </header>

      <VehicleSelection
        vehicleIds={vehicleIds}
        selectedId={selectedId}
        onSelect={(id) => onSelect(id as VehicleId)}
        embedded
        layout="grid"
        showEta={false}
        showDayNightBadge={false}
        priceByVehicleId={priceByVehicleId}
      />
    </div>
  );
}
