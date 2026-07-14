"use client";

import { useTranslations } from "@/components/i18n/locale-provider";

export function DriverTrustRow({
  name,
  trips,
  rating,
  verifiedLabel,
  tripsLabel,
}: {
  name: string;
  trips: string;
  rating: string;
  verifiedLabel?: string;
  tripsLabel?: string;
}) {
  const t = useTranslations();

  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-mist bg-paper px-4 py-3">
      <div
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-lagoon/10 font-display text-lg text-lagoon"
      >
        {name.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{name}</p>
        <p className="text-xs text-ink-soft">
          {verifiedLabel ?? t("driverTrust.verified")}
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm text-ink">{rating}</p>
        <p className="font-mono text-xs text-ink-soft">
          {tripsLabel ?? t("driverTrust.trips", { count: trips })}
        </p>
      </div>
    </div>
  );
}
