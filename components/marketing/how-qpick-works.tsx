"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import {
  ExperienceJourneyFrame,
  type JourneyStepId,
} from "@/components/marketing/experience-phone-journey";
import { Container } from "@/components/ui/container";
import "./how-qpick-works.css";

const STEP_IDS = [
  "welcome",
  "register",
  "otp",
  "journey",
  "track",
] as const;

type StepId = (typeof STEP_IDS)[number];

/** Frozen keyframes from the shared Experience phone journey. */
const STEP_TO_JOURNEY: Record<StepId, JourneyStepId> = {
  welcome: "splash",
  register: "login",
  otp: "dashboard",
  journey: "vehicles",
  track: "arriving",
};

const STEP_LAYER = [
  "hqw-step--layer-1",
  "hqw-step--layer-2",
  "hqw-step--layer-3",
  "hqw-step--layer-4",
  "hqw-step--layer-5",
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;
const HOVER_MQ = "(hover: hover) and (pointer: fine)";

/**
 * How Q Pick Works — timeline of frozen frames from the Experience phone journey.
 */
export function HowQPickWorks() {
  const t = useTranslations();
  const { howQPickWorks } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [canHover, setCanHover] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.7", "end 0.4"],
  });
  const lineRaw = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const lineProgress = useSpring(lineRaw, {
    stiffness: 90,
    damping: 26,
    mass: 0.3,
  });

  useEffect(() => {
    const media = window.matchMedia(HOVER_MQ);
    const sync = () => setCanHover(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  /* Touch / coarse pointer — activate the most visible step only */
  useEffect(() => {
    if (canHover) {
      setActiveIndex(null);
      return;
    }

    const ratios = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(
            (entry.target as HTMLElement).dataset.hqwIndex,
          );
          if (!Number.isFinite(index)) continue;
          ratios.set(index, entry.isIntersecting ? entry.intersectionRatio : 0);
        }

        let bestIndex: number | null = null;
        let bestRatio = 0;
        for (const [index, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = index;
          }
        }
        setActiveIndex(bestRatio >= 0.35 ? bestIndex : null);
      },
      {
        threshold: [0.2, 0.35, 0.5, 0.65, 0.8, 1],
        rootMargin: "-18% 0px -18% 0px",
      },
    );

    for (const el of stepRefs.current) {
      if (el) io.observe(el);
    }

    return () => io.disconnect();
  }, [canHover]);

  return (
    <section
      ref={sectionRef}
      className="hqw-stage"
      aria-labelledby="how-qpick-works-heading"
    >
      <Container className="max-w-[76rem]">
        <motion.header
          className="hqw-header"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <p className="hqw-eyebrow">{t("howQPickWorks.eyebrow")}</p>
          <h2 id="how-qpick-works-heading" className="hqw-heading">
            {t("howQPickWorks.heading")}
          </h2>
          <p className="hqw-sub">{t("howQPickWorks.sub")}</p>
        </motion.header>

        <div className="hqw-timeline">
          <div className="hqw-rail" aria-hidden="true">
            <div className="hqw-rail-track" />
            <motion.div
              className="hqw-rail-progress"
              style={
                reduceMotion
                  ? { scaleX: 1 }
                  : { scaleX: lineProgress, transformOrigin: "left center" }
              }
            />
          </div>

          <ol className="hqw-steps">
            {STEP_IDS.map((id, index) => {
              const step = howQPickWorks.steps[id];
              const isActive = activeIndex === index;
              return (
                <motion.li
                  key={id}
                  ref={(node) => {
                    stepRefs.current[index] = node;
                  }}
                  data-hqw-index={index}
                  className={[
                    "hqw-step",
                    STEP_LAYER[index],
                    isActive ? "is-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.55,
                    delay: reduceMotion ? 0 : index * 0.08,
                    ease: EASE,
                  }}
                  onMouseEnter={() => {
                    if (canHover) setActiveIndex(index);
                  }}
                  onMouseLeave={() => {
                    if (canHover) setActiveIndex(null);
                  }}
                  onFocus={() => {
                    if (canHover) setActiveIndex(index);
                  }}
                  onBlur={(event) => {
                    if (!canHover) return;
                    const next = event.currentTarget.contains(
                      event.relatedTarget as Node | null,
                    );
                    if (!next) setActiveIndex(null);
                  }}
                >
                  <div className="hqw-step-dot" aria-hidden="true">
                    <span>{step.n}</span>
                  </div>

                  <motion.div
                    className="hqw-device-float"
                    animate={
                      reduceMotion
                        ? undefined
                        : { y: [0, -6, 0] }
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : {
                            y: {
                              duration: 5.8 + index * 0.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: index * 0.18,
                            },
                          }
                    }
                  >
                    <ShowcaseDevice active={isActive}>
                      <ExperienceJourneyFrame
                        step={STEP_TO_JOURNEY[id]}
                        reduceMotion={reduceMotion}
                      />
                    </ShowcaseDevice>
                  </motion.div>

                  <div className="hqw-copy">
                    <p className="hqw-step-label">
                      {t("howQPickWorks.stepLabel", { n: step.n })}
                    </p>
                    <h3 className="hqw-step-title">{step.title}</h3>
                    <p className="hqw-step-body">{step.body}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}

function ShowcaseDevice({
  children,
  active,
}: {
  children: ReactNode;
  active: boolean;
}) {
  return (
    <div
      className={`hqw-device${active ? " is-active" : ""}`}
      aria-hidden="true"
    >
      <div className="hqw-device-shell">
        <div className="hqw-device-glass">
          <div className="hqw-device-island" />
          <div className="hqw-device-screen">{children}</div>
        </div>
      </div>
    </div>
  );
}
