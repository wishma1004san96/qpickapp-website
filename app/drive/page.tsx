import type { Metadata } from "next";
import { DriveContent } from "@/components/pages/drive-content";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

export async function generateMetadata(): Promise<Metadata> {
  const t = createTranslator(getMessages(await getLocale()));
  return {
    title: t("pages.drive.meta.title"),
    description: t("pages.drive.meta.description"),
  };
}

export default function DrivePage() {
  return <DriveContent />;
}
