"use client";

import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { PageShell } from "@/components/marketing/page-shell";

export function AboutContent() {
  const t = useTranslations();
  const paragraphs = useMessages().pages.about.paragraphs;

  return (
    <PageShell
      title={t("pages.about.title")}
      description={t("pages.about.description")}
      primaryCta={{ href: "/ride", label: t("pages.about.primaryCta") }}
      secondaryCta={{ href: "/drive", label: t("pages.about.secondaryCta") }}
    >
      <div className="max-w-2xl space-y-4 text-ink-muted leading-relaxed">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 32)}>{p}</p>
        ))}
      </div>
    </PageShell>
  );
}
