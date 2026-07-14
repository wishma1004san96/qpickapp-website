import type { Metadata } from "next";
import { PartnersContent } from "@/components/pages/partners-content";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  return {
    title: t("pages.partners.meta.title"),
    description: t("pages.partners.meta.description"),
  };
}

export default function PartnersPage() {
  return <PartnersContent />;
}
