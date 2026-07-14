"use client";

import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { PageShell } from "@/components/marketing/page-shell";

export function AirportContent() {
  const t = useTranslations();
  const bullets = useMessages().pages.airport.bullets;

  return (
    <PageShell
      title={t("pages.airport.title")}
      description={t("pages.airport.description")}
      primaryCta={{ href: "/support", label: t("pages.airport.primaryCta") }}
      secondaryCta={{ href: "/partners", label: t("pages.airport.secondaryCta") }}
    >
      <ul className="max-w-2xl space-y-4 text-ink-muted">
        {bullets.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lagoon" />
            {item}
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
