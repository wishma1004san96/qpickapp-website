import type { Metadata } from "next";
import { DestinationsContent } from "@/components/pages/destinations-content";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  return {
    title: t("pages.destinations.meta.title"),
    description: t("pages.destinations.meta.description"),
  };
}

export default function DestinationsPage() {
  return <DestinationsContent />;
}
