import type { TourRouteStop } from "@/lib/tours/itinerary-route";

export type TourStopSchedule = {
  arrivalTime: string;
  departureTime: string;
};

/** Display-only schedule labels derived from stop role (no backend changes). */
export function getStopSchedule(
  stop: TourRouteStop,
  options?: {
    isLastDestination?: boolean;
    dayIndex?: number;
  },
): TourStopSchedule {
  if (stop.id === "airport-start") {
    return {
      arrivalTime: "Flight arrival · CMB",
      departureTime: "Meet chauffeur · depart",
    };
  }

  if (stop.id === "airport-end") {
    return {
      arrivalTime: "Hotel pickup",
      departureTime: "CMB departure transfer",
    };
  }

  const day = stop.day ?? stop.days[0] ?? options?.dayIndex ?? null;

  if (day === 1) {
    return {
      arrivalTime: "Afternoon · check-in",
      departureTime: "Next morning · depart",
    };
  }

  if (options?.isLastDestination) {
    return {
      arrivalTime: "Midday · arrive",
      departureTime: "Final evening · overnight",
    };
  }

  return {
    arrivalTime: day != null ? `Day ${day} · arrive` : "Arrive",
    departureTime: day != null ? `Day ${day + 1} · depart` : "Depart",
  };
}
