"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";

type FeaturedDestination = {
  slug: "sigiriya" | "ella" | "galle";
  name: string;
  label: string;
  blurb: string;
  image: string;
  objectPosition: string;
  href: string;
};

const FEATURED: FeaturedDestination[] = [
  {
    slug: "sigiriya",
    name: "Sigiriya",
    label: "Cultural Triangle",
    blurb: "Ancient wonders surrounded by breathtaking landscapes.",
    image: "/images/app/backgrounds/sigiriya-bg.webp",
    objectPosition: "center 40%",
    href: "/destinations/sigiriya",
  },
  {
    slug: "ella",
    name: "Ella",
    label: "Hill Country",
    blurb: "Tea country, mountain railways and peaceful escapes.",
    image: "/images/app/backgrounds/ella-bg.webp",
    objectPosition: "center 45%",
    href: "/destinations/ella",
  },
  {
    slug: "galle",
    name: "Galle",
    label: "Southern Coast",
    blurb: "Historic coastal charm with luxury seaside experiences.",
    image: "/images/app/backgrounds/galle-bg.webp",
    objectPosition: "center 50%",
    href: "/destinations/galle",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_MS = 4000;

function DestinationCard({
  dest,
  priority,
  className = "",
}: {
  dest: FeaturedDestination;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={dest.href}
      className={`group relative block h-[17rem] overflow-hidden rounded-[24px] border border-white/10 bg-[#0a121c] shadow-[0_1px_0_rgb(255_255_255_/_0.08)_inset,0_20px_40px_rgb(0_0_0_/_0.35)] outline-none transition-[box-shadow,border-color] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#c9a46c]/35 hover:shadow-[0_1px_0_rgb(255_255_255_/_0.1)_inset,0_28px_52px_rgb(0_0_0_/_0.45)] focus-visible:ring-2 focus-visible:ring-[#0193fb]/45 sm:h-[18.5rem] lg:h-[19rem] ${className}`}
    >
      <Image
        src={dest.image}
        alt={`${dest.name} — ${dest.blurb}`}
        fill
        sizes="(max-width: 1023px) 100vw, 32vw"
        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.07]"
        style={{ objectPosition: dest.objectPosition }}
        priority={priority}
      />

      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_11_18_/_0.15)_0%,rgb(5_11_18_/_0.35)_42%,rgb(5_11_18_/_0.88)_100%)] transition-opacity duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-75"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_100%,rgb(201_164_108_/_0.12),transparent_70%)] opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-col p-5 sm:p-6">
        <span
          className="mb-3 h-px w-8 origin-left scale-x-75 bg-[#c9a46c]/70 transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-hover:bg-[#e4c99a]"
          aria-hidden="true"
        />
        <p className="font-mono text-[0.625rem] tracking-[0.18em] text-[#f3f6f7]/55 uppercase">
          {dest.label}
        </p>
        <p className="mt-1.5 font-display text-[1.35rem] font-semibold tracking-[-0.025em] text-balance text-[#f3f6f7] transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:-translate-y-1 sm:text-[1.7rem]">
          {dest.name}
        </p>
        <p className="mt-2 max-w-[18rem] text-[0.8125rem] leading-snug text-pretty text-[#f3f6f7]/68 sm:text-[0.875rem]">
          {dest.blurb}
        </p>
        <span className="mt-3 inline-flex translate-y-0 items-center text-sm font-medium text-[#e4c99a] opacity-90 transition-[opacity,transform] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
          Explore →
        </span>
      </div>
    </Link>
  );
}

function DestinationsMobileCarousel({
  reduceMotion,
}: {
  reduceMotion: boolean;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const autoplay = useRef(
    Autoplay({
      delay: AUTOPLAY_MS,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      playOnInit: false,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      duration: reduceMotion ? 10 : 24,
    },
    reduceMotion ? [] : [autoplay.current],
  );

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(
          (entry?.isIntersecting ?? false) &&
            (entry?.intersectionRatio ?? 0) >= 0.25,
        );
      },
      { threshold: [0, 0.25, 0.5, 1] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion || !emblaApi) return;
    if (inView) autoplay.current.play();
    else autoplay.current.stop();
  }, [emblaApi, inView, reduceMotion]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    const onPointerDown = () => {
      if (!reduceMotion) autoplay.current.stop();
    };
    const onSettle = () => {
      if (!reduceMotion && inView) autoplay.current.play();
    };
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("settle", onSettle);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi, inView, reduceMotion]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      if (!reduceMotion && inView) {
        autoplay.current.reset();
        autoplay.current.play();
      }
    },
    [emblaApi, inView, reduceMotion],
  );

  return (
    <div ref={rootRef} className="lg:hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {FEATURED.map((dest, index) => (
            <div
              key={dest.slug}
              className="min-w-0 shrink-0 grow-0 basis-full px-0"
            >
              <DestinationCard
                dest={dest}
                priority={false}
                className="h-[17.5rem] w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-5 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Destination slides"
      >
        {FEATURED.map((dest, index) => (
          <button
            key={dest.slug}
            type="button"
            role="tab"
            aria-selected={index === selectedIndex}
            aria-label={`Show ${dest.name}`}
            className={`relative h-11 min-w-11 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0193fb]/45 ${
              index === selectedIndex ? "w-11" : "w-11"
            }`}
            onClick={() => scrollTo(index)}
          >
            <span
              className={`absolute top-1/2 left-1/2 block h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,background-color] duration-300 ${
                index === selectedIndex
                  ? "w-6 bg-[#e4c99a]"
                  : "w-1.5 bg-white/30"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Popular Destinations — compact editorial showcase.
 * Mobile: Embla carousel. Desktop: 3-column grid (unchanged).
 */
export function DestinationStrip() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="relative isolate overflow-hidden bg-[#050b12] py-10 text-[#f3f6f7] sm:py-14 lg:py-16"
      aria-labelledby="popular-destinations-heading"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 h-[22rem] w-[22rem] translate-x-1/4 -translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgb(201_164_108_/_0.14)_0%,transparent_70%)] blur-[90px]" />
        <div className="absolute bottom-0 left-0 h-[20rem] w-[20rem] -translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgb(1_147_251_/_0.12)_0%,transparent_70%)] blur-[90px]" />
      </div>

      <Container className="relative z-[1]">
        <div className="mb-6 flex flex-col gap-5 sm:mb-8 sm:gap-6 lg:mb-9 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-[#e4c99a] uppercase">
              Discover Sri Lanka
            </p>
            <h2
              id="popular-destinations-heading"
              className="mt-3 font-display text-[clamp(1.75rem,3.2vw,2.55rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-balance"
            >
              Extraordinary destinations,
              <br className="hidden sm:block" /> crafted for unforgettable
              journeys.
            </h2>
            <p className="mt-3.5 max-w-xl text-[0.95rem] leading-relaxed text-pretty text-[#f3f6f7]/65 sm:text-[1rem]">
              Explore a curated collection of Sri Lanka&apos;s most iconic
              experiences with professional chauffeurs and personalised
              itineraries.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08, ease: EASE }}
            className="shrink-0"
          >
            <Link
              href="/tours"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/14 bg-white/[0.06] px-6 text-sm font-medium text-[#f3f6f7] shadow-[0_1px_0_rgb(255_255_255_/_0.1)_inset] backdrop-blur-md transition-[background-color,border-color,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#c9a46c]/45 hover:bg-white/[0.1] hover:shadow-[0_12px_28px_rgb(0_0_0_/_0.28)] motion-safe:hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0193fb]/45"
            >
              Explore Tours →
            </Link>
          </motion.div>
        </div>

        <DestinationsMobileCarousel reduceMotion={reduceMotion} />

        <div
          className="hidden gap-5 lg:grid lg:grid-cols-3"
          role="list"
        >
          {FEATURED.map((dest, index) => (
            <motion.div
              key={dest.slug}
              role="listitem"
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{
                duration: 0.55,
                delay: reduceMotion ? 0 : 0.1 + index * 0.1,
                ease: EASE,
              }}
            >
              <DestinationCard dest={dest} priority={false} />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
