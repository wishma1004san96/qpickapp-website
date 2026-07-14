import type { Metadata } from "next";
import { ToursContent } from "@/components/pages/tours-content";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  return {
    title: t("pages.tours.meta.title"),
    description: t("pages.tours.meta.description"),
  };
}

export default function ToursPage() {
  return <ToursContent />;
}
