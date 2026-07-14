"use client";

import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { PageShell } from "@/components/marketing/page-shell";

export function ToursContent() {
  const t = useTranslations();
  const { cards: cardMap } = useMessages().pages.tours;
  const cards = [cardMap.dayCharters, cardMap.multiDay];

  return (
    <PageShell
      title={t("pages.tours.title")}
      description={t("pages.tours.description")}
      primaryCta={{ href: "/destinations", label: t("pages.tours.primaryCta") }}
      secondaryCta={{ href: "/support", label: t("pages.tours.secondaryCta") }}
    >
      <div className="grid gap-8 sm:grid-cols-2">
        {cards.map((item) => (
          <div
            key={item.title}
            className="rounded-[var(--radius-lg)] border border-mist bg-paper p-6"
          >
            <h2 className="text-lg font-medium text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.body}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
