"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { OfficialStoreBadge } from "@/components/ui/official-store-badge";
import { ExperiencePhoneLive } from "@/components/marketing/experience-phone-live";

type Screen =
  | { id: string; kind: "shot"; src: string; label: string; hold: number }
  | { id: string; kind: "live"; label: string; hold: number };

const SCREENS: Screen[] = [
  {
    id: "login",
    kind: "shot",
    src: "/images/app/login.webp",
    label: "Login",
    hold: 2200,
  },
  {
    id: "home",
    kind: "shot",
    src: "/images/app/home.webp",
    label: "Home",
    hold: 2200,
  },
  {
    id: "live",
    kind: "live",
    label: "Live ride",
    hold: 8100,
  },
  {
    id: "tracking",
    kind: "shot",
    src: "/images/app/tracking.webp",
    label: "Live tracking",
    hold: 2400,
  },
  {
    id: "account",
    kind: "shot",
    src: "/images/app/account.webp",
    label: "Account",
    hold: 2200,
  },
];

const FADE_MS = 850;

const LINES = [
  "Your private chauffeur.",
  "Your travel companion.",
  "Your Sri Lanka.",
] as const;

const PARALLAX_SPRING = {
  stiffness: 120,
  damping: 18,
  mass: 0.8,
} as const;

/**
 * Experience Q Pick — Apple product-page stage; the phone is the hero.
 */
export function ExperienceQPick() {
  const sectionRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const springX = useSpring(pointerX, PARALLAX_SPRING);
  const springY = useSpring(pointerY, PARALLAX_SPRING);

  const rotateY = useTransform(springX, [-1, 1], [-7, 7]);
  const rotateX = useTransform(springY, [-1, 1], [4, -4]);
  const translateX = useTransform(springX, [-1, 1], [-10, 10]);
  const translateY = useTransform(springY, [-1, 1], [-10, 10]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const hold = SCREENS[index]?.hold ?? 2500;
    const id = window.setTimeout(() => {
      setIndex((current) => (current + 1) % SCREENS.length);
    }, hold);
    return () => window.clearTimeout(id);
  }, [index, reduceMotion]);

  const resetParallax = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const onSectionPointerMove = (event: MouseEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;

    pointerX.set(Math.max(-1, Math.min(1, nx)));
    pointerY.set(Math.max(-1, Math.min(1, ny)));
  };

  const onSectionPointerLeave = () => {
    if (reduceMotion) return;
    resetParallax();
  };

  const active = SCREENS[index];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="experience-qpick-heading"
      className="experience-stage relative overflow-visible"
      onMouseMove={onSectionPointerMove}
      onMouseLeave={onSectionPointerLeave}
    >
      <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-[120px]">
          <div className="experience-copy order-1">
            <h2 id="experience-qpick-heading" className="experience-headline">
              Experience
              <br />
              Q&nbsp;Pick.
            </h2>

            <div className="experience-body">
              {LINES.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="experience-store-row experience-store-row--desktop">
              <OfficialStoreBadge store="ios" size="lg" />
              <OfficialStoreBadge store="android" size="lg" />
            </div>
          </div>

          <div className="order-2 flex justify-center lg:justify-end">
            <IPhone16ProMockup
              screenIndex={index}
              reduceMotion={reduceMotion}
              rotateX={rotateX}
              rotateY={rotateY}
              translateX={translateX}
              translateY={translateY}
            />
          </div>

          <div className="experience-store-row experience-store-row--mobile order-3">
            <OfficialStoreBadge store="ios" size="lg" />
            <OfficialStoreBadge store="android" size="lg" />
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {`Q Pick app screen: ${active.label}`}
        </p>
      </div>
    </section>
  );
}

function IPhone16ProMockup({
  screenIndex,
  reduceMotion,
  rotateX,
  rotateY,
  translateX,
  translateY,
}: {
  screenIndex: number;
  reduceMotion: boolean;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  translateX: MotionValue<number>;
  translateY: MotionValue<number>;
}) {
  const [failed, setFailed] = useState<Partial<Record<string, boolean>>>({});
  const active = SCREENS[screenIndex];

  return (
    <div className="experience-phone-stage relative [perspective:1600px]">
      {/* Product light only — strong blue glow behind the phone */}
      <div className="experience-ambient" aria-hidden="true">
        <div className="experience-ambient-glow" />
        <div className="experience-ambient-volume" />
        <div className="experience-ambient-spill" />
      </div>

      <motion.div
        className="experience-phone-parallax relative z-[1] aspect-[71.5/149.6] h-[min(58svh,480px)] w-auto lg:h-[640px]"
        style={
          reduceMotion
            ? undefined
            : {
                rotateX,
                rotateY,
                x: translateX,
                y: translateY,
                transformPerspective: 1600,
              }
        }
        role="img"
        aria-label={`Q Pick app preview showing ${active.label}`}
      >
        <div
          className={[
            "relative h-full w-full",
            reduceMotion ? "experience-phone-static" : "experience-phone-float",
          ].join(" ")}
        >
          <div className="experience-phone-shell relative h-full w-full">
            <div className="experience-phone-glass" aria-hidden="true" />
            <div className="experience-phone-side-buttons" aria-hidden="true" />

            <div className="experience-phone-bezel relative h-full w-full">
              <div className="experience-phone-display relative h-full w-full overflow-hidden">
                <div className="experience-dynamic-island" aria-hidden="true">
                  <span className="experience-dynamic-island-sheen" />
                  <span className="experience-dynamic-island-camera" />
                </div>

                {SCREENS.map((item, i) => {
                  const visible = i === screenIndex;
                  const hasFailed =
                    item.kind === "shot" ? Boolean(failed[item.id]) : false;

                  return (
                    <div
                      key={item.id}
                      className="experience-phone-screen absolute inset-0 overflow-hidden"
                      style={{
                        opacity: visible ? 1 : 0,
                        transition: reduceMotion
                          ? "none"
                          : `opacity ${FADE_MS}ms ease-in-out`,
                        pointerEvents: visible ? "auto" : "none",
                        zIndex: visible ? 2 : 1,
                      }}
                      aria-hidden={!visible}
                    >
                      {item.kind === "live" ? (
                        visible ? (
                          <ExperiencePhoneLive
                            key={`live-${screenIndex}`}
                            reduceMotion={reduceMotion}
                          />
                        ) : null
                      ) : hasFailed ? (
                        <div
                          role="alert"
                          className="flex h-full flex-col items-center justify-center gap-2 bg-white px-5 text-center"
                        >
                          <p className="font-mono text-[0.65rem] text-danger uppercase">
                            Dev warning
                          </p>
                          <p className="text-xs leading-relaxed text-ink-muted">
                            Failed to load
                            <br />
                            <span className="font-mono text-[0.65rem] text-ink">
                              {item.src}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <Image
                          src={item.src}
                          alt={`Q Pick Customer App — ${item.label}`}
                          fill
                          sizes="(min-width: 1024px) 315px, 250px"
                          className="experience-phone-shot object-cover object-top"
                          unoptimized
                          priority={i === 0}
                          loading="eager"
                          onError={() =>
                            setFailed((prev) => ({ ...prev, [item.id]: true }))
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
