"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { OfficialStoreBadge } from "@/components/ui/official-store-badge";
import {
  ExperiencePhoneJourney,
  ExperienceSplashIdle,
  type JourneyStepId,
} from "@/components/marketing/experience-phone-journey";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";

const PARALLAX_SPRING = {
  stiffness: 120,
  damping: 18,
  mass: 0.8,
} as const;

/**
 * Experience Q Pick — Apple product-page stage; the phone is the hero.
 * Inside: full splash → book → ride → rate journey.
 */
export function ExperienceQPick() {
  const t = useTranslations();
  const { experience } = useMessages();
  const sectionRef = useRef<HTMLElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [stepLabel, setStepLabel] = useState(() =>
    t("phoneJourney.steps.splash"),
  );

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

  const onStepChange = useCallback((id: JourneyStepId, label: string) => {
    setStepLabel(label);
    void id;
  }, []);

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

  const splashLabel = t("phoneJourney.steps.splash");

  return (
    <section
      ref={sectionRef}
      aria-labelledby="experience-qpick-heading"
      className="experience-stage relative overflow-visible"
      onMouseMove={onSectionPointerMove}
      onMouseLeave={onSectionPointerLeave}
    >
      <ExperienceMapBackdrop />

      <div className="relative z-[1] mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-[120px]">
          <div className="experience-copy order-1 relative z-[2]">
            <h2 id="experience-qpick-heading" className="experience-headline">
              {t("experience.headingLine1")}
              <br />
              {t("experience.headingLine2") === "Q Pick." ? (
                <>Q&nbsp;Pick.</>
              ) : (
                t("experience.headingLine2")
              )}
            </h2>

            <div className="experience-body">
              {experience.lines.map((line) => (
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
              reduceMotion={reduceMotion}
              rotateX={rotateX}
              rotateY={rotateY}
              translateX={translateX}
              translateY={translateY}
              stepLabel={stepLabel}
              splashLabel={splashLabel}
              onStepChange={onStepChange}
            />
          </div>

          <div className="experience-store-row experience-store-row--mobile order-3">
            <OfficialStoreBadge store="ios" size="lg" />
            <OfficialStoreBadge store="android" size="lg" />
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {t("experience.screenLive", { stepLabel })}
        </p>
      </div>
    </section>
  );
}

function ExperienceMapBackdrop() {
  return (
    <div className="experience-map-backdrop" aria-hidden="true">
      <div className="experience-map-wash" />
      <div className="experience-map-grid" />
      <svg
        className="experience-map-art"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="expRoadSoft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.38" />
            <stop offset="55%" stopColor="#1D4ED8" stopOpacity="0.52" />
            <stop offset="100%" stopColor="#0193FB" stopOpacity="0.32" />
          </linearGradient>
          <linearGradient id="expLand" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#9EC7E8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#C5DCF0" stopOpacity="0.28" />
          </linearGradient>
          <filter id="expPinGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Soft coastal / terrain washes */}
        <ellipse cx="1080" cy="220" rx="300" ry="170" fill="url(#expLand)" />
        <ellipse cx="1180" cy="620" rx="340" ry="200" fill="url(#expLand)" />
        <ellipse cx="420" cy="700" rx="280" ry="150" fill="url(#expLand)" />
        <ellipse cx="980" cy="420" rx="200" ry="120" fill="url(#expLand)" />

        {/* Illustrator-style road network */}
        <g
          fill="none"
          stroke="url(#expRoadSoft)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M120 760 C280 640 360 520 520 460 C680 400 780 320 920 280 C1040 246 1160 210 1320 180" />
          <path d="M60 420 C220 380 340 440 460 500 C620 580 740 640 900 610 C1040 584 1160 500 1380 440" />
          <path d="M180 120 C300 220 380 340 520 420 C700 520 860 540 1040 500 C1180 470 1280 390 1400 320" />
          <path d="M700 40 C720 180 780 300 900 400 C1020 500 1140 560 1340 640" />
          <path d="M40 560 C180 560 280 500 380 420 C500 320 620 240 760 220" />
        </g>

        <g
          fill="none"
          stroke="#0A84FF"
          strokeOpacity="0.22"
          strokeWidth="1.6"
          strokeDasharray="6 11"
          strokeLinecap="round"
        >
          <path d="M240 80 C360 160 460 280 580 360 C740 470 900 490 1100 430" />
          <path d="M100 680 C260 620 420 560 580 540 C760 514 940 560 1220 700" />
        </g>

        {/* Junction nodes */}
        <g fill="#0A84FF" fillOpacity="0.4">
          <circle cx="520" cy="460" r="5.5" />
          <circle cx="900" cy="400" r="5.5" />
          <circle cx="1040" cy="500" r="5" />
          <circle cx="760" cy="220" r="4.5" />
          <circle cx="460" cy="500" r="4.5" />
        </g>

        {/* Drop pins */}
        <g filter="url(#expPinGlow)">
          <ExperienceMapPin x={920} y={268} tone="brand" pulse />
          <ExperienceMapPin x={520} y={448} tone="deep" />
          <ExperienceMapPin x={1180} y={486} tone="bright" pulse />
          <ExperienceMapPin x={760} y={208} tone="brand" />
          <ExperienceMapPin x={380} y={408} tone="deep" />
        </g>
      </svg>
      <div className="experience-map-veil" />
    </div>
  );
}

function ExperienceMapPin({
  x,
  y,
  tone,
  pulse = false,
}: {
  x: number;
  y: number;
  tone: "brand" | "deep" | "bright";
  pulse?: boolean;
}) {
  const fill =
    tone === "deep" ? "#1D4ED8" : tone === "bright" ? "#38BDF8" : "#0A84FF";
  return (
    <g className={pulse ? "experience-map-pin experience-map-pin--pulse" : "experience-map-pin"} transform={`translate(${x} ${y})`}>
      {pulse ? (
        <circle className="experience-map-pin-ring" cx="0" cy="0" r="18" fill="none" stroke={fill} strokeOpacity="0.35" strokeWidth="1.5" />
      ) : null}
      <path
        d="M0 -28 C-11 -28 -20 -18 -20 -7 C-20 8 0 28 0 28 C0 28 20 8 20 -7 C20 -18 11 -28 0 -28Z"
        fill={fill}
      />
      <circle cx="0" cy="-9" r="6.5" fill="#FFFFFF" />
      <circle cx="0" cy="-9" r="3.2" fill={fill} fillOpacity="0.85" />
    </g>
  );
}

function IPhone16ProMockup({
  reduceMotion,
  rotateX,
  rotateY,
  translateX,
  translateY,
  stepLabel,
  splashLabel,
  onStepChange,
}: {
  reduceMotion: boolean;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  translateX: MotionValue<number>;
  translateY: MotionValue<number>;
  stepLabel: string;
  splashLabel: string;
  onStepChange: (id: JourneyStepId, label: string) => void;
}) {
  const t = useTranslations();
  const stageRef = useRef<HTMLDivElement>(null);
  const [runId, setRunId] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const locked = new URLSearchParams(window.location.search).get("journey");
    if (locked) {
      setRunId(1);
      setPlaying(true);
    }
  }, []);

  useEffect(() => {
    const locked = new URLSearchParams(window.location.search).get("journey");
    if (locked) return; // QA lock — keep the locked screen mounted

    const el = stageRef.current;
    if (!el) return;

    let wasOut = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible =
          (entry?.isIntersecting ?? false) &&
          (entry?.intersectionRatio ?? 0) >= 0.5;
        if (visible) {
          if (wasOut) {
            // Tear down any mid-journey instance and start from Splash.
            setPlaying(false);
            onStepChange("splash", splashLabel);
            window.requestAnimationFrame(() => {
              setRunId((n) => n + 1);
              setPlaying(true);
            });
          }
          wasOut = false;
        } else {
          wasOut = true;
          setPlaying(false);
          onStepChange("splash", splashLabel);
        }
      },
      {
        threshold: [0, 0.5, 0.75, 1],
        rootMargin: "-20% 0px -20% 0px",
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onStepChange, splashLabel]);

  return (
    <div
      ref={stageRef}
      className="experience-phone-stage relative [perspective:1600px]"
    >
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
        aria-label={t("experience.previewAria", { stepLabel })}
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

                {playing ? (
                  <ExperiencePhoneJourney
                    key={runId}
                    active
                    reduceMotion={reduceMotion}
                    onStepChange={onStepChange}
                  />
                ) : (
                  <div className="experience-journey">
                    <ExperienceSplashIdle reduceMotion={reduceMotion} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
