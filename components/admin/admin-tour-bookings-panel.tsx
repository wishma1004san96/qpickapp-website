"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  TOUR_STATUS_FLOW,
  TOUR_STATUS_LABELS,
  type TourBookingStatus,
} from "@/domains/tour-booking-requests/status";

type Item = {
  id: string;
  referenceCode: string;
  status: TourBookingStatus;
  passengerName: string;
  passengerPhone: string;
  destinations: string[];
  startDate: string;
  endDate: string | null;
  numberOfDays: number;
  vehicleType: string;
  passengers: number;
  assignedGuideName: string | null;
  assignedGuidePhone: string | null;
  assignedDriverName: string | null;
  assignedDriverPhone: string | null;
};

export function AdminTourBookingsPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draft, setDraft] = useState<
    Record<
      string,
      {
        guideName: string;
        guidePhone: string;
        driverName: string;
        driverPhone: string;
        notes: string;
      }
    >
  >({});

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/tour-booking-requests");
    const data = (await res.json()) as { items?: Item[]; error?: string };
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
      const res = await fetch("/api/admin/tour-booking-requests", {
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
            Admin · Tour Booking Requests
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
            Tour bookings
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Review requests and assign a driver/guide. Separate from Ride and
            Airport Transfer.
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
          const next = TOUR_STATUS_FLOW[item.status] ?? [];
          const d = draft[item.id] ?? {
            guideName: item.assignedGuideName ?? "",
            guidePhone: item.assignedGuidePhone ?? "",
            driverName: item.assignedDriverName ?? "",
            driverPhone: item.assignedDriverPhone ?? "",
            notes: "",
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
                    {item.destinations.join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-ink/45">
                    {item.startDate}
                    {item.endDate ? ` → ${item.endDate}` : ""} ·{" "}
                    {item.numberOfDays} day(s) · {item.vehicleType} ·{" "}
                    {item.passengerName}
                  </p>
                </div>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-deep">
                  {TOUR_STATUS_LABELS[item.status]}
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
                    → {TOUR_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <input
                  className="rounded-lg border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Guide name"
                  value={d.guideName}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [item.id]: { ...d, guideName: e.target.value },
                    }))
                  }
                />
                <input
                  className="rounded-lg border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Guide phone"
                  value={d.guidePhone}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [item.id]: { ...d, guidePhone: e.target.value },
                    }))
                  }
                />
                <input
                  className="rounded-lg border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Driver name"
                  value={d.driverName}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [item.id]: { ...d, driverName: e.target.value },
                    }))
                  }
                />
                <input
                  className="rounded-lg border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Driver phone"
                  value={d.driverPhone}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [item.id]: { ...d, driverPhone: e.target.value },
                    }))
                  }
                />
                <input
                  className="rounded-lg border border-ink/10 px-3 py-2 text-sm"
                  placeholder="Admin notes"
                  value={d.notes}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [item.id]: { ...d, notes: e.target.value },
                    }))
                  }
                />
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() =>
                    void patch({
                      id: item.id,
                      action: "assign_guide",
                      guideName: d.guideName,
                      guidePhone: d.guidePhone,
                      driverName: d.driverName,
                      driverPhone: d.driverPhone,
                      adminNotes: d.notes,
                    })
                  }
                  className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-paper disabled:opacity-50"
                >
                  Assign guide / driver
                </button>
              </div>
            </li>
          );
        })}
        {items.length === 0 ? (
          <li className="text-sm text-ink/50">No tour booking requests yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
