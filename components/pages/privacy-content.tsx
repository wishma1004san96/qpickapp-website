"use client";

import { useTranslations } from "@/components/i18n/locale-provider";
import { PageShell } from "@/components/marketing/page-shell";

export function PrivacyContent() {
  const t = useTranslations();

  return (
    <PageShell
      title={t("pages.legal.privacy.title")}
      description={t("pages.legal.privacy.description")}
    >
      <div className="prose-shell max-w-2xl space-y-4 text-sm leading-relaxed text-ink-muted">
        <p>{t("pages.legal.privacy.body")}</p>
        <p>
          {t("pages.legal.privacy.questionsPrefix")}{" "}
          <a
            href={`mailto:${t("pages.legal.privacy.supportEmail")}`}
            className="text-lagoon hover:text-lagoon-deep"
          >
            {t("pages.legal.privacy.supportEmail")}
          </a>
        </p>
      </div>
    </PageShell>
  );
}
