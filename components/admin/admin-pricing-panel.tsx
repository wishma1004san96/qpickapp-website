"use client";

import { useCallback, useEffect, useState } from "react";
import type { VehiclePricingSettings } from "@/lib/fare/types";
import { TAXI_VEHICLE_IDS, type TaxiVehicleId } from "@/lib/taxi-fare-vehicles";
import { VEHICLE_PRICING_LABELS } from "@/lib/fare/vehicle-labels";

type Catalog = Record<TaxiVehicleId, VehiclePricingSettings>;

const NUMBER_FIELDS: {
  key: keyof VehiclePricingSettings;
  label: string;
  step?: string;
}[] = [
  { key: "dayBaseFare", label: "Day Base Fare" },
  { key: "dayPerKmRate", label: "Day Per KM" },
  { key: "nightBaseFare", label: "Night Base Fare" },
  { key: "nightPerKmRate", label: "Night Per KM" },
  { key: "waitingPerMinute", label: "Waiting Charge / min" },
  { key: "minimumFare", label: "Minimum Fare" },
  { key: "bookingFee", label: "Booking Fee" },
  { key: "airportPickupFee", label: "Airport Pickup Fee" },
  { key: "surgeMultiplier", label: "Surge Multiplier", step: "0.01" },
];

const BOOL_FIELDS: { key: keyof VehiclePricingSettings; label: string }[] = [
  { key: "surgeEnabled", label: "Surge Enabled" },
  {
    key: "longDistanceDiscountEnabled",
    label: "Long Distance Discount",
  },
];

export function AdminPricingPanel() {
  const [vehicles, setVehicles] = useState<Catalog | null>(null);
  const [selected, setSelected] = useState<TaxiVehicleId>("miniCar");
  const [draft, setDraft] = useState<VehiclePricingSettings | null>(null);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/pricing", { cache: "no-store" });
      const data = (await res.json()) as { vehicles: Catalog; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load pricing");
      setVehicles(data.vehicles);
      setDraft(structuredClone(data.vehicles[selected]));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Load failed");
    } finally {
      setBusy(false);
    }
  }, [selected]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (vehicles) setDraft(structuredClone(vehicles[selected]));
  }, [selected, vehicles]);

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ vehicles: { [selected]: draft } }),
      });
      const data = (await res.json()) as { vehicles: Catalog; error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      setVehicles(data.vehicles);
      setDraft(structuredClone(data.vehicles[selected]));
      setStatus("Saved — live estimates use these rates immediately.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const resetAll = async () => {
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = (await res.json()) as { vehicles: Catalog; error?: string };
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setVehicles(data.vehicles);
      setDraft(structuredClone(data.vehicles[selected]));
      setStatus("Restored default Day & Night catalog.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-ink">
      <header className="mb-8">
        <p className="font-mono text-[0.65rem] tracking-[0.16em] text-ink/45 uppercase">
          Admin
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight">
          Day & Night Pricing
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/65">
          Edit live vehicle rates. Changes persist to{" "}
          <code className="rounded bg-mist/60 px-1.5 py-0.5 text-xs">
            data/fare-pricing.json
          </code>{" "}
          and apply to fare estimates immediately. Day 05:00–21:59 · Night
          22:00–04:59 (Asia/Colombo).
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium">
          Vehicle
          <select
            className="ml-2 min-h-10 rounded-lg border border-ink/15 bg-paper px-3 text-sm"
            value={selected}
            onChange={(e) => setSelected(e.target.value as TaxiVehicleId)}
            disabled={busy}
          >
            {TAXI_VEHICLE_IDS.map((id) => (
              <option key={id} value={id}>
                {VEHICLE_PRICING_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy || !draft}
          className="min-h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-paper disabled:opacity-50"
        >
          Save vehicle
        </button>
        <button
          type="button"
          onClick={() => void resetAll()}
          disabled={busy}
          className="min-h-10 rounded-lg border border-ink/15 px-4 text-sm font-medium disabled:opacity-50"
        >
          Reset all defaults
        </button>
        <button
          type="button"
          onClick={() => void load()}
          disabled={busy}
          className="min-h-10 rounded-lg border border-ink/15 px-4 text-sm font-medium disabled:opacity-50"
        >
          Reload
        </button>
      </div>

      {status ? (
        <p className="mb-4 text-sm text-ink/70" role="status">
          {status}
        </p>
      ) : null}

      {!draft ? (
        <p className="text-sm text-ink/55">Loading catalog…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {NUMBER_FIELDS.map(({ key, label, step }) => (
            <label key={key} className="block text-sm">
              <span className="mb-1 block font-medium text-ink/80">{label}</span>
              <input
                type="number"
                min={0}
                step={step ?? "1"}
                className="min-h-10 w-full rounded-lg border border-ink/15 bg-paper px-3"
                value={Number(draft[key])}
                disabled={busy}
                onChange={(e) => {
                  const n = Number.parseFloat(e.target.value);
                  setDraft({
                    ...draft,
                    [key]: Number.isFinite(n) ? n : 0,
                  });
                }}
              />
            </label>
          ))}
          {BOOL_FIELDS.map(({ key, label }) => (
            <label
              key={key}
              className="flex min-h-10 items-center gap-2 text-sm font-medium"
            >
              <input
                type="checkbox"
                checked={Boolean(draft[key])}
                disabled={busy}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [key]: e.target.checked,
                  })
                }
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
