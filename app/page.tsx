import type { Metadata } from "next";
import { DestinationStrip } from "@/components/marketing/destination-strip";
import { ExperienceQPick } from "@/components/marketing/experience-qpick";
import { FinalCta } from "@/components/marketing/final-cta";
import { HomeHero } from "@/components/marketing/home-hero";
import { JourneyStory } from "@/components/marketing/journey-story";
import { PartnerDriverSplit } from "@/components/marketing/partner-driver-split";
import { SafetyChecklist } from "@/components/marketing/safety-checklist";
import { StepTimeline } from "@/components/marketing/step-timeline";
import { TripIntentSwitcher } from "@/components/marketing/trip-intent-switcher";
import { Section } from "@/components/ui/section";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} · ${siteConfig.tagline}`,
  },
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <ExperienceQPick />
      <JourneyStory />
      <Section tone="foam">
        <TripIntentSwitcher />
      </Section>
      <Section tone="paper" className="border-y border-mist">
        <StepTimeline />
      </Section>
      <DestinationStrip />
      <Section tone="foam">
        <SafetyChecklist />
      </Section>
      <Section tone="foam" className="pt-0 sm:pt-0 lg:pt-0">
        <PartnerDriverSplit />
      </Section>
      <FinalCta />
    </>
  );
}
