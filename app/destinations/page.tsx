import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell } from "@/components/marketing/page-shell";
import { destinations } from "@/lib/destinations";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Explore Q Pick destinations across Sri Lanka — Colombo, Galle, Ella, Sigiriya, and more.",
};

export default function DestinationsPage() {
  return (
    <PageShell
      title="Destinations"
      description="Places framed for how you travel — harbour roads, fort walls, highland mist, and the cultural triangle."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {destinations.map((d) => (
          <Link
            key={d.slug}
            href={`/destinations/${d.slug}`}
            className="group overflow-hidden rounded-[var(--radius-lg)] border border-mist bg-paper"
          >
            <div className="relative aspect-[16/10]">
              <Image
                src={d.image}
                alt={d.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 ease-[var(--ease-cinematic)] group-hover:scale-[1.03]"
              />
            </div>
            <div className="p-5">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-soft">
                {d.region}
              </p>
              <h2 className="mt-1 font-display text-2xl text-ink">{d.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{d.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
