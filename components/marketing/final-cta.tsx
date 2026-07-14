"use client";

import { Reveal } from "@/components/motion/reveal";
import { useTranslations } from "@/components/i18n/locale-provider";
import { AppStoreBadge } from "@/components/ui/app-store-badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/typography";

export function FinalCta() {
  const t = useTranslations();
  const brand = t("finalCta.brand");

  return (
    <Reveal>
      <div className="border-t border-mist bg-paper py-16 sm:py-24">
        <Container className="text-center">
          <p className="font-display text-3xl tracking-tight text-ink">
            {brand === "Q Pick" ? <>Q&nbsp;Pick</> : brand}
          </p>
          <p className="mt-6 font-display text-h2 text-ink">
            {t("finalCta.heading")}
          </p>
          <Prose className="mx-auto mt-4">{t("finalCta.body")}</Prose>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/airport" size="lg">
              {t("finalCta.primary")}
            </ButtonLink>
            <ButtonLink href="/tours" variant="secondary" size="lg">
              {t("finalCta.secondary")}
            </ButtonLink>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <AppStoreBadge store="ios" />
            <AppStoreBadge store="android" />
          </div>
        </Container>
      </div>
    </Reveal>
  );
}
