import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DestinationSlugContent } from "@/components/pages/destination-slug-content";
import { destinations, getDestination } from "@/lib/destinations";
import { getLocale } from "@/lib/i18n/get-locale";
import { getMessages } from "@/lib/i18n/get-messages";
import { createTranslator } from "@/lib/i18n/t";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const messages = getMessages(await getLocale());
  const t = createTranslator(messages);
  const destination = getDestination(slug);
  if (!destination) {
    return { title: t("pages.destinationsSlug.metaFallbackTitle") };
  }
  const copy = messages.destinations[destination.slug];
  return {
    title: copy.name,
    description: copy.summary,
  };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  if (!getDestination(slug)) notFound();
  return <DestinationSlugContent slug={slug} />;
}
