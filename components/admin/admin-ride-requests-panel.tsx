"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  RIDE_STATUS_FLOW,
  RIDE_STATUS_LABELS,
  type RideRequestStatus,
} from "@/domains/ride-requests/status";

type RideItem = {
  id: string;
  referenceCode: string;
  status: RideRequestStatus;
  passengerName: string;
  passengerPhone: string;
  pickupLabel: string;
  destinationLabel: string;
  vehicleType: string;
  estimatedFareLkr: number | null;
  nearbyDriversFound: number;
  assignedDriverName: string | null;
  assignedDriverPhone: string | null;
  assignedVehiclePlate: string | null;
  createdAt: string;
};

export function AdminRideRequestsPanel() {
  const [items, setItems] = useState<RideItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [driverDraft, setDriverDraft] = useState<
    Record<string, { name: string; phone: string; plate: string }>
  >({});

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/ride-requests");
    const data = (await res.json()) as { items?: RideItem[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Failed to load");
      return;
    }
    setItems(data.items ?? []);
    setError(null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(body: Record<string, unknown>) {
    const id = String(body.id);
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/ride-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Update failed");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-ink/45 uppercase">
            Admin · Ride Requests
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
            Taxi ride bookings
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Real-time ride domain only — separate from Airport Transfer and Tour
            Booking.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm font-medium text-brand-deep underline-offset-4 hover:underline"
        >
          ← Admin hub
        </Link>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="mt-8 space-y-4">
        {items.map((item) => {
          const next = RIDE_STATUS_FLOW[item.status] ?? [];
          const draft = driverDraft[item.id] ?? {
            name: item.assignedDriverName ?? "",
            phone: item.assignedDriverPhone ?? "",
            plate: item.assignedVehiclePlate ?? "",
          };
          return (
            <li
              key={item.id}
              className="rounded-[1.1rem] border border-ink/10 bg-paper p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-ink">
                    {item.referenceCode}
                  </p>
                  <p className="mt-1 text-sm text-ink/70">
                    {item.pickupLabel} → {item.destinationLabel}
                  </p>
                  <p className="mt-1 text-xs text-ink/45">
                    {item.passengerName} · {item.passengerPhone} ·{" "}
                    {item.vehicleType}
                    {item.nearbyDriversFound
                      ? ` · ${item.nearbyDriversFound} nearby`
                      : ""}
                  </p>
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-deep">
                  {RIDE_STATUS_LABELS[item.status]}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {next.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void patch({ id: item.id, status })}
                    className="rounded-full border border-ink/12 px-3 py-1.5 text-xs font-semibold text-ink hover:border-brand/40 disabled:opacity-50"
                  >
                    → {RIDE_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-4">
                <input
                  className="rounded-lg border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Driver name"
                  value={draft.name}
                  onChange={(e) =>
                    setDriverDraft((d) => ({
                      ...d,
                      [item.id]: { ...draft, name: e.target.value },
                    }))
                  }
                />
                <input
                  className="rounded-lg border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Phone"
                  value={draft.phone}
                  onChange={(e) =>
                    setDriverDraft((d) => ({
                      ...d,
                      [item.id]: { ...draft, phone: e.target.value },
                    }))
                  }
                />
                <input
                  className="rounded-lg border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Plate"
                  value={draft.plate}
                  onChange={(e) =>
                    setDriverDraft((d) => ({
                      ...d,
                      [item.id]: { ...draft, plate: e.target.value },
                    }))
                  }
                />
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() =>
                    void patch({
                      id: item.id,
                      action: "assign_driver",
                      driverName: draft.name,
                      driverPhone: draft.phone,
                      vehiclePlate: draft.plate,
                    })
                  }
                  className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-paper disabled:opacity-50"
                >
                  Assign driver
                </button>
              </div>
            </li>
          );
        })}
        {items.length === 0 ? (
          <li className="text-sm text-ink/50">No ride requests yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
