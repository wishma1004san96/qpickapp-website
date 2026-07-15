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
            {t("pages.support.phoneLabel")}
          </h2>
          <ul className="mt-2 space-y-1">
            {siteConfig.phoneLines.map((line) => (
              <li key={line}>
                <a
                  href={`tel:${line.replace(/\s/g, "")}`}
                  className="inline-flex min-h-10 items-center font-mono text-sm text-ink hover:text-lagoon"
                >
                  {line}
                </a>
              </li>
            ))}
          </ul>
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
        <div>
          <h2 className="text-sm font-medium text-ink">
            {t("pages.support.locationLabel")}
          </h2>
          <p className="mt-2 text-ink-muted leading-relaxed text-pretty">
            {siteConfig.address}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
