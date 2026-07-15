import type { Metadata } from "next";
import { DestinationStrip } from "@/components/marketing/destination-strip";
import { DriveWithQPick } from "@/components/marketing/drive-with-qpick";
import { ExperienceQPick } from "@/components/marketing/experience-qpick";
import { FinalCta } from "@/components/marketing/final-cta";
import { FleetListStage } from "@/components/marketing/fleet-list-stage";
import { HomeHero } from "@/components/marketing/home-hero";
import { HeroTrustSection } from "@/components/marketing/hero-trust-section";
import { HowQPickWorks } from "@/components/marketing/how-qpick-works";
import { InsideQPickApp } from "@/components/marketing/inside-qpick-app";
import { SafetyChecklist } from "@/components/marketing/safety-checklist";
import { ThreeExperiences } from "@/components/marketing/three-experiences";
import { TripIntentSwitcher } from "@/components/marketing/trip-intent-switcher";
import { YourJourneyYourRules } from "@/components/marketing/your-journey-your-rules";
import { Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  return {
    title: {
      absolute: t("pages.home.meta.title"),
    },
    description: t("pages.home.meta.description"),
  };
}

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HeroTrustSection />
      <FleetListStage />
      <ExperienceQPick />
      <HowQPickWorks />
      <InsideQPickApp />
      <ThreeExperiences />
      <YourJourneyYourRules />
      <Section tone="foam">
        <TripIntentSwitcher />
      </Section>
      <DestinationStrip />
      <DriveWithQPick />
      <Section tone="foam">
        <SafetyChecklist />
      </Section>
      <FinalCta />
    </>
  );
}
