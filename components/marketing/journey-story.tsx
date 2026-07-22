"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Reveal } from "@/components/motion/reveal";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import { getDestinationImageSrc } from "@/lib/destination-image-catalog";

type ChapterKey = "arrive" | "stay" | "explore";

const CHAPTER_MEDIA: readonly {
  key: ChapterKey;
  image: string;
  align: "left" | "right";
}[] = [
  {
    key: "arrive",
    image: getDestinationImageSrc("negombo"),
    align: "left",
  },
  {
    key: "stay",
    image: getDestinationImageSrc("galle"),
    align: "right",
  },
  {
    key: "explore",
    image: getDestinationImageSrc("sigiriya"),
    align: "left",
  },
] as const;

/**
 * Cinematic storytelling section — continuous journey chapters.
 * Not a feature grid. Answers: why Q Pick over Uber, PickMe, or a tour operator.
 */
export function JourneyStory() {
  const t = useTranslations();
  const { journeyStory } = useMessages();

  return (
    <section
      aria-labelledby="journey-story-heading"
      className="bg-map-void text-foam"
    >
      <div className="border-b border-foam/10 bg-map-void">
        <Container className="py-[var(--section-y-sm)] sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]">
          <Reveal>
            <p className="locale-eyebrow font-mono text-[0.6875rem] tracking-[0.2em] text-brand-bright uppercase">
              {t("journeyStory.eyebrow")}
            </p>
            <h2
              id="journey-story-heading"
              className="locale-heading mt-5 max-w-[16ch] font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.1] tracking-tight text-balance"
            >
              {t("journeyStory.heading")}
            </h2>
            <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-pretty text-foam/65 sm:text-lg">
              {t("journeyStory.intro")}
            </p>
          </Reveal>
        </Container>
      </div>

      <div className="relative">
        {CHAPTER_MEDIA.map((media, index) => {
          const copy = journeyStory.chapters[media.key];
          return (
            <JourneyChapter
              key={media.key}
              n={copy.n}
              title={copy.title}
              moment={copy.moment}
              scene={copy.scene}
              outcome={copy.outcome}
              image={media.image}
              imageAlt={copy.imageAlt}
              align={media.align}
              isLast={index === CHAPTER_MEDIA.length - 1}
            />
          );
        })}
      </div>

      <div className="border-t border-foam/10">
        <Container className="py-[var(--section-y-sm)] sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]">
          <Reveal>
            <p className="locale-heading max-w-[28ch] font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-snug tracking-tight text-foam text-balance">
              {t("journeyStory.closingTitle")}
            </p>
            <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-pretty text-foam/60">
              {t("journeyStory.closingBody")}
            </p>
            <Link
              href="/airport"
              className="mt-10 inline-flex min-h-12 items-center text-sm font-medium text-foam transition-colors hover:text-brand-bright focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/40"
            >
              {t("journeyStory.cta")}
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
  n,
  title,
  moment,
  scene,
  outcome,
  image,
  imageAlt,
  align,
  isLast,
}: {
  n: string;
  title: string;
  moment: string;
  scene: string;
  outcome: string;
  image: string;
  imageAlt: string;
  align: "left" | "right";
  isLast: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const textAside = align === "left" ? "lg:col-start-1" : "lg:col-start-2";

  return (
    <article
      ref={ref}
      className={[
        "relative min-h-[100svh] overflow-hidden",
        !isLast ? "border-b border-foam/10" : "",
      ].join(" ")}
      aria-labelledby={`chapter-${n}-title`}
    >
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={reduceMotion ? undefined : { y }}
      >
        <div className="absolute inset-[-8%]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
            quality={88}
          />
        </div>
        <div className="absolute inset-0 bg-map-void/58" />
        <div className="absolute inset-0 bg-gradient-to-t from-map-void via-map-void/45 to-map-void/30" />
        {align === "left" ? (
          <div className="absolute inset-0 bg-gradient-to-r from-map-void/75 via-map-void/40 to-transparent" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-l from-map-void/75 via-map-void/40 to-transparent" />
        )}
      </motion.div>

      <Container className="relative flex min-h-[100svh] items-end py-[var(--section-y-sm)] sm:py-[var(--section-y-md)] lg:items-center lg:py-[var(--section-y-lg)]">
        <div className="grid w-full lg:grid-cols-2">
          <div className={`max-w-xl ${textAside}`}>
            <Reveal>
              <p className="font-mono text-[0.6875rem] tracking-[0.22em] text-foam/55">
                <span className="text-brand-bright">{n}</span>
                <span className="mx-3 text-foam/25" aria-hidden="true">
                  —
                </span>
                <span className="uppercase">{title}</span>
              </p>

              <h3
                id={`chapter-${n}-title`}
                className="locale-heading mt-6 font-display text-[clamp(1.85rem,4vw,2.75rem)] leading-[1.12] tracking-tight text-balance drop-shadow-[0_2px_24px_rgb(7_16_24_/_0.45)]"
              >
                {moment}
              </h3>

              <p className="mt-7 max-w-[38ch] text-base leading-[1.75] text-pretty text-foam/80 sm:text-lg">
                {scene}
              </p>

              <p className="mt-10 max-w-[36ch] border-t border-foam/15 pt-6 text-sm leading-relaxed tracking-wide text-pretty text-foam/95">
                {outcome}
              </p>
            </Reveal>
          </div>
        </div>
      </Container>
    </article>
  );
}
