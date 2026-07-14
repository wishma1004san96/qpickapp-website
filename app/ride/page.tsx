import type { Metadata } from "next";
import { RideContent } from "@/components/pages/ride-content";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  return {
    title: t("pages.ride.meta.title"),
    description: t("pages.ride.meta.description"),
  };
}

export default function RidePage() {
  return <RideContent />;
}
