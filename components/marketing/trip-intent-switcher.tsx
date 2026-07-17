"use client";

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";

type IntentId = "ride" | "airport" | "tour";

const INTENT_IDS = ["ride", "airport", "tour"] as const;
const EASE = [0.22, 1, 0.36, 1] as const;
const TRANSITION_MS = 0.35;

const SPRING = {
  stiffness: 110,
  damping: 28,
  mass: 0.45,
} as const;

const INTENT_CONTENT: Record<
  IntentId,
  {
    href: string;
    image: string;
    objectPosition: string;
    title: string;
    body: string;
    cta: string;
    imageAlt: string;
  }
> = {
  ride: {
    href: "/ride",
    image: "/images/story/chauffeur.webp",
    objectPosition: "center 40%",
    title: "Luxury rides across Sri Lanka",
    body: "From city transfers to long-distance travel, enjoy professionally verified chauffeurs, transparent pricing, and a seamless booking experience.",
    cta: "Book a Ride →",
    imageAlt:
      "Luxury chauffeur vehicle ready for premium rides across Colombo and Sri Lanka",
  },
  airport: {
    href: "/airport",
    image: "/images/story/arrival.webp",
    objectPosition: "center 45%",
    title: "Airport transfers without the uncertainty",
    body: "Flight tracking, professional meet-and-greet service, premium vehicles, and reliable pickups any time of day.",
    cta: "Reserve Airport Transfer →",
    imageAlt:
      "Professional chauffeur with a welcome sign for a premium airport pickup",
  },
  tour: {
    href: "/tours",
    image: "/images/story/discovery.webp",
    objectPosition: "center 35%",
    title: "Private journeys crafted around you",
    body: "Create personalised multi-day tours across Sri Lanka with trusted local chauffeurs and flexible itineraries.",
    cta: "Plan Your Journey →",
    imageAlt:
      "Cinematic Sri Lanka travel scene — Sigiriya, Ella, or Galle journey atmosphere",
  },
};

function useFinePointer() {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return fine;
}

/**
 * Ride Services — Ride / Airport / Tour intent switcher.
 * Premium dark glass panel with optional 3D mouse tilt (desktop only).
 */
export function TripIntentSwitcher() {
  const t = useTranslations();
  const { tripIntent } = useMessages();
  const [active, setActive] = useState<IntentId>("ride");
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const finePointer = useFinePointer();
  const tiltEnabled = finePointer && !reduceMotion;
  const cardRef = useRef<HTMLDivElement>(null);
  const current = INTENT_CONTENT[active];

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const lift = useMotionValue(0);
  const scale = useMotionValue(1);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  const rotateX = useSpring(
    useTransform(my, [-0.5, 0.5], [6, -6]),
    SPRING,
  );
  const rotateY = useSpring(
    useTransform(mx, [-0.5, 0.5], [-8, 8]),
    SPRING,
  );
  const springLift = useSpring(lift, SPRING);
  const springScale = useSpring(scale, SPRING);
  const springGlowX = useSpring(glowX, SPRING);
  const springGlowY = useSpring(glowY, SPRING);

  const bgX = useSpring(useTransform(mx, [-0.5, 0.5], [-3, 3]), SPRING);
  const bgY = useSpring(useTransform(my, [-0.5, 0.5], [-2, 2]), SPRING);
  const textX = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), SPRING);
  const textY = useSpring(useTransform(my, [-0.5, 0.5], [-5, 5]), SPRING);
  const imageX = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), SPRING);
  const imageY = useSpring(useTransform(my, [-0.5, 0.5], [-9, 9]), SPRING);
  const ctaX = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), SPRING);
  const ctaY = useSpring(useTransform(my, [-0.5, 0.5], [-7, 7]), SPRING);

  const glowBackground = useMotionTemplate`radial-gradient(420px circle at ${springGlowX}% ${springGlowY}%, rgba(1, 147, 251, 0.14), rgba(201, 164, 108, 0.1) 32%, transparent 62%)`;

  const resetTilt = useCallback(() => {
    mx.set(0);
    my.set(0);
    lift.set(0);
    scale.set(1);
    glowX.set(50);
    glowY.set(50);
    setHovered(false);
  }, [glowX, glowY, lift, mx, my, scale]);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!tiltEnabled || !cardRef.current) return;
      if (event.pointerType !== "mouse") return;

      const rect = cardRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      mx.set(Math.max(-0.5, Math.min(0.5, px)));
      my.set(Math.max(-0.5, Math.min(0.5, py)));
      lift.set(-6);
      scale.set(1.015);
      glowX.set((px + 0.5) * 100);
      glowY.set((py + 0.5) * 100);
    },
    [glowX, glowY, lift, mx, my, scale, tiltEnabled],
  );

  const onPointerEnter = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!tiltEnabled || event.pointerType !== "mouse") return;
      setHovered(true);
    },
    [tiltEnabled],
  );

  const onPointerLeave = useCallback(() => {
    if (!tiltEnabled) return;
    resetTilt();
  }, [resetTilt, tiltEnabled]);

  return (
    <Reveal>
      <Container>
        <div className="[perspective:1200px]">
          <motion.div
            ref={cardRef}
            onPointerEnter={onPointerEnter}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            style={
              tiltEnabled
                ? {
                    rotateX,
                    rotateY,
                    y: springLift,
                    scale: springScale,
                    transformStyle: "preserve-3d",
                    willChange: "transform",
                  }
                : undefined
            }
            className={`relative isolate overflow-hidden rounded-[1.75rem] border bg-[#050b12] text-[#f3f6f7] transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              hovered
                ? "border-white/22 shadow-[0_36px_80px_rgb(0_0_0_/_0.52),0_0_0_1px_rgb(201_164_108_/_0.12)]"
                : "border-white/10 shadow-[0_28px_64px_rgb(0_0_0_/_0.4)]"
            }`}
          >
            <motion.div
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
              aria-hidden="true"
              style={
                tiltEnabled
                  ? { x: bgX, y: bgY, willChange: "transform" }
                  : undefined
              }
            >
              <div className="absolute -top-[12%] -right-[10%] h-[min(48vw,28rem)] w-[min(48vw,28rem)] rounded-full bg-[radial-gradient(circle,rgb(201_164_108_/_0.18)_0%,transparent_70%)] blur-[80px]" />
              <div className="absolute -bottom-[18%] -left-[12%] h-[min(42vw,24rem)] w-[min(42vw,24rem)] rounded-full bg-[radial-gradient(circle,rgb(1_147_251_/_0.14)_0%,transparent_70%)] blur-[80px]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_11_18_/_0.15),transparent_35%,transparent_70%,rgb(5_11_18_/_0.45))]" />
            </motion.div>

            {tiltEnabled ? (
              <motion.div
                className="pointer-events-none absolute inset-0 z-[1] rounded-[1.75rem] opacity-90 blur-2xl"
                style={{ background: glowBackground }}
                aria-hidden="true"
              />
            ) : null}

            <div className="relative z-[2] px-5 py-9 sm:px-8 sm:py-11 lg:px-12 lg:py-14">
              <motion.div
                className="mb-9 max-w-xl sm:mb-10"
                style={
                  tiltEnabled
                    ? { x: textX, y: textY, willChange: "transform" }
                    : undefined
                }
              >
                <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.65rem)] font-semibold tracking-[-0.03em] text-balance text-[#f3f6f7]">
                  {t("tripIntent.heading")}
                </h2>
                <p className="mt-4 text-[clamp(0.98rem,1.2vw,1.1rem)] leading-relaxed text-pretty text-[#f3f6f7]/70">
                  {t("tripIntent.intro")}
                </p>
              </motion.div>

              <motion.div
                role="tablist"
                aria-label={t("tripIntent.tablistAria")}
                className="mb-9 flex gap-1 overflow-x-auto overscroll-x-contain scroll-px-1 border-b border-white/10 pb-px [-ms-overflow-style:none] [scrollbar-width:none] sm:mb-10 [&::-webkit-scrollbar]:hidden"
                style={
                  tiltEnabled
                    ? { x: textX, y: textY, willChange: "transform" }
                    : undefined
                }
              >
                {INTENT_IDS.map((id) => {
                  const selected = id === active;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      id={`intent-tab-${id}`}
                      className={`relative min-h-12 shrink-0 px-4 text-sm font-medium tracking-wide transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0193fb]/40 sm:px-5 sm:text-[0.9375rem] ${
                        selected
                          ? "text-[#f3f6f7]"
                          : "text-[#f3f6f7]/48 hover:text-[#f3f6f7]/82"
                      }`}
                      onClick={() => setActive(id)}
                    >
                      {tripIntent[id].label}
                      {selected ? (
                        finePointer ? (
                          <motion.span
                            layoutId="ride-services-gold-underline"
                            className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#c9a46c] shadow-[0_0_12px_rgb(201_164_108_/_0.45)]"
                            transition={
                              reduceMotion
                                ? { duration: 0 }
                                : { duration: TRANSITION_MS, ease: EASE }
                            }
                          />
                        ) : (
                          <span
                            className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#c9a46c]"
                            aria-hidden="true"
                          />
                        )
                      ) : null}
                    </button>
                  );
                })}
              </motion.div>

              <div
                role="tabpanel"
                aria-labelledby={`intent-tab-${active}`}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${active}-copy`}
                    className="order-2 lg:order-1"
                    initial={
                      reduceMotion
                        ? false
                        : finePointer
                          ? { opacity: 0, y: 14 }
                          : { opacity: 0 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      reduceMotion
                        ? undefined
                        : finePointer
                          ? { opacity: 0, y: -10 }
                          : { opacity: 0 }
                    }
                    transition={{ duration: TRANSITION_MS, ease: EASE }}
                    style={
                      tiltEnabled
                        ? { x: textX, y: textY, willChange: "transform" }
                        : undefined
                    }
                  >
                    <h3 className="font-display text-[clamp(1.45rem,2.4vw,1.95rem)] font-semibold tracking-[-0.028em] text-balance text-[#f3f6f7]">
                      {current.title}
                    </h3>
                    <p className="mt-4 max-w-md text-[clamp(0.98rem,1.1vw,1.08rem)] leading-relaxed text-pretty text-[#f3f6f7]/68">
                      {current.body}
                    </p>
                    <motion.div
                      className="mt-7 inline-flex"
                      style={
                        tiltEnabled
                          ? { x: ctaX, y: ctaY, willChange: "transform" }
                          : undefined
                      }
                    >
                      <ButtonLink
                        href={current.href}
                        size="md"
                        className="rounded-full px-6 shadow-[0_12px_32px_rgb(0_98_250_/_0.28)]"
                      >
                        {current.cta}
                      </ButtonLink>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                <motion.div
                  className="order-1 overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0a121c] shadow-[0_1px_0_rgb(255_255_255_/_0.08)_inset,0_24px_48px_rgb(0_0_0_/_0.4)] transition-shadow duration-300 hover:shadow-[0_1px_0_rgb(255_255_255_/_0.1)_inset,0_28px_56px_rgb(0_0_0_/_0.48)] lg:order-2"
                  style={
                    tiltEnabled
                      ? { x: imageX, y: imageY, willChange: "transform" }
                      : undefined
                  }
                >
                  <div className="relative aspect-[4/3] sm:aspect-[16/11]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={current.image}
                        className="absolute inset-0"
                        initial={
                          reduceMotion
                            ? false
                            : finePointer
                              ? { opacity: 0, y: 10 }
                              : { opacity: 0 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={
                          reduceMotion
                            ? undefined
                            : finePointer
                              ? { opacity: 0, y: -8 }
                              : { opacity: 0 }
                        }
                        transition={{ duration: TRANSITION_MS, ease: EASE }}
                      >
                        <Image
                          src={current.image}
                          alt={current.imageAlt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                          style={{ objectPosition: current.objectPosition }}
                          priority={false}
                        />
                        <div
                          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(5_11_18_/_0.12)_0%,transparent_42%,rgb(5_11_18_/_0.45)_100%)]"
                          aria-hidden="true"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </Reveal>
  );
}
