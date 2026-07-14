"use client";

import { Reveal } from "@/components/motion/reveal";
import { useTranslations } from "@/components/i18n/locale-provider";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { UIHeading, Prose } from "@/components/ui/typography";

export function PartnerDriverSplit() {
  const t = useTranslations();

  return (
    <Reveal>
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-mist bg-paper p-8 sm:p-10">
            <div>
              <p className="locale-eyebrow font-mono text-xs tracking-[0.16em] text-lagoon">
                {t("partnerDriver.partners.eyebrow")}
              </p>
              <UIHeading as="h3" size="h3" className="mt-3">
                {t("partnerDriver.partners.heading")}
              </UIHeading>
              <Prose className="mt-4">
                {t("partnerDriver.partners.body")}
              </Prose>
            </div>
            <ButtonLink href="/partners" variant="secondary" className="mt-8 w-fit">
              {t("partnerDriver.partners.cta")}
            </ButtonLink>
          </article>

          <article className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-mist bg-ink p-8 text-foam sm:p-10">
            <div>
              <p className="locale-eyebrow font-mono text-xs tracking-[0.16em] text-brass">
                {t("partnerDriver.drivers.eyebrow")}
              </p>
              <UIHeading as="h3" size="h3" className="mt-3 text-foam">
                {t("partnerDriver.drivers.heading")}
              </UIHeading>
              <p className="mt-4 max-w-sm text-foam/70 leading-relaxed">
                {t("partnerDriver.drivers.body")}
              </p>
            </div>
            <ButtonLink href="/drive" variant="onDark" className="mt-8 w-fit">
              {t("partnerDriver.drivers.cta")}
            </ButtonLink>
          </article>
        </div>
      </Container>
    </Reveal>
  );
}
