"use client";

import { QPICK_VEHICLE_ICON_IDS } from "@/components/icons/vehicles/types";
import { VehicleSelection } from "@/components/marketing/vehicle-selection";
import {
  FLEET_VEHICLE_CAPACITY,
} from "@/components/icons/vehicles/fleet-catalog";
import type { QPickVehicleIconId } from "@/components/icons/vehicles/types";
import { useTranslations } from "@/components/i18n/locale-provider";

type StepVehicleTourProps = {
  selected: QPickVehicleIconId | null;
  passengers: number;
  onSelect: (id: QPickVehicleIconId) => void;
  onPassengersChange: (count: number) => void;
};

export function StepVehicleTour({
  selected,
  passengers,
  onSelect,
  onPassengersChange,
}: StepVehicleTourProps) {
  const t = useTranslations();
  const fleetId = selected ?? "sedan";
  const capacity = FLEET_VEHICLE_CAPACITY[fleetId];
  const vehicleName = t(`pages.ride.fleet.vehicles.${fleetId}.name`);

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
          Official Q Pick fleet — private, air-conditioned vehicles sized for
          passengers and luggage.
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
        {selected ? (
          <p className="mt-2 text-xs text-ink/45">
            {vehicleName} seats up to {capacity.passengers} passengers with{" "}
            {capacity.luggage} bags and A/C.
          </p>
        ) : null}
      </label>

      <VehicleSelection
        vehicleIds={QPICK_VEHICLE_ICON_IDS}
        selectedId={fleetId}
        onSelect={(id) => onSelect(id as QPickVehicleIconId)}
        embedded
        layout="grid"
        showEta={false}
        showDayNightBadge={false}
      />
    </div>
  );
}
