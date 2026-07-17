"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
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
const AUTOPLAY_MS = 3000;

/**
 * How Q Pick Works — desktop timeline unchanged; mobile/tablet Embla carousel.
 */
export function HowQPickWorks() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [canHover, setCanHover] = useState(false);
  const [desktopTimeline, setDesktopTimeline] = useState(false);

  useEffect(() => {
    const hoverMedia = window.matchMedia(HOVER_MQ);
    const desktopMedia = window.matchMedia("(min-width: 1280px)");
    const syncHover = () => setCanHover(hoverMedia.matches);
    const syncDesktop = () => setDesktopTimeline(desktopMedia.matches);
    syncHover();
    syncDesktop();
    hoverMedia.addEventListener("change", syncHover);
    desktopMedia.addEventListener("change", syncDesktop);
    return () => {
      hoverMedia.removeEventListener("change", syncHover);
      desktopMedia.removeEventListener("change", syncDesktop);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hqw-stage"
      aria-labelledby="how-qpick-works-heading"
    >
      <Container>
        <motion.header
          className="hqw-header"
          initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 18 }}
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

        {/* Mobile & tablet — one phone carousel */}
        <HowQPickMobileCarousel reduceMotion={reduceMotion} />

        {/* Desktop timeline — scroll progress only mounts on xl */}
        {desktopTimeline ? (
          <HowQPickDesktopTimeline
            sectionRef={sectionRef}
            reduceMotion={reduceMotion}
            canHover={canHover}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        ) : null}
      </Container>
    </section>
  );
}

function HowQPickDesktopTimeline({
  sectionRef,
  reduceMotion,
  canHover,
  activeIndex,
  setActiveIndex,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  reduceMotion: boolean;
  canHover: boolean;
  activeIndex: number | null;
  setActiveIndex: (index: number | null) => void;
}) {
  const t = useTranslations();
  const { howQPickWorks } = useMessages();

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

  return (
    <div className="hqw-timeline hqw-timeline--desktop">
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
              className={[
                "hqw-step",
                STEP_LAYER[index],
                isActive ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 28 }}
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
                  reduceMotion || !isActive ? undefined : { y: [0, -6, 0] }
                }
                transition={
                  reduceMotion || !isActive
                    ? undefined
                    : {
                        y: {
                          duration: 5.8 + index * 0.2,
                          repeat: Infinity,
                          ease: "easeInOut",
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
  );
}

function HowQPickMobileCarousel({ reduceMotion }: { reduceMotion: boolean }) {
  const t = useTranslations();
  const { howQPickWorks } = useMessages();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inView, setInView] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  const autoplay = useRef(
    Autoplay({
      delay: AUTOPLAY_MS,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      playOnInit: true,
    }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      duration: reduceMotion ? 10 : 22,
      dragFree: false,
    },
    reduceMotion ? [] : [autoplay.current],
  );

  useEffect(() => {
    if (!reduceMotion) {
      console.log("Phone slideshow started");
    }
    const node = rootRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Soft gate: play whenever any part is visible; stop only when fully gone.
        setInView(entry?.isIntersecting ?? false);
      },
      { threshold: [0, 0.01, 0.25, 1] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !emblaApi) return;
    const plugin = autoplay.current;
    if (inView) plugin.play();
    else plugin.stop();
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

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    if (!reduceMotion && inView) {
      autoplay.current.reset();
      autoplay.current.play();
    }
  }, [emblaApi, inView, reduceMotion]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    if (!reduceMotion && inView) {
      autoplay.current.reset();
      autoplay.current.play();
    }
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

  const current = selectedIndex + 1;
  const total = STEP_IDS.length;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div ref={rootRef} className="hqw-carousel">
      <div className="hqw-carousel-meta">
        <p className="hqw-carousel-count" aria-live="polite">
          <span className="hqw-carousel-count-current">{pad(current)}</span>
          <span className="hqw-carousel-count-sep" aria-hidden="true">
            {" "}
            /{" "}
          </span>
          <span className="hqw-carousel-count-total">{pad(total)}</span>
        </p>
      </div>

      <div className="hqw-carousel-viewport" ref={emblaRef}>
        <div className="hqw-carousel-track">
          {STEP_IDS.map((id, index) => {
            const step = howQPickWorks.steps[id];
            const selected = index === selectedIndex;
            return (
              <div
                key={id}
                className={`hqw-carousel-slide${selected ? " is-selected" : ""}`}
              >
                <div className="hqw-carousel-phone">
                  <ShowcaseDevice active={selected}>
                    <ExperienceJourneyFrame
                      step={STEP_TO_JOURNEY[id]}
                      reduceMotion={reduceMotion || !selected}
                    />
                  </ShowcaseDevice>
                </div>
                <div className="hqw-carousel-copy">
                  <p className="hqw-step-label">
                    {t("howQPickWorks.stepLabel", { n: step.n })}
                  </p>
                  <h3 className="hqw-step-title">{step.title}</h3>
                  <p className="hqw-step-body">{step.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="hqw-carousel-controls">
        <button
          type="button"
          className="hqw-carousel-nav"
          onClick={scrollPrev}
          aria-label={t("howQPickWorks.prevAria")}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} aria-hidden />
        </button>

        <div className="hqw-carousel-dots" role="tablist" aria-label={t("howQPickWorks.dotsAria")}>
          {STEP_IDS.map((id, index) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={t("howQPickWorks.dotAria", {
                n: howQPickWorks.steps[id].n,
              })}
              className={`hqw-carousel-dot${
                index === selectedIndex ? " is-active" : ""
              }`}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>

        <button
          type="button"
          className="hqw-carousel-nav"
          onClick={scrollNext}
          aria-label={t("howQPickWorks.nextAria")}
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.2} aria-hidden />
        </button>
      </div>
    </div>
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
