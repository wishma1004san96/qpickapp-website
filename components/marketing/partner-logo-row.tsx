"use client";

import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";

/** Quiet partner wordmark row — no logo assets required in Phase 1. */
export function PartnerLogoRow({
  className = "",
}: {
  className?: string;
}) {
  const t = useTranslations();
  const { pages } = useMessages();
  const partners = pages.partners.partnerNames;

  return (
    <ul
      className={`flex flex-wrap items-center gap-x-8 gap-y-3 ${className}`}
      aria-label={t("pages.partners.logoRowAriaLabel")}
    >
      {partners.map((name) => (
        <li
          key={name}
          className="font-display text-sm tracking-wide text-ink-soft/80"
        >
          {name}
        </li>
      ))}
    </ul>
  );
}
