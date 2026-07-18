/**
 * Single source of truth for ride vehicle pricing + market calibration.
 * Live config: data/fare-pricing.json
 */

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "fs";
import path from "path";
import type {
  FarePricingCatalog,
  VehiclePricingSettings,
} from "@/lib/fare/types";
import {
  TAXI_VEHICLE_IDS,
  type TaxiVehicleId,
} from "@/lib/taxi-fare-vehicles";

export type FareCalibrationSettings = {
  marketAdjustment: number;
};

export type FarePricingFile = {
  calibration: FareCalibrationSettings;
  vehicles: FarePricingCatalog;
};

const RELATIVE_PATH = path.join("data", "fare-pricing.json");
const TMP_OVERRIDE_PATH = path.join("/tmp", "qpick-fare-pricing.json");

type Cache = { mtimeMs: number; source: string; data: FarePricingFile };

let cache: Cache | null = null;
let memoryOverlay: FarePricingFile | null = null;

function projectPath(): string {
  return path.join(process.cwd(), RELATIVE_PATH);
}

function resolveReadPath(): { filePath: string; mtimeMs: number } | null {
  const candidates = [TMP_OVERRIDE_PATH, projectPath()];
  let best: { filePath: string; mtimeMs: number } | null = null;
  for (const filePath of candidates) {
    try {
      if (!existsSync(filePath)) continue;
      const mtimeMs = statSync(filePath).mtimeMs;
      if (!best || mtimeMs >= best.mtimeMs) {
        best = { filePath, mtimeMs };
      }
    } catch {
      // ignore
    }
  }
  return best;
}

function isVehicleSettings(value: unknown): value is VehiclePricingSettings {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.dayBaseFare === "number" &&
    typeof v.dayPerKmRate === "number" &&
    typeof v.nightBaseFare === "number" &&
    typeof v.nightPerKmRate === "number" &&
    typeof v.waitingPerMinute === "number" &&
    typeof v.minimumFare === "number" &&
    typeof v.bookingFee === "number" &&
    typeof v.airportPickupFee === "number" &&
    typeof v.surgeEnabled === "boolean" &&
    typeof v.surgeMultiplier === "number" &&
    typeof v.longDistanceDiscountEnabled === "boolean"
  );
}

function normalizeCatalog(
  raw: Partial<Record<TaxiVehicleId, VehiclePricingSettings>> | undefined,
  seed: FarePricingCatalog,
): FarePricingCatalog {
  const next = {} as FarePricingCatalog;
  for (const id of TAXI_VEHICLE_IDS) {
    const candidate = raw?.[id];
    next[id] = isVehicleSettings(candidate)
      ? structuredClone(candidate)
      : structuredClone(seed[id]);
  }
  return next;
}

function normalizeCalibration(
  raw: Partial<FareCalibrationSettings> | undefined,
  seed: FareCalibrationSettings,
): FareCalibrationSettings {
  const n = raw?.marketAdjustment;
  if (typeof n === "number" && Number.isFinite(n) && n >= 0.5 && n <= 1.5) {
    return { marketAdjustment: n };
  }
  return { ...seed };
}

function parseFile(
  text: string,
  seed: FarePricingFile,
): FarePricingFile | null {
  try {
    const parsed = JSON.parse(text) as Partial<FarePricingFile>;
    return {
      calibration: normalizeCalibration(parsed.calibration, seed.calibration),
      vehicles: normalizeCatalog(parsed.vehicles, seed.vehicles),
    };
  } catch {
    return null;
  }
}

export function loadFarePricingFile(seed: FarePricingFile): FarePricingFile {
  if (memoryOverlay) {
    return structuredClone(memoryOverlay);
  }

  const located = resolveReadPath();
  if (located) {
    if (
      cache &&
      cache.source === located.filePath &&
      cache.mtimeMs === located.mtimeMs
    ) {
      return structuredClone(cache.data);
    }
    try {
      const text = readFileSync(located.filePath, "utf8");
      const data = parseFile(text, seed);
      if (data) {
        cache = {
          mtimeMs: located.mtimeMs,
          source: located.filePath,
          data,
        };
        return structuredClone(data);
      }
    } catch {
      // fall through
    }
  }

  return structuredClone(seed);
}

function tryWrite(filePath: string, json: string): boolean {
  try {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, json, "utf8");
    return true;
  } catch {
    return false;
  }
}

export function saveFarePricingFile(data: FarePricingFile): FarePricingFile {
  const normalized: FarePricingFile = {
    calibration: { ...data.calibration },
    vehicles: structuredClone(data.vehicles),
  };
  const json = `${JSON.stringify(normalized, null, 2)}\n`;

  const wroteProject = tryWrite(projectPath(), json);
  const wroteTmp = tryWrite(TMP_OVERRIDE_PATH, json);

  if (wroteProject || wroteTmp) {
    memoryOverlay = null;
    const located = resolveReadPath();
    cache = located
      ? {
          mtimeMs: located.mtimeMs,
          source: located.filePath,
          data: normalized,
        }
      : {
          mtimeMs: Date.now(),
          source: "memory",
          data: normalized,
        };
  } else {
    memoryOverlay = structuredClone(normalized);
    cache = {
      mtimeMs: Date.now(),
      source: "memory",
      data: normalized,
    };
  }

  return structuredClone(normalized);
}

export function clearFarePricingMemoryOverlay(): void {
  memoryOverlay = null;
  cache = null;
}

export type AdminPricingPatch = Partial<VehiclePricingSettings>;

export function applyVehiclePatch(
  base: VehiclePricingSettings,
  patch: AdminPricingPatch,
): VehiclePricingSettings {
  return {
    dayBaseFare: num(patch.dayBaseFare, base.dayBaseFare),
    dayPerKmRate: num(patch.dayPerKmRate, base.dayPerKmRate),
    nightBaseFare: num(patch.nightBaseFare, base.nightBaseFare),
    nightPerKmRate: num(patch.nightPerKmRate, base.nightPerKmRate),
    waitingPerMinute: num(patch.waitingPerMinute, base.waitingPerMinute),
    minimumFare: num(patch.minimumFare, base.minimumFare),
    bookingFee: num(patch.bookingFee, base.bookingFee),
    airportPickupFee: num(patch.airportPickupFee, base.airportPickupFee),
    surgeEnabled:
      typeof patch.surgeEnabled === "boolean"
        ? patch.surgeEnabled
        : base.surgeEnabled,
    surgeMultiplier: num(patch.surgeMultiplier, base.surgeMultiplier),
    longDistanceDiscountEnabled:
      typeof patch.longDistanceDiscountEnabled === "boolean"
        ? patch.longDistanceDiscountEnabled
        : base.longDistanceDiscountEnabled,
  };
}

function num(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fallback;
  }
  return value;
}
