"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { heroMedia } from "@/lib/hero-media";
import { siteConfig } from "@/lib/site";

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

type JourneyIntent = "arrive" | "stay" | "explore";

const intents: readonly {
  id: JourneyIntent;
  label: string;
  href: string;
}[] = [
  { id: "arrive", label: "Arrive", href: "/airport" },
  { id: "stay", label: "Stay", href: "/ride" },
  { id: "explore", label: "Explore", href: "/tours" },
] as const;

const intentCopy: Record<
  JourneyIntent,
  {
    fromLabel: string;
    fromDefault: string;
    toLabel: string;
    toDefault: string;
    recommendation: string;
  }
> = {
  arrive: {
    fromLabel: "Arriving at",
    fromDefault: "Colombo Airport (CMB)",
    toLabel: "Staying at",
    toDefault: "Galle Face Hotel",
    recommendation:
      "Meet at arrivals · Hotel kept informed · Fare clear before you confirm",
  },
  stay: {
    fromLabel: "From",
    fromDefault: "Your hotel",
    toLabel: "To",
    toDefault: "Galle Fort",
    recommendation:
      "Verified driver · Live updates you can share · Transparent pricing",
  },
  explore: {
    fromLabel: "Starting from",
    fromDefault: "Colombo",
    toLabel: "Towards",
    toDefault: "Ella & the highlands",
    recommendation:
      "Day-ready vehicle · Driver who knows the roads · One calm itinerary",
  },
};

export function HomeHero() {
  const [scrolledPast, setScrolledPast] = useState(false);
  const hasVideo = Boolean(heroMedia.videoSrc);

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-map-void text-foam"
      aria-label="Q Pick introduction"
    >
      <HeroMedia hasVideo={hasVideo} />

      <Container className="relative z-10 flex w-full flex-col pb-10 pt-28 sm:pb-14 lg:pb-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end lg:gap-16">
          <div className="max-w-xl">
            <p
              className="font-display text-[clamp(2.75rem,8vw,5.25rem)] leading-[0.95] tracking-[-0.03em] text-foam reveal-up"
              style={{ animationDelay: "40ms" }}
            >
              Q&nbsp;Pick
            </p>

            <h1
              className="mt-6 font-display text-[clamp(1.65rem,3.6vw,2.65rem)] leading-[1.12] tracking-tight text-foam text-balance reveal-up"
              style={{ animationDelay: "120ms" }}
            >
              {siteConfig.tagline}
            </h1>

            <p
              className="mt-6 max-w-[34ch] text-base leading-relaxed text-foam/75 sm:text-lg reveal-up"
              style={{ animationDelay: "200ms" }}
            >
              A private concierge for how Sri Lanka moves — from the airport to
              the coast, with calm certainty at every step.
            </p>

            <div
              className="mt-9 flex flex-wrap gap-3 reveal-up"
              style={{ animationDelay: "280ms" }}
            >
              <ButtonLink href="/airport" size="lg">
                Begin your journey
              </ButtonLink>
              <ButtonLink
                href="/tours"
                size="lg"
                variant="onDark"
                className="border border-foam/25 bg-foam/10 text-foam backdrop-blur-md hover:bg-foam/18 hover:text-foam"
              >
                Discover the island
              </ButtonLink>
            </div>
          </div>

          <div className="reveal-up" style={{ animationDelay: "360ms" }}>
            <JourneyPlanner />
            <TrustRow />
          </div>
        </div>
      </Container>

      <button
        type="button"
        onClick={() => {
          const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          window.scrollTo({
            top: Math.round(window.innerHeight * 0.92),
            behavior: reduce ? "auto" : "smooth",
          });
        }}
        className={[
          "absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-foam/55 transition-opacity duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
          scrolledPast ? "pointer-events-none opacity-0" : "opacity-100",
        ].join(" ")}
        aria-label="Scroll to content"
      >
        <span className="font-mono text-[0.65rem] tracking-[0.2em] uppercase">
          Scroll
        </span>
        <span
          aria-hidden="true"
          className="flex h-8 w-5 items-start justify-center rounded-full border border-foam/35 pt-1.5"
        >
          <span className="scroll-dot h-1.5 w-1 rounded-full bg-foam/80" />
        </span>
      </button>
    </section>
  );
}

function HeroMedia({ hasVideo }: { hasVideo: boolean }) {
  return (
    <div className="absolute inset-0">
      {hasVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={heroMedia.poster.src}
          aria-hidden="true"
        >
          <source src={heroMedia.videoSrc} type="video/mp4" />
        </video>
      ) : null}

      <Image
        src={heroMedia.poster.src}
        alt={heroMedia.poster.alt}
        fill
        priority
        sizes="100vw"
        placeholder="blur"
        blurDataURL={BLUR}
        className={[
          "object-cover",
          hasVideo ? "motion-reduce:block hidden" : "ken-burns",
        ].join(" ")}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-map-void via-map-void/45 to-map-void/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-map-void/55 via-map-void/15 to-transparent" />
    </div>
  );
}

function JourneyPlanner() {
  const router = useRouter();
  const baseId = useId();
  const [intent, setIntent] = useState<JourneyIntent>("arrive");
  const copy = intentCopy[intent];
  const activeHref = useMemo(
    () => intents.find((item) => item.id === intent)?.href ?? "/airport",
    [intent],
  );

  return (
    <form
      className="rounded-[var(--radius-lg)] border border-foam/20 bg-foam/12 p-5 shadow-[0_8px_32px_rgb(7_16_24_/_0.28)] backdrop-blur-xl supports-[backdrop-filter]:bg-foam/10 sm:p-6"
      aria-label="Plan your journey"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const params = new URLSearchParams();
        const from = String(data.get("from") ?? "").trim();
        const to = String(data.get("to") ?? "").trim();
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        params.set("intent", intent);
        const query = params.toString();
        router.push(query ? `${activeHref}?${query}` : activeHref);
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="font-display text-xl tracking-tight text-foam sm:text-2xl">
          Plan your journey
        </p>
        <p className="max-w-[36ch] text-sm leading-relaxed text-foam/60">
          Tell us how you wish to move. We’ll arrange the rest with quiet care.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Journey type"
        className="mt-6 flex gap-1 rounded-[var(--radius-md)] border border-foam/15 bg-map-void/30 p-1"
      >
        {intents.map((item) => {
          const selected = item.id === intent;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setIntent(item.id)}
              className={[
                "min-h-11 flex-1 rounded-[var(--radius-sm)] px-3 text-sm font-medium transition-[background-color,color] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
                selected
                  ? "bg-foam/95 text-ink"
                  : "text-foam/70 hover:bg-foam/5 hover:text-foam",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${baseId}-from`}
            className="text-xs font-medium tracking-wide text-foam/70"
          >
            {copy.fromLabel}
          </label>
          <input
            key={`${intent}-from`}
            id={`${baseId}-from`}
            name="from"
            type="text"
            defaultValue={copy.fromDefault}
            autoComplete="street-address"
            className="min-h-12 rounded-[var(--radius-md)] border border-foam/20 bg-map-void/35 px-3.5 text-sm text-foam outline-none transition-[border-color] duration-[var(--duration-ui)] placeholder:text-foam/40 focus:border-lagoon"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${baseId}-to`}
            className="text-xs font-medium tracking-wide text-foam/70"
          >
            {copy.toLabel}
          </label>
          <input
            key={`${intent}-to`}
            id={`${baseId}-to`}
            name="to"
            type="text"
            defaultValue={copy.toDefault}
            autoComplete="street-address"
            className="min-h-12 rounded-[var(--radius-md)] border border-foam/20 bg-map-void/35 px-3.5 text-sm text-foam outline-none transition-[border-color] duration-[var(--duration-ui)] placeholder:text-foam/40 focus:border-lagoon"
          />
        </div>
      </div>

      <p
        key={intent}
        className="mt-5 border-t border-foam/12 pt-4 text-sm leading-relaxed text-foam/70 animate-[fade-in_var(--duration-ui)_var(--ease-cinematic)]"
        aria-live="polite"
      >
        {copy.recommendation}
      </p>

      <button
        type="submit"
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-lagoon px-5 text-sm font-medium text-paper transition-colors duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:bg-lagoon-deep"
      >
        Continue
      </button>
    </form>
  );
}

function TrustRow() {
  return (
    <ul
      className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-sm text-foam/65"
      aria-label="Why guests trust Q Pick"
    >
      <li>Verified drivers</li>
      <li className="hidden h-3 w-px bg-foam/25 sm:block" aria-hidden="true" />
      <li>Hotel coordination</li>
      <li className="hidden h-3 w-px bg-foam/25 sm:block" aria-hidden="true" />
      <li>Clear pricing</li>
    </ul>
  );
}
