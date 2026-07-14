"use client";

import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { PageShell } from "@/components/marketing/page-shell";

export function SafetyContent() {
  const t = useTranslations();
  const { safety } = useMessages().pages;
  const pillars = [
    safety.pillars.verifiedFleet,
    safety.pillars.tripSharing,
    safety.pillars.alwaysReachable,
    safety.pillars.insurance,
  ];
  const faqs = safety.faqs;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <PageShell
      title={t("pages.safety.title")}
      description={t("pages.safety.description")}
      primaryCta={{ href: "/support", label: t("pages.safety.primaryCta") }}
      secondaryCta={{ href: "/ride", label: t("pages.safety.secondaryCta") }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-2xl space-y-8">
        {pillars.map((item) => (
          <div key={item.title} className="border-t border-mist pt-6">
            <h2 className="text-lg font-medium text-ink">{item.title}</h2>
            <p className="mt-2 text-ink-muted leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 max-w-2xl">
        <h2 className="text-h3 font-medium text-ink">{t("pages.safety.faqHeading")}</h2>
        <dl className="mt-6 divide-y divide-mist border-y border-mist">
          {faqs.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="font-medium text-ink">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </PageShell>
  );
}
