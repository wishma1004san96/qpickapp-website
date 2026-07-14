"use client";

import { useTranslations } from "@/components/i18n/locale-provider";
import { PageShell } from "@/components/marketing/page-shell";
import { siteConfig } from "@/lib/site";

export function SupportContent() {
  const t = useTranslations();

  return (
    <PageShell
      title={t("pages.support.title")}
      description={t("pages.support.description")}
    >
      <div className="grid max-w-2xl gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium text-ink">
            {t("pages.support.emailLabel")}
          </h2>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="mt-2 inline-flex min-h-11 items-center text-lagoon hover:text-lagoon-deep"
          >
            {siteConfig.supportEmail}
          </a>
        </div>
        <div>
          <h2 className="text-sm font-medium text-ink">
            {t("pages.support.emergencyLabel")}
          </h2>
          <a
            href={`tel:${siteConfig.emergencyLine.replace(/\s/g, "")}`}
            className="mt-2 inline-flex min-h-11 items-center font-mono text-ink"
          >
            {siteConfig.emergencyLine}
          </a>
        </div>
      </div>
    </PageShell>
  );
}
