import type { Metadata } from "next";
import { TermsContent } from "@/components/pages/terms-content";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  return {
    title: t("pages.legal.terms.meta.title"),
    description: t("pages.legal.terms.meta.description"),
  };
}

export default function TermsPage() {
  return <TermsContent />;
}
