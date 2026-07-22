"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { draftFromApi, type DriverOnboardingDraft } from "@/components/driver-onboarding/types";

export function DriverDashboardPanel() {
  const [draft, setDraft] = useState<DriverOnboardingDraft | null>(null);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/drivers/application");
      const data = (await res.json()) as { item?: Record<string, unknown> | null };
      if (data.item) {
        const next = draftFromApi(data.item);
        setDraft(next);
        setOnline(next.isOnline);
      }
      setLoading(false);
    })();
  }, []);

  async function toggleOnline() {
    if (!draft?.canGoOnline || toggling) return;
    setToggling(true);
    try {
      const nextOnline = !online;
      const res = await fetch("/api/drivers/online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online: nextOnline }),
      });
      const data = (await res.json()) as {
        item?: Record<string, unknown>;
        error?: string;
      };
      if (res.ok && data.item) {
        const next = draftFromApi(data.item);
        setDraft(next);
        setOnline(next.isOnline);
      }
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink/50">
        Loading dashboard…
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Driver dashboard</h1>
        <p className="mt-3 text-sm text-ink/55">
          Complete your driver application to access the Q Pick driver dashboard.
        </p>
        <Link
          href="/drive/apply"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-6 text-sm font-semibold text-paper"
        >
          Start application
        </Link>
      </div>
    );
  }

  const canGoOnline = draft.canGoOnline;
  const missing = draft.profileCompletionPercent < 100;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-[0.625rem] tracking-[0.16em] text-brand uppercase">
        Q Pick Driver
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
        Welcome, {draft.fullName || "Driver"}
      </h1>
      <p className="mt-2 text-sm text-ink/55">
        Status: <span className="font-semibold text-ink">{draft.status.replace(/_/g, " ")}</span>
      </p>

      <div className="mt-8 rounded-[1.35rem] border border-ink/8 bg-white p-6 shadow-[0_12px_36px_rgb(10_22_32_/_0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">Profile completion</p>
            <p className="mt-1 font-display text-3xl font-semibold text-brand">
              {draft.profileCompletionPercent}%
            </p>
          </div>
          <button
            type="button"
            disabled={!canGoOnline || toggling}
            onClick={() => void toggleOnline()}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold ${
              online
                ? "bg-brand text-paper"
                : "border border-ink/15 bg-foam text-ink/45"
            } disabled:cursor-not-allowed`}
          >
            {online ? "Online" : "Go Online"}
          </button>
        </div>

        {!canGoOnline ? (
          <p className="mt-3 text-xs text-ink/45">
            You cannot go online until your application is approved by Q Pick admin and your profile is 100% complete.
          </p>
        ) : null}

        {missing ? (
          <div className="mt-5 border-t border-ink/8 pt-5">
            <p className="text-sm font-semibold text-ink">Missing</p>
            <ul className="mt-2 space-y-1 text-sm text-ink/55">
              {(draft.missingItems.length
                ? draft.missingItems
                : [{ label: "Complete remaining onboarding sections" }]
              )
                .slice(0, 6)
                .map((item) => (
                  <li key={item.label}>• {item.label}</li>
                ))}
            </ul>
            <Link href="/drive/apply" className="mt-4 inline-flex text-sm font-medium text-brand">
              Continue application →
            </Link>
          </div>
        ) : null}
      </div>

      {draft.status === "PENDING_REVIEW" ? (
        <div className="mt-6 rounded-[1.2rem] border border-brand/15 bg-brand/5 p-5 text-sm text-ink/70">
          Your application is pending admin review. You cannot go online until approved.
        </div>
      ) : null}

      {draft.status === "DRAFT" && draft.missingDocRequest ? (
        <div className="mt-6 rounded-[1.2rem] border border-amber-200 bg-amber-50 p-5 text-sm text-ink/70">
          Admin requested additional documents. Please update your application and resubmit.
        </div>
      ) : null}
    </div>
  );
}
