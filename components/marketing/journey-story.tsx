import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";

type Chapter = {
  n: string;
  title: string;
  moment: string;
  scene: string;
  outcome: string;
  image: string;
  imageAlt: string;
  align: "left" | "right";
};

const chapters: readonly Chapter[] = [
  {
    n: "01",
    title: "Arrive",
    moment: "The island begins at the gate.",
    scene:
      "Your flight lands. A verified Q Pick driver is already waiting — not a scramble on the curb, not a chain of messages. Your hotel knows you are on the way before the car leaves the airport road.",
    outcome: "One handoff. From arrivals to the front desk.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80",
    imageAlt: "Colombo coast and city lights at dusk — the journey after landing",
    align: "left",
  },
  {
    n: "02",
    title: "Stay",
    moment: "Every move stays quiet and clear.",
    scene:
      "A coast run, a dinner reservation, a morning meeting. You see the fare before you confirm. While you ride, the people who matter can follow — family, host, or villa manager — without calling twice.",
    outcome: "Transparent pricing. Live status. No marketplace noise.",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=2000&q=80",
    imageAlt: "Southern Sri Lankan coastline with clear Indian Ocean water",
    align: "right",
  },
  {
    n: "03",
    title: "Explore",
    moment: "The island opens without friction.",
    scene:
      "Tea country mist. Fort towns. A day with more than one stop. The same trusted driver, the right vehicle for the roads ahead, and an itinerary held with care — so the place stays the point, not the logistics.",
    outcome: "Ride and tourism. One continuous standard.",
    image:
      "https://images.unsplash.com/photo-1711797750174-c3750dd9d7c9?auto=format&fit=crop&w=2000&q=85",
    imageAlt: "Sigiriya Rock Fortress rising from the Sri Lankan jungle",
    align: "left",
  },
] as const;

/**
 * Cinematic storytelling section — continuous journey chapters.
 * Not a feature grid. Answers: why Q Pick over Uber, PickMe, or a tour operator.
 */
export function JourneyStory() {
  return (
    <section
      aria-labelledby="journey-story-heading"
      className="bg-map-void text-foam"
    >
      <div className="border-b border-foam/10 bg-map-void">
        <Container className="py-20 sm:py-28 lg:py-32">
          <Reveal>
            <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand-bright uppercase">
              The Q Pick standard
            </p>
            <h2
              id="journey-story-heading"
              className="mt-5 max-w-[16ch] font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.1] tracking-tight text-balance"
            >
              One journey. One trusted standard.
            </h2>
            <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-foam/65 sm:text-lg">
              Not a marketplace. Not a brochure and a WhatsApp thread. A private
              concierge for how Sri Lanka moves — from the first landing to the
              last coastal road.
            </p>
          </Reveal>
        </Container>
      </div>

      <div className="relative">
        {chapters.map((chapter, index) => (
          <JourneyChapter
            key={chapter.n}
            chapter={chapter}
            isLast={index === chapters.length - 1}
          />
        ))}
      </div>

      <div className="border-t border-foam/10">
        <Container className="py-20 sm:py-28">
          <Reveal>
            <p className="max-w-[28ch] font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-snug tracking-tight text-foam text-balance">
              Across the entire journey — the same calm certainty.
            </p>
            <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-foam/60">
              Uber and PickMe move you across a city. Tour operators sell a day.
              Q Pick holds the whole story: airport, stay, and island — under one
              trusted standard.
            </p>
            <Link
              href="/"
              className="mt-10 inline-flex min-h-12 items-center text-sm font-medium text-foam transition-colors hover:text-brand-bright"
            >
              Plan your journey
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}

function JourneyChapter({
  chapter,
  isLast,
}: {
  chapter: Chapter;
  isLast: boolean;
}) {
  const textAside = chapter.align === "left" ? "lg:col-start-1" : "lg:col-start-2";

  return (
    <article
      className={[
        "relative min-h-[100svh] overflow-hidden",
        !isLast ? "border-b border-foam/10" : "",
      ].join(" ")}
      aria-labelledby={`chapter-${chapter.n}-title`}
    >
      <div className="absolute inset-0">
        <Image
          src={chapter.image}
          alt={chapter.imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-map-void/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-map-void via-map-void/40 to-map-void/25" />
        {chapter.align === "left" ? (
          <div className="absolute inset-0 bg-gradient-to-r from-map-void/70 via-map-void/35 to-transparent" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-l from-map-void/70 via-map-void/35 to-transparent" />
        )}
      </div>

      <Container className="relative flex min-h-[100svh] items-end py-20 sm:py-24 lg:items-center lg:py-28">
        <div className="grid w-full lg:grid-cols-2">
          <div className={`max-w-xl ${textAside}`}>
            <Reveal>
              <p className="font-mono text-[0.6875rem] tracking-[0.22em] text-foam/55">
                <span className="text-brand-bright">{chapter.n}</span>
                <span className="mx-3 text-foam/25" aria-hidden="true">
                  —
                </span>
                <span className="uppercase">{chapter.title}</span>
              </p>

              <h3
                id={`chapter-${chapter.n}-title`}
                className="mt-6 font-display text-[clamp(1.85rem,4vw,2.75rem)] leading-[1.12] tracking-tight text-balance"
              >
                {chapter.moment}
              </h3>

              <p className="mt-7 max-w-[38ch] text-base leading-[1.75] text-foam/75 sm:text-lg">
                {chapter.scene}
              </p>

              <p className="mt-10 max-w-[36ch] border-t border-foam/15 pt-6 text-sm leading-relaxed tracking-wide text-foam/90">
                {chapter.outcome}
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </article>
  );
}
