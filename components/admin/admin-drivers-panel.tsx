"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ADMIN_CHECKLIST_KEYS,
  ADMIN_CHECKLIST_LABELS,
  DRIVER_STATUS_LABELS,
  type DriverApplicationStatus,
} from "@/domains/driver-applications";

type DriverItem = {
  id: string;
  referenceCode: string;
  status: DriverApplicationStatus;
  fullName: string | null;
  mobile: string;
  vehicleCategory: string | null;
  registrationNumber: string | null;
  profileCompletion: { percent: number; missing: { label: string }[] };
  adminChecklist: Partial<Record<string, boolean>>;
  documents: Record<string, string>;
  sections: Record<string, { percent: number; complete: boolean }>;
  adminNotes: string | null;
  missingDocRequest: string | null;
  submittedAt: string | null;
};

export function AdminDriversPanel({ pendingOnly = true }: { pendingOnly?: boolean }) {
  const [items, setItems] = useState<DriverItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/drivers?pending=${pendingOnly ? "1" : "0"}`, {
      headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" },
    });
    const data = (await res.json()) as { items?: DriverItem[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Failed to load drivers.");
      return;
    }
    setItems(data.items ?? []);
    setError(null);
  }, [pendingOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/drivers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "",
        },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Update failed.");
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
            Admin · Drivers
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
            {pendingOnly ? "Pending drivers" : "All driver applications"}
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Review applications, verify documents, and approve drivers. Only Super Admin can approve.
          </p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-brand-deep underline-offset-4 hover:underline">
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
          const expanded = expandedId === item.id;
          const sections = item.sections;
          return (
            <li key={item.id} className="rounded-[1.1rem] border border-ink/10 bg-paper p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-ink">{item.referenceCode}</p>
                  <p className="mt-1 text-sm text-ink/70">
                    {item.fullName ?? "Unnamed"} · {item.mobile}
                  </p>
                  <p className="mt-1 text-xs text-ink/45">
                    {item.vehicleCategory ?? "—"} · {item.registrationNumber ?? "No plate"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                    {DRIVER_STATUS_LABELS[item.status]}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {item.profileCompletion.percent}% complete
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : item.id)}
                className="mt-4 text-sm font-medium text-brand"
              >
                {expanded ? "Hide details" : "Review application"}
              </button>

              {expanded ? (
                <div className="mt-5 space-y-5 border-t border-ink/8 pt-5">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {ADMIN_CHECKLIST_KEYS.map((key) => (
                      <label
                        key={key}
                        className="flex items-center justify-between rounded-xl border border-ink/8 px-3 py-2 text-sm"
                      >
                        <span>
                          {ADMIN_CHECKLIST_LABELS[key]} · {sections[key]?.percent ?? 0}%
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(item.adminChecklist[key])}
                          onChange={(e) =>
                            void patch(item.id, {
                              action: "update_checklist",
                              checklist: { [key]: e.target.checked },
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {Object.entries(item.documents).map(([key, path]) => (
                      <a
                        key={key}
                        href={path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-ink/8 px-3 py-2 text-xs font-medium text-brand hover:bg-brand/5"
                      >
                        {key}
                      </a>
                    ))}
                  </div>

                  <textarea
                    className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"
                    placeholder="Admin note or missing document request"
                    value={noteDraft[item.id] ?? item.missingDocRequest ?? ""}
                    onChange={(e) =>
                      setNoteDraft((d) => ({ ...d, [item.id]: e.target.value }))
                    }
                  />

                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["approve", "Approve"],
                        ["reject", "Reject"],
                        ["suspend", "Suspend"],
                        ["request_documents", "Request docs"],
                        ["notify_driver", "Notify driver"],
                      ] as const
                    ).map(([action, label]) => (
                      <button
                        key={action}
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() =>
                          void patch(item.id, {
                            action,
                            message: noteDraft[item.id],
                            note: noteDraft[item.id],
                          })
                        }
                        className="rounded-xl border border-ink/10 px-4 py-2 text-sm font-medium text-ink hover:border-brand/30 disabled:opacity-40"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-ink/50">No driver applications in this queue.</p>
      ) : null}
    </div>
  );
}
