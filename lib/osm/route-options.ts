/**
 * Rank, label, and classify alternative driving routes for the Ride booking UI.
 */

import type { DrivingRouteEstimate, RouteRoadType } from "@/lib/osm/types";

export type RouteTagKey =
  | "fastest"
  | "avoidHighway"
  | "highway"
  | "scenic"
  | "alternative";

export type EnrichedDrivingRoute = DrivingRouteEstimate & {
  id: string;
  index: number;
  isRecommended: boolean;
  roadType: RouteRoadType;
  tagKey: RouteTagKey;
  /** 0–1 share of distance classified as highway / state road */
  highwayShare: number;
};

type RawRouteFeature = {
  distanceKm: number;
  durationSeconds: number;
  durationText: string;
  distanceText: string;
  coordinates: [number, number][];
  highwayShare?: number;
};

/**
 * Sort by duration (fastest first), cap at 3, and assign display metadata.
 */
export function enrichRouteOptions(
  rawRoutes: RawRouteFeature[],
): EnrichedDrivingRoute[] {
  const capped = [...rawRoutes]
    .filter((r) => r.coordinates.length >= 2 && r.distanceKm > 0)
    .sort((a, b) => a.durationSeconds - b.durationSeconds)
    .slice(0, 3);

  if (capped.length === 0) return [];

  const recommendedShare = capped[0]?.highwayShare ?? 0;

  return capped.map((route, index) => {
    const highwayShare = clamp01(route.highwayShare ?? 0);
    const roadType: RouteRoadType =
      highwayShare >= 0.22 ? "highway" : "normal";
    const isRecommended = index === 0;
    const tagKey = resolveTagKey({
      index,
      isRecommended,
      highwayShare,
      recommendedShare,
      durationSeconds: route.durationSeconds,
      fastestDuration: capped[0]!.durationSeconds,
      distanceKm: route.distanceKm,
      shortestDistance: Math.min(...capped.map((r) => r.distanceKm)),
    });

    return {
      ...route,
      highwayShare,
      roadType,
      id: `route-${index}-${Math.round(route.distanceKm * 100)}-${route.durationSeconds}`,
      index,
      isRecommended,
      tagKey,
    };
  });
}

function resolveTagKey(input: {
  index: number;
  isRecommended: boolean;
  highwayShare: number;
  recommendedShare: number;
  durationSeconds: number;
  fastestDuration: number;
  distanceKm: number;
  shortestDistance: number;
}): RouteTagKey {
  if (input.isRecommended) return "fastest";

  if (input.highwayShare + 0.08 < input.recommendedShare) {
    return "avoidHighway";
  }
  if (input.highwayShare >= 0.28 && input.highwayShare > input.recommendedShare + 0.05) {
    return "highway";
  }
  if (
    input.distanceKm > input.shortestDistance * 1.04 &&
    input.durationSeconds > input.fastestDuration * 1.04
  ) {
    return "scenic";
  }
  return "alternative";
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
