import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PageShell } from "@/components/marketing/page-shell";
import { destinations, getDestination } from "@/lib/destinations";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) return { title: "Destination" };
  return {
    title: destination.name,
    description: destination.summary,
  };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) notFound();

  return (
    <PageShell
      title={destination.name}
      description={destination.summary}
      primaryCta={{ href: "/ride", label: "Book a ride" }}
      secondaryCta={{ href: "/tours", label: "Explore tours" }}
    >
      <div className="overflow-hidden rounded-[var(--radius-lg)]">
        <div className="relative aspect-[21/9] min-h-56 bg-mist">
          <Image
            src={destination.image}
            alt={destination.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
      <p className="mt-6 font-mono text-xs tracking-[0.16em] text-ink-soft">
        {destination.region}
      </p>
    </PageShell>
  );
}
