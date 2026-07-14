import type { Metadata } from "next";
import { NotFoundContent } from "@/components/pages/not-found-content";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  const metaTitle = t("pages.notFound.meta.title");
  const metaDescription = t("pages.notFound.meta.description");
  return {
    title:
      metaTitle === "pages.notFound.meta.title"
        ? t("pages.notFound.title")
        : metaTitle,
    description:
      metaDescription === "pages.notFound.meta.description"
        ? t("pages.notFound.description")
        : metaDescription,
  };
}

export default function NotFound() {
  return <NotFoundContent />;
}
