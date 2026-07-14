"use client";

import { useTranslations } from "@/components/i18n/locale-provider";
import { PageShell } from "@/components/marketing/page-shell";

export function TermsContent() {
  const t = useTranslations();

  return (
    <PageShell
      title={t("pages.legal.terms.title")}
      description={t("pages.legal.terms.description")}
    >
      <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-ink-muted">
        <p>{t("pages.legal.terms.body")}</p>
        <p>
          {t("pages.legal.terms.questionsPrefix")}{" "}
          <a
            href={`mailto:${t("pages.legal.terms.supportEmail")}`}
            className="text-lagoon hover:text-lagoon-deep"
          >
            {t("pages.legal.terms.supportEmail")}
          </a>
        </p>
      </div>
    </PageShell>
  );
}
