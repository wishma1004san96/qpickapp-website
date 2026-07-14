import type { Metadata } from "next";
import { AirportContent } from "@/components/pages/airport-content";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  return {
    title: t("pages.airport.meta.title"),
    description: t("pages.airport.meta.description"),
  };
}

export default function AirportPage() {
  return <AirportContent />;
}
