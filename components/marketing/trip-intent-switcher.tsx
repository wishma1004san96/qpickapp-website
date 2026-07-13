"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { UIHeading, Prose } from "@/components/ui/typography";

const intents = [
  {
    id: "ride",
    label: "Ride",
    title: "City and intercity, on your clock",
    body: "Request a verified driver for Colombo streets or the long coastal run. Transparent fares before you confirm.",
    href: "/ride",
    cta: "How rides work",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Colombo coast at dusk — city journeys with certainty",
  },
  {
    id: "airport",
    label: "Airport",
    title: "CMB arrivals without the scramble",
    body: "Meet-and-greet transfers timed to your flight. Hotels and villas stay in the loop from gate to door.",
    href: "/airport",
    cta: "Book a transfer",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Coastal road toward southern Sri Lanka after landing",
  },
  {
    id: "tour",
    label: "Tour",
    title: "Island days, curated with care",
    body: "Day trips and multi-stop journeys with drivers who know tea country roads, fort towns, and temple timing.",
    href: "/tours",
    cta: "Explore tours",
    image:
      "https://images.unsplash.com/photo-1711797750174-c3750dd9d7c9?auto=format&fit=crop&w=1600&q=85",
    imageAlt: "Sigiriya and cultural triangle landscapes for day journeys",
  },
] as const;

export function TripIntentSwitcher() {
  const [active, setActive] = useState<(typeof intents)[number]["id"]>("ride");
  const current = intents.find((i) => i.id === active) ?? intents[0];

  return (
    <Reveal>
      <Container>
        <div className="mb-10 max-w-xl">
          <UIHeading>Choose how you move</UIHeading>
          <Prose className="mt-4">
            One standard for daily rides, airport certainty, and island exploration.
          </Prose>
        </div>

        <div
          role="tablist"
          aria-label="Trip intent"
          className="mb-8 flex gap-1 overflow-x-auto border-b border-mist pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {intents.map((intent) => {
            const selected = intent.id === active;
            return (
              <button
                key={intent.id}
                type="button"
                role="tab"
                aria-selected={selected}
                id={`intent-tab-${intent.id}`}
                className={`relative min-h-11 shrink-0 px-4 text-sm font-medium transition-colors duration-[var(--duration-ui)] ${
                  selected ? "text-ink" : "text-ink-soft hover:text-ink-muted"
                }`}
                onClick={() => setActive(intent.id)}
              >
                {intent.label}
                <span
                  className={`absolute inset-x-3 -bottom-px h-0.5 origin-left bg-brand transition-transform duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] ${
                    selected ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          aria-labelledby={`intent-tab-${current.id}`}
          className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
        >
          <div className="order-2 lg:order-1">
            <h3 className="text-h3 font-medium text-ink">{current.title}</h3>
            <p className="mt-4 max-w-md text-ink-muted leading-relaxed">
              {current.body}
            </p>
            <Link
              href={current.href}
              className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-brand transition-colors hover:text-brand-deep"
            >
              {current.cta}
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </div>
          <div className="order-1 overflow-hidden rounded-[var(--radius-lg)] lg:order-2">
            <div className="relative aspect-[4/3] bg-mist sm:aspect-[16/11]">
              <Image
                key={current.image}
                src={current.image}
                alt={current.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover motion-safe:animate-[fade-in_var(--duration-ui)_var(--ease-cinematic)]"
              />
            </div>
          </div>
        </div>
      </Container>
    </Reveal>
  );
}
