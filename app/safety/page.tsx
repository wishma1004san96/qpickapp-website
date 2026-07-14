import type { Metadata } from "next";
import { SafetyContent } from "@/components/pages/safety-content";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  return {
    title: t("pages.safety.meta.title"),
    description: t("pages.safety.meta.description"),
  };
}

export default function SafetyPage() {
  return <SafetyContent />;
}
