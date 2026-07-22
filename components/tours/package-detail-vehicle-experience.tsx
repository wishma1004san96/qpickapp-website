"use client";

import { VehicleCard } from "@/components/tours/vehicle-card";
import { usePackageDetailVehicle } from "@/components/tours/package-detail-vehicle-context";

export function PackageDetailVehicleExperience() {
  const { vehicles, selectedVehicleId, selectVehicle, isVehicleSelectable } =
    usePackageDetailVehicle();

  return (
    <div className="tour-detail-grid tour-detail-grid--3 tour-detail-equal-cards tour-detail-stack">
      {vehicles.map((vehicle, index) => {
        const selectable = isVehicleSelectable(vehicle.id);
        return (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            index={index}
            selected={vehicle.id === selectedVehicleId}
            onSelect={selectable ? selectVehicle : undefined}
            disabled={!selectable}
            experience
          />
        );
      })}
    </div>
  );
}
