import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { FleetListStage } from "@/components/marketing/fleet-list-stage";
import { HomeHero } from "@/components/marketing/home-hero";
import { Section } from "@/components/ui/section";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

/** Below-fold sections — split from the initial JS bundle. */
const ExperienceQPick = dynamic(
  () =>
    import("@/components/marketing/experience-qpick").then((m) => ({
      default: m.ExperienceQPick,
    })),
  { ssr: true },
);
const HowQPickWorks = dynamic(
  () =>
    import("@/components/marketing/how-qpick-works").then((m) => ({
      default: m.HowQPickWorks,
    })),
  { ssr: true },
);
const InsideQPickApp = dynamic(
  () =>
    import("@/components/marketing/inside-qpick-app").then((m) => ({
      default: m.InsideQPickApp,
    })),
  { ssr: true },
);
const ThreeExperiences = dynamic(
  () =>
    import("@/components/marketing/three-experiences").then((m) => ({
      default: m.ThreeExperiences,
    })),
  { ssr: true },
);
const YourJourneyYourRules = dynamic(
  () =>
    import("@/components/marketing/your-journey-your-rules").then((m) => ({
      default: m.YourJourneyYourRules,
    })),
  { ssr: true },
);
const TripIntentSwitcher = dynamic(
  () =>
    import("@/components/marketing/trip-intent-switcher").then((m) => ({
      default: m.TripIntentSwitcher,
    })),
  { ssr: true },
);
const DestinationStrip = dynamic(
  () =>
    import("@/components/marketing/destination-strip").then((m) => ({
      default: m.DestinationStrip,
    })),
  { ssr: true },
);
const DriveWithQPick = dynamic(
  () =>
    import("@/components/marketing/drive-with-qpick").then((m) => ({
      default: m.DriveWithQPick,
    })),
  { ssr: true },
);
const SafetyChecklist = dynamic(
  () =>
    import("@/components/marketing/safety-checklist").then((m) => ({
      default: m.SafetyChecklist,
    })),
  { ssr: true },
);
const FinalCta = dynamic(
  () =>
    import("@/components/marketing/final-cta").then((m) => ({
      default: m.FinalCta,
    })),
  { ssr: true },
);

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
      <SafetyChecklist />
      <FinalCta />
    </>
  );
}
