import type { Metadata } from "next";
import { AboutContent } from "@/components/pages/about-content";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  return {
    title: t("pages.about.meta.title"),
    description: t("pages.about.meta.description"),
  };
}

export default function AboutPage() {
  return <AboutContent />;
}
