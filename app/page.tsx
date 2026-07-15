import type { Metadata } from "next";
import { DestinationStrip } from "@/components/marketing/destination-strip";
import { DownloadQPickApps } from "@/components/marketing/download-qpick-apps";
import { DriveWithQPick } from "@/components/marketing/drive-with-qpick";
import { ExperienceQPick } from "@/components/marketing/experience-qpick";
import { FinalCta } from "@/components/marketing/final-cta";
import { FleetListStage } from "@/components/marketing/fleet-list-stage";
import { HomeHero } from "@/components/marketing/home-hero";
import { HowQPickWorks } from "@/components/marketing/how-qpick-works";
import { JourneyStory } from "@/components/marketing/journey-story";
import { PartnerDriverSplit } from "@/components/marketing/partner-driver-split";
import { PrivateToursPreview } from "@/components/marketing/private-tours-preview";
import { SafetyChecklist } from "@/components/marketing/safety-checklist";
import { StepTimeline } from "@/components/marketing/step-timeline";
import { TripIntentSwitcher } from "@/components/marketing/trip-intent-switcher";
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
      <ExperienceQPick />
      <FleetListStage />
      <HowQPickWorks />
      <JourneyStory />
      <Section tone="foam">
        <TripIntentSwitcher />
      </Section>
      <Section tone="paper" className="border-y border-mist">
        <StepTimeline />
      </Section>
      <DestinationStrip />
      <PrivateToursPreview />
      <Section tone="foam">
        <SafetyChecklist />
      </Section>
      <DownloadQPickApps />
      <Section tone="foam" className="pt-0 sm:pt-0 lg:pt-0">
        <PartnerDriverSplit />
      </Section>
      <DriveWithQPick />
      <FinalCta />
    </>
  );
}
