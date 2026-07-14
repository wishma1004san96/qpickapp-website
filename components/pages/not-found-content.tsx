"use client";

import Link from "next/link";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DisplayHeading, Prose } from "@/components/ui/typography";

function ContinueLinks({
  template,
  ride,
  airport,
  tours,
}: {
  template: string;
  ride: string;
  airport: string;
  tours: string;
}) {
  const parts = template.split(/(\{ride\}|\{airport\}|\{tours\})/);
  return (
    <>
      {parts.map((part, index) => {
        if (part === "{ride}") {
          return (
            <Link
              key={`ride-${index}`}
              href="/ride"
              className="text-lagoon hover:text-lagoon-deep"
            >
              {ride}
            </Link>
          );
        }
        if (part === "{airport}") {
          return (
            <Link
              key={`airport-${index}`}
              href="/airport"
              className="text-lagoon hover:text-lagoon-deep"
            >
              {airport}
            </Link>
          );
        }
        if (part === "{tours}") {
          return (
            <Link
              key={`tours-${index}`}
              href="/tours"
              className="text-lagoon hover:text-lagoon-deep"
            >
              {tours}
            </Link>
          );
        }
        return <span key={`text-${index}`}>{part}</span>;
      })}
    </>
  );
}

export function NotFoundContent() {
  const t = useTranslations();
  const continueTemplate = useMessages().pages.notFound.continue;

  return (
    <div className="flex flex-1 items-center bg-foam py-28">
      <Container>
        <p className="font-mono text-xs tracking-[0.18em] text-lagoon">
          {t("pages.notFound.code")}
        </p>
        <DisplayHeading className="mt-4">
          {t("pages.notFound.title")}
        </DisplayHeading>
        <Prose className="mt-4">{t("pages.notFound.description")}</Prose>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">{t("pages.notFound.primaryCta")}</ButtonLink>
          <ButtonLink href="/support" variant="secondary">
            {t("pages.notFound.secondaryCta")}
          </ButtonLink>
        </div>
        <p className="mt-10 text-sm text-ink-soft">
          <ContinueLinks
            template={continueTemplate}
            ride={t("pages.notFound.links.ride")}
            airport={t("pages.notFound.links.airport")}
            tours={t("pages.notFound.links.tours")}
          />
        </p>
      </Container>
    </div>
  );
}
