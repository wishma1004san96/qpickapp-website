"use client";

import { useMemo } from "react";
import { useMessages, useTranslations } from "@/components/i18n/locale-provider";
import { BankingPartnerSection } from "@/components/marketing/banking-partner-section";
import { JsonLd } from "@/components/tours/json-ld";
import { ToursExperience } from "@/components/tours/tours-experience";
import { hubString } from "@/lib/i18n/catalog-string";
import {
  localizeCategory,
  localizeDestination,
  localizeFaq,
  localizePackage,
  localizeTrust,
  localizeVehicle,
} from "@/lib/tours/localize";
import {
  getAllDestinations,
  getAllPackages,
  getAllVehicles,
  getBookHref,
  getCategories,
  getFinalCta,
  getGalleryImage,
  getHubFaqs,
  getHubHero,
  getReviews,
  getReviewsSectionMeta,
  getTrustSignals,
} from "@/lib/tours/repository";
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildPackageListJsonLd,
} from "@/lib/tours/schema";

export function ToursHub() {
  const messages = useMessages();
  const t = useTranslations();

  const heroRaw = getHubHero();
  const hero = useMemo(
    () => ({
      ...heroRaw,
      eyebrow: hubString(messages, "hero.eyebrow", heroRaw.eyebrow),
      headline: hubString(messages, "hero.headline", heroRaw.headline),
      subtitle: hubString(messages, "hero.subtitle", heroRaw.subtitle),
      primaryCta: {
        ...heroRaw.primaryCta,
        label: hubString(
          messages,
          "hero.primaryCta",
          heroRaw.primaryCta.label,
        ),
      },
      secondaryCta: {
        ...heroRaw.secondaryCta,
        label: hubString(
          messages,
          "hero.secondaryCta",
          heroRaw.secondaryCta.label,
        ),
      },
    }),
    [messages, heroRaw],
  );

  const finalCtaRaw = getFinalCta();
  const finalCta = useMemo(
    () => ({
      ...finalCtaRaw,
      headline: hubString(messages, "finalCta.headline", finalCtaRaw.headline),
      body: hubString(messages, "finalCta.body", finalCtaRaw.body),
      ctaLabel: hubString(messages, "finalCta.ctaLabel", finalCtaRaw.ctaLabel),
      secondaryLabel: finalCtaRaw.secondaryLabel
        ? hubString(
            messages,
            "finalCta.secondaryLabel",
            finalCtaRaw.secondaryLabel,
          )
        : undefined,
    }),
    [messages, finalCtaRaw],
  );

  const packages = useMemo(
    () => getAllPackages().map((pkg) => localizePackage(messages, pkg)),
    [messages],
  );
  const destinations = useMemo(
    () => getAllDestinations().map((d) => localizeDestination(messages, d)),
    [messages],
  );
  const categories = useMemo(
    () => getCategories().map((c) => localizeCategory(messages, c)),
    [messages],
  );
  const vehicles = useMemo(
    () => getAllVehicles().map((v) => localizeVehicle(messages, v)),
    [messages],
  );
  const trust = useMemo(
    () => getTrustSignals().map((s) => localizeTrust(messages, s)),
    [messages],
  );
  const faqs = useMemo(
    () => getHubFaqs().map((f) => localizeFaq(messages, f)),
    [messages],
  );

  const reviewsMetaRaw = getReviewsSectionMeta();
  const reviewsMeta = useMemo(
    () => ({
      title: hubString(messages, "reviewsMeta.title", reviewsMetaRaw.title),
      emptyTitle: hubString(
        messages,
        "reviewsMeta.emptyTitle",
        reviewsMetaRaw.emptyTitle,
      ),
      emptyBody: hubString(
        messages,
        "reviewsMeta.emptyBody",
        reviewsMetaRaw.emptyBody,
      ),
    }),
    [messages, reviewsMetaRaw],
  );

  const heroImage = getGalleryImage(hero.imageId);
  const finalCtaImage = getGalleryImage(finalCta.imageId);
  const reviews = getReviews();

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: t("toursHub.breadcrumbs.home"), path: "/" },
    { name: t("toursHub.breadcrumbs.tours"), path: "/tours" },
  ]);
  const faqLd = buildFaqPageJsonLd(faqs);
  const listLd = buildPackageListJsonLd(packages.filter((p) => p.popular));

  return (
    <>
      <JsonLd data={[breadcrumb, faqLd, listLd]} />
      <ToursExperience
        hero={hero}
        heroImage={heroImage}
        packages={packages}
        destinations={destinations}
        categories={categories}
        vehicles={vehicles}
        trust={trust}
        reviews={reviews}
        reviewsMeta={reviewsMeta}
        faqs={faqs}
        finalCta={finalCta}
        finalCtaImage={finalCtaImage}
        bookHref={getBookHref()}
      />
      <BankingPartnerSection />
    </>
  );
}
