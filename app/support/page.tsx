import type { Metadata } from "next";
import { SupportContent } from "@/components/pages/support-content";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  return {
    title: t("pages.support.meta.title"),
    description: t("pages.support.meta.description"),
  };
}

export default function SupportPage() {
  return <SupportContent />;
}
