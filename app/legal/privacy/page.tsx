import type { Metadata } from "next";
import { PrivacyContent } from "@/components/pages/privacy-content";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  return {
    title: t("pages.legal.privacy.meta.title"),
    description: t("pages.legal.privacy.meta.description"),
  };
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}
