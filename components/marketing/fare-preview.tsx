"use client";

import { useTranslations } from "@/components/i18n/locale-provider";

/**
 * Display-only fare preview for Phase 1 marketing / future book lite.
 */
export function FarePreview({
  from,
  to,
  currency = "LKR",
  amount,
  note,
  fromLabel,
  toLabel,
}: {
  from: string;
  to: string;
  currency?: string;
  amount: string;
  note?: string;
  fromLabel?: string;
  toLabel?: string;
}) {
  const t = useTranslations();

  return (
    <div className="rounded-[var(--radius-lg)] border border-mist bg-paper p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-ink-soft">
            {fromLabel ?? t("farePreview.from")}
          </p>
          <p className="mt-1 text-sm font-medium text-ink">{from}</p>
          <p className="mt-3 text-xs text-ink-soft">
            {toLabel ?? t("farePreview.to")}
          </p>
          <p className="mt-1 text-sm font-medium text-ink">{to}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs tracking-wide text-ink-soft">{currency}</p>
          <p className="mt-1 font-mono text-2xl font-medium text-ink">{amount}</p>
        </div>
      </div>
      <p className="mt-4 border-t border-mist pt-3 text-xs text-ink-soft">
        {note ?? t("farePreview.note")}
      </p>
    </div>
  );
}
