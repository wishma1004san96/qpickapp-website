import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { UIHeading, Prose } from "@/components/ui/typography";
import { destinations } from "@/lib/destinations";

export function DestinationStrip() {
  return (
    <Reveal>
      <div className="bg-map-void py-16 text-foam sm:py-24 lg:py-32">
        <Container>
          <div className="mb-10 max-w-xl">
            <UIHeading className="text-foam">The island, not just the city</UIHeading>
            <Prose className="mt-4 text-foam/70">
              From harbour roads to highland mist — destinations framed for how you
              actually travel.
            </Prose>
          </div>
        </Container>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 lg:mx-auto lg:max-w-6xl lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-8 [&::-webkit-scrollbar]:hidden">
          {destinations.map((d) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              className="group relative min-w-[78vw] shrink-0 snap-center overflow-hidden rounded-[var(--radius-lg)] sm:min-w-[42vw] lg:min-w-0"
            >
              <div className="relative aspect-[3/4] bg-map-void">
                <Image
                  src={d.image}
                  alt={d.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 80vw, 25vw"
                  className="object-cover transition-transform duration-[700ms] ease-[var(--ease-cinematic)] motion-safe:group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-map-void/90 via-map-void/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-foam/60">
                    {d.region}
                  </p>
                  <p className="mt-1 font-display text-2xl text-foam">{d.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Container className="mt-8">
          <Link
            href="/destinations"
            className="inline-flex min-h-11 items-center text-sm font-medium text-foam/80 transition-colors hover:text-foam"
          >
            All destinations
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </Link>
        </Container>
      </div>
    </Reveal>
  );
}
