"use client";

import { useTranslations } from "@/components/i18n/locale-provider";
import { PageShell } from "@/components/marketing/page-shell";
import { PartnerLogoRow } from "@/components/marketing/partner-logo-row";

export function PartnersContent() {
  const t = useTranslations();

  return (
    <PageShell
      title={t("pages.partners.title")}
      description={t("pages.partners.description")}
      primaryCta={{ href: "/support", label: t("pages.partners.primaryCta") }}
      secondaryCta={{ href: "/airport", label: t("pages.partners.secondaryCta") }}
    >
      <p className="max-w-2xl text-ink-muted leading-relaxed">
        {t("pages.partners.body")}
      </p>
      <div className="mt-10">
        <p className="mb-4 text-xs font-mono tracking-[0.16em] text-ink-soft uppercase">
          {t("pages.partners.logoRowEyebrow")}
        </p>
        <PartnerLogoRow />
      </div>
    </PageShell>
  );
}
