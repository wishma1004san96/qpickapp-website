"use client";

import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { PageShell } from "@/components/marketing/page-shell";

export function DriveContent() {
  const t = useTranslations();
  const bullets = useMessages().pages.drive.bullets;

  return (
    <PageShell
      title={t("pages.drive.title")}
      description={t("pages.drive.description")}
      primaryCta={{ href: "/support", label: t("pages.drive.primaryCta") }}
      secondaryCta={{ href: "/safety", label: t("pages.drive.secondaryCta") }}
    >
      <ul className="max-w-xl space-y-3 text-ink-muted">
        {bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </PageShell>
  );
}
