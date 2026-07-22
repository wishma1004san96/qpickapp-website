"use client";

import { AnimatedRouteMap } from "@/components/tours/animated-route-map";
import { usePackageDetailVehicle } from "@/components/tours/package-detail-vehicle-context";
import type { TourItineraryRoute } from "@/lib/tours/itinerary-route";

type PackageDetailRouteMapProps = {
  itineraryRoute: TourItineraryRoute;
  title: string;
  durationDays: number;
};

export function PackageDetailRouteMap({
  itineraryRoute,
  title,
  durationDays,
}: PackageDetailRouteMapProps) {
  const { selectedVehicle } = usePackageDetailVehicle();

  return (
    <AnimatedRouteMap
      itineraryRoute={itineraryRoute}
      title={title}
      vehicle={selectedVehicle}
      durationDays={durationDays}
    />
  );
}
