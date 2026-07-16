"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import "./your-journey-your-rules.css";

const EASE = [0.22, 1, 0.36, 1] as const;

type ChapterId =
  | "airport"
  | "planning"
  | "chauffeur"
  | "explore"
  | "complete";

const CHAPTERS: {
  id: ChapterId;
  image: string;
  objectPosition: string;
}[] = [
  {
    id: "airport",
    image: "/images/story/arrival.webp",
    objectPosition: "center 55%",
  },
  {
    id: "planning",
    image: "/images/story/compose.webp",
    objectPosition: "center 40%",
  },
  {
    id: "chauffeur",
    image: "/images/story/chauffeur.webp",
    objectPosition: "78% 40%",
  },
  {
    id: "explore",
    image: "/images/story/discovery.webp",
    objectPosition: "center 35%",
  },
  {
    id: "complete",
    image: "/images/story/return.webp",
    objectPosition: "center 48%",
  },
];

/**
 * Flagship editorial journey — sticky cinema + scrolling narrative chapters.
 * Continuous luxury travel story. Not a feature grid.
 */
export function YourJourneyYourRules() {
  const t = useTranslations();
  const { yourJourneyRules } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;
  const railRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeChapter, setActiveChapter] = useState(0);

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.55", "end 0.35"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 30,
    mass: 0.4,
  });
  const progressHeight = useTransform(progress, (v) => `${v * 100}%`);

  useEffect(() => {
    const nodes = chapterRefs.current.filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const ratios = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(
            (entry.target as HTMLElement).dataset.yjChapter,
          );
          if (!Number.isFinite(index)) continue;
          ratios.set(index, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let best = 0;
        let bestRatio = -1;
        for (const [index, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = index;
          }
        }
        if (bestRatio > 0) setActiveChapter(best);
      },
      {
        threshold: [0.15, 0.3, 0.45, 0.6, 0.75, 0.9],
        rootMargin: "-22% 0px -32% 0px",
      },
    );

    for (const node of nodes) io.observe(node);
    return () => io.disconnect();
  }, []);

  const active = CHAPTERS[activeChapter] ?? CHAPTERS[0];
  const chapterCopy = yourJourneyRules.chapters[active.id];

  return (
    <section
      className="yj-stage"
      aria-labelledby="your-journey-heading"
    >
      <div className="yj-ambient" aria-hidden="true">
        <div className="yj-ambient-orb yj-ambient-orb--gold" />
        <div className="yj-ambient-orb yj-ambient-orb--blue" />
        <div className="yj-ambient-veil" />
      </div>

      <Container className="yj-inner max-w-[76rem]">
        <motion.header
          className="yj-intro"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <p className="yj-eyebrow">{t("yourJourneyRules.eyebrow")}</p>
          <h2 id="your-journey-heading" className="yj-heading">
            {t("yourJourneyRules.heading")}
          </h2>
          <p className="yj-manifesto">{t("yourJourneyRules.manifesto")}</p>
          <p className="yj-positioning">
            <strong>{t("yourJourneyRules.positioningLead")}</strong>{" "}
            {t("yourJourneyRules.positioningRest")}
          </p>
        </motion.header>

        <div className="yj-journey">
          <div
            className="yj-media"
            aria-live="polite"
            aria-atomic="true"
          >
            {CHAPTERS.map((chapter, index) => (
              <div
                key={chapter.id}
                className={`yj-media-frame${activeChapter === index ? " is-active" : ""}`}
                aria-hidden={activeChapter !== index}
              >
                <Image
                  src={chapter.image}
                  alt={
                    activeChapter === index
                      ? yourJourneyRules.chapters[chapter.id].imageAlt
                      : ""
                  }
                  fill
                  sizes="(max-width: 1023px) 100vw, 48vw"
                  className="yj-media-img"
                  style={{ objectPosition: chapter.objectPosition }}
                  priority={index === 0}
                />
              </div>
            ))}
            <div className="yj-media-wash" aria-hidden="true" />
            <div className="yj-media-caption" key={active.id}>
              <p className="yj-media-kicker">{chapterCopy.kicker}</p>
              <p className="yj-media-title">{chapterCopy.mediaTitle}</p>
            </div>
          </div>

          <div ref={railRef} className="yj-rail-wrap">
            <div className="yj-rail-track" aria-hidden="true">
              <motion.div
                className="yj-rail-progress"
                style={{
                  height: reduceMotion ? "100%" : progressHeight,
                }}
              />
            </div>

            <ol className="yj-rail">
              {CHAPTERS.map((chapter, chapterIndex) => {
                const copy = yourJourneyRules.chapters[chapter.id];
                const isActive = activeChapter === chapterIndex;
                const isPast = chapterIndex < activeChapter;

                return (
                  <li
                    key={chapter.id}
                    ref={(el) => {
                      chapterRefs.current[chapterIndex] = el;
                    }}
                    data-yj-chapter={chapterIndex}
                    className={[
                      "yj-chapter",
                      isActive ? "is-active" : "",
                      isPast ? "is-past" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className="yj-chapter-dot" aria-hidden="true" />
                    <div className="yj-chapter-meta">
                      <p className="yj-chapter-n">{copy.n}</p>
                      <p className="yj-chapter-label">{copy.label}</p>
                    </div>
                    <h3 className="yj-chapter-title">{copy.title}</h3>
                    <p className="yj-chapter-scene">{copy.scene}</p>
                    {copy.details?.length ? (
                      <ul className="yj-chapter-details">
                        {copy.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="yj-chapter-whisper">{copy.whisper}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <motion.aside
          className="yj-trust"
          aria-label={t("yourJourneyRules.trustEyebrow")}
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <p className="yj-trust-eyebrow">
            {t("yourJourneyRules.trustEyebrow")}
          </p>
          <p className="yj-trust-body">{t("yourJourneyRules.trustBody")}</p>
        </motion.aside>

        <motion.aside
          className="yj-continuum"
          aria-label={t("yourJourneyRules.continuumEyebrow")}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.06 }}
        >
          <p className="yj-continuum-eyebrow">
            {t("yourJourneyRules.continuumEyebrow")}
          </p>
          <p className="yj-continuum-body">
            {t("yourJourneyRules.continuumBody")}
          </p>
          <p className="yj-continuum-soon">
            {t("yourJourneyRules.continuumComingSoon")}
          </p>
          <ul className="yj-continuum-list">
            {yourJourneyRules.continuumItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.aside>
      </Container>
    </section>
  );
}
