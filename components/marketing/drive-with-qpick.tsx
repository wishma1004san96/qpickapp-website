"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
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
import { Container } from "@/components/ui/container";
import { TrustChipMarquee } from "@/components/marketing/trust-chip-marquee";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  Navigation,
  Plane,
  Wallet,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const PARALLAX_SPRING = { stiffness: 90, damping: 22, mass: 0.55 } as const;

const TRUST_BADGES = [
  { id: "verified", icon: BadgeCheck },
  { id: "payouts", icon: Wallet },
  { id: "support", icon: Headphones },
] as const;

const FLOAT_CARDS = [
  {
    id: "ride",
    icon: Navigation,
    titleKey: "rideTitle" as const,
    bodyKey: "rideBody" as const,
    // Peek from outside the phone — never cover the screen centre.
    className:
      "left-0 top-[8%] z-[3] w-[min(8.5rem,36%)] -translate-x-[55%] sm:left-0 sm:top-[8%] sm:w-auto sm:max-w-[11.5rem] sm:-translate-x-8 lg:-translate-x-12",
    bobClass: "drive-float-bob drive-float-bob--a",
    delay: 0,
    hideOnMobile: false,
  },
  {
    id: "airport",
    icon: Plane,
    titleKey: "airportTitle" as const,
    bodyKey: "airportBody" as const,
    className:
      "right-0 top-[16%] z-[3] w-[min(8.5rem,36%)] translate-x-[55%] sm:right-0 sm:top-[18%] sm:w-auto sm:max-w-[11.5rem] sm:translate-x-6 lg:translate-x-10",
    bobClass: "drive-float-bob drive-float-bob--b",
    delay: 0.4,
    hideOnMobile: false,
  },
  {
    id: "earnings",
    icon: Wallet,
    titleKey: "earningsTitle" as const,
    bodyKey: "earningsBody" as const,
    className:
      "bottom-[20%] left-0 z-[3] w-[min(8.5rem,36%)] -translate-x-[55%] sm:left-0 sm:bottom-[22%] sm:w-auto sm:max-w-[11.5rem] sm:-translate-x-10 lg:-translate-x-14",
    bobClass: "drive-float-bob drive-float-bob--c",
    delay: 0.8,
    hideOnMobile: false,
  },
  {
    id: "online",
    icon: BadgeCheck,
    titleKey: "onlineTitle" as const,
    bodyKey: "onlineBody" as const,
    className:
      "right-0 bottom-[8%] z-[3] w-[min(8.5rem,36%)] translate-x-[55%] sm:right-0 sm:bottom-[10%] sm:w-auto sm:max-w-[11.5rem] sm:translate-x-8 lg:translate-x-12",
    bobClass: "drive-float-bob drive-float-bob--d",
    delay: 1.2,
    hideOnMobile: false,
  },
];

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

function useMinWidth(px: number) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [px]);
  return matches;
}

/** Floating iPhone showcase with glass notifications + mouse parallax. */
function DriverShowcasePhone({ reduceMotion }: { reduceMotion: boolean }) {
  const finePointer = useFinePointer();
  const isDesktop = useMinWidth(1024);
  const parallaxOn = finePointer && !reduceMotion && isDesktop;
  const stageRef = useRef<HTMLDivElement>(null);
  const { driveWithQPick } = useMessages();
  const floats = driveWithQPick.floatCards;
  const [earnings, setEarnings] = useState(reduceMotion ? 2840 : 120);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), PARALLAX_SPRING);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), PARALLAX_SPRING);
  const shiftX = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), PARALLAX_SPRING);
  const shiftY = useSpring(useTransform(my, [-0.5, 0.5], [-8, 8]), PARALLAX_SPRING);

  // Float + earnings start on mount — no viewport gate.
  useEffect(() => {
    console.log("Driver slideshow started");
    console.log("Floating animation started");
    if (reduceMotion) {
      setEarnings(2840);
      return;
    }
    const target = 2840;
    const duration = 1400;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setEarnings(Math.max(120, Math.round(target * eased)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    setEarnings(120);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion]);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!parallaxOn || !stageRef.current) return;
      if (event.pointerType !== "mouse") return;
      const rect = stageRef.current.getBoundingClientRect();
      mx.set((event.clientX - rect.left) / rect.width - 0.5);
      my.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [mx, my, parallaxOn],
  );

  const onPointerLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  return (
    <div
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative mx-auto flex min-h-[30rem] w-full max-w-[24rem] items-center justify-center overflow-visible px-6 py-8 [perspective:1200px] sm:min-h-[32rem] sm:max-w-[30rem] sm:px-8 sm:py-8 lg:max-w-none lg:py-10"
    >
      <motion.div
        className="pointer-events-none absolute h-[70%] w-[75%] rounded-full bg-[radial-gradient(circle,rgb(0_98_250_/_0.48)_0%,rgb(1_147_251_/_0.16)_42%,transparent_72%)] blur-3xl"
        initial={{ opacity: 0.55, scale: 0.94 }}
        animate={
          reduceMotion
            ? { opacity: 0.7, scale: 1 }
            : { opacity: [0.55, 0.85, 0.55], scale: [0.94, 1.08, 0.94] }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
        aria-hidden="true"
      />

      {FLOAT_CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            className={`pointer-events-none absolute ${card.className}${
              card.hideOnMobile ? " hidden sm:block" : ""
            }`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.55,
              delay: 0.2 + card.delay * 0.12,
              ease: EASE,
            }}
          >
            <div className={card.bobClass}>
              <div className="rounded-[18px] border border-white/15 bg-white/[0.1] px-2.5 py-2.5 shadow-[0_16px_40px_rgb(0_0_0_/_0.35)] backdrop-blur-xl sm:rounded-[20px] sm:px-3.5 sm:py-3">
                <div className="flex items-start gap-2 sm:gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[10px] bg-brand/20 text-brand-bright sm:h-8 sm:w-8 sm:rounded-[12px]">
                    <Icon className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.68rem] leading-tight font-semibold text-foam sm:text-[0.72rem]">
                      {floats[card.titleKey]}
                    </p>
                    <p className="mt-0.5 text-[0.6rem] leading-snug text-foam/55 sm:text-[0.65rem]">
                      {floats[card.bodyKey]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative z-[5] mx-auto w-[min(13.75rem,62vw)] sm:w-[min(16.5rem,58vw)] lg:w-[17rem]"
        style={
          parallaxOn
            ? {
                rotateX,
                rotateY,
                x: shiftX,
                y: shiftY,
                transformStyle: "preserve-3d",
                willChange: "transform",
              }
            : undefined
        }
      >
        <div
          className={`origin-center drive-phone-bob${isDesktop ? " drive-phone-bob--tilted" : ""}`}
        >
          <div className="relative rounded-[2rem] border border-white/12 bg-gradient-to-b from-[#2c3440]/90 via-[#151d28]/95 to-[#0a1118] p-[0.42rem] shadow-[0_2px_0_rgb(255_255_255_/_0.12)_inset,0_40px_90px_rgb(0_0_0_/_0.55),0_18px_48px_rgb(0_98_250_/_0.28)] backdrop-blur-sm">
            <div className="relative aspect-[9/19.2] overflow-hidden rounded-[1.55rem] bg-[#f0f4f9]">
              <div
                className="absolute top-2.5 left-1/2 z-10 h-1.5 w-[32%] -translate-x-1/2 rounded-full bg-[#05080d]"
                aria-hidden="true"
              />
              <DriverDashboardScreen
                earnings={earnings}
                reduceMotion={reduceMotion}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** Original Q Pick Driver dashboard — Hello Dilan + stats + BIA map. */
function DriverDashboardScreen({
  earnings,
  reduceMotion,
}: {
  earnings: number;
  reduceMotion: boolean;
}) {
  const motionProps = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, delay, ease: EASE },
        };

  const cards = [
    {
      id: "earnings",
      label: "Today's Earnings",
      value: `LKR ${earnings.toLocaleString("en-LK")}`,
      iconBg: "bg-[#1f7a4c]",
      icon: (
        <span className="text-[0.58rem] font-bold tracking-tight text-white">Rs</span>
      ),
    },
    {
      id: "completed",
      label: "Completed Trips",
      value: "304",
      iconBg: "bg-[#0062fa]",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" aria-hidden>
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "rejected",
      label: "Rejected",
      value: "3",
      iconBg: "bg-[#e11d48]",
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "rating",
      label: "Rating",
      value: "4.9★",
      iconBg: "bg-[#f59e0b]/15",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" aria-hidden>
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
  ] as const;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#f0f4f9] font-sans text-[#0a1620]">
      <div className="shrink-0 pt-9" />

      <header className="flex shrink-0 items-start gap-2.5 px-3.5 pb-2.5">
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center text-[#0a1620]" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[0.95rem] leading-none font-bold tracking-tight text-[#0a1620]">
            Hello, Dilan
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <motion.span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1f7a4c] shadow-[0_0_0_3px_rgb(31_122_76_/_0.2)]"
              initial={{ opacity: 0.85, scale: 1 }}
              animate={
                reduceMotion
                  ? { opacity: 1, scale: 1 }
                  : { scale: [1, 1.28, 1], opacity: [0.85, 1, 0.85] }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              }
            />
            <span className="text-[0.62rem] leading-none text-[#6b7c88]">Online</span>
          </div>
        </div>

        <motion.div
          className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0062fa]/10 text-[#0062fa]"
          aria-hidden
          animate={reduceMotion ? undefined : { scale: [1, 1.05, 1] }}
          transition={{
            duration: 0.55,
            repeat: Infinity,
            repeatDelay: 3.8,
            ease: "easeInOut",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" />
          </svg>
        </motion.div>
      </header>

      <div className="px-3.5">
        <motion.div
          className="flex h-11 items-center justify-between rounded-2xl bg-[#fde2e0] px-3"
          {...motionProps(0.05)}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e11d48]">
            <span className="h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="text-[0.8rem] font-semibold text-[#0a1620]">Go Offline</span>
          <ChevronRightIcon className="text-[#9aa8b3]" />
        </motion.div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 px-3.5">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            className="flex items-center gap-2 rounded-2xl bg-white px-2.5 py-2.5 shadow-[0_2px_10px_rgb(10_22_32_/_0.05)]"
            {...motionProps(0.08 + i * 0.04)}
          >
            <div
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${card.iconBg}`}
            >
              {card.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.55rem] leading-tight text-[#8a9aa6]">
                {card.label}
              </p>
              <p className="mt-0.5 truncate text-[0.78rem] leading-none font-bold tracking-tight text-[#0a1620] tabular-nums">
                {card.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="relative mx-3.5 mt-3 mb-3 min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#e2e8ee]"
        {...motionProps(0.28)}
      >
        <DashboardLiveMap reduceMotion={reduceMotion} />
      </motion.div>
    </div>
  );
}

/** Route ends at BIA terminal access road; pin sits beside the road (not on runway). */
const MAP_START = { x: 58, y: 78 };
const MAP_ROAD_END = { x: 32, y: 43 };
const MAP_DEST = { x: 29, y: 40.5 };
const MAP_ROUTE = `M ${MAP_START.x} ${MAP_START.y} C 60 66, 50 55, 40 48 S 34 44, ${MAP_ROAD_END.x} ${MAP_ROAD_END.y}`;

function DashboardLiveMap({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="/images/app/driver-app/hire-map.webp"
        alt=""
        fill
        sizes="(max-width: 1024px) 78vw, 280px"
        className="pointer-events-none select-none object-cover object-[50%_42%]"
        style={{ transform: "scale(1.12)", transformOrigin: "center center" }}
        draggable={false}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d={MAP_ROUTE}
          fill="none"
          stroke="rgb(26 115 232 / 0.28)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={MAP_ROUTE}
          fill="none"
          stroke="rgb(255 255 255 / 0.95)"
          strokeWidth="2.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={MAP_ROUTE}
          fill="none"
          stroke="#1a73e8"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {!reduceMotion ? (
          <motion.path
            d={MAP_ROUTE}
            fill="none"
            stroke="#4285f4"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2.8 4.5"
            animate={{ strokeDashoffset: [0, -30] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
            opacity={0.7}
          />
        ) : null}

        <circle
          cx={MAP_ROAD_END.x}
          cy={MAP_ROAD_END.y}
          r="1.05"
          fill="#1a73e8"
          stroke="white"
          strokeWidth="0.55"
        />

        <g transform={`translate(${MAP_DEST.x}, ${MAP_DEST.y})`}>
          {!reduceMotion ? (
            <motion.circle
              cx="0"
              cy="1.2"
              r="5"
              fill="rgb(234 67 53 / 0.22)"
              initial={{ scale: 0.65, opacity: 0.55 }}
              animate={{ scale: [0.65, 1.25, 0.65], opacity: [0.45, 0.08, 0.45] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}
          <path
            d="M 0 -5.2 C -3.2 -5.2 -5.2 -3.1 -5.2 0 C -5.2 3.2 0 7.4 0 7.4 S 5.2 3.2 5.2 0 C 5.2 -3.1 3.2 -5.2 0 -5.2 Z"
            fill="#ea4335"
            stroke="white"
            strokeWidth="0.85"
            strokeLinejoin="round"
          />
          <circle cx="0" cy="-0.6" r="1.55" fill="white" />
        </g>

        <g transform={`translate(${MAP_START.x}, ${MAP_START.y})`}>
          {!reduceMotion ? (
            <motion.circle
              cx="0"
              cy="0"
              r="3.8"
              fill="none"
              stroke="#1a73e8"
              strokeWidth="0.6"
              initial={{ scale: 0.7, opacity: 0.4 }}
              animate={{ scale: [0.7, 1.25, 0.7], opacity: [0.35, 0, 0.35] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.35 }}
            />
          ) : null}
          <circle cx="0" cy="0" r="1.55" fill="#1a73e8" stroke="white" strokeWidth="0.7" />
        </g>

        {!reduceMotion ? (
          <g>
            <circle r="3.1" fill="rgb(26 115 232 / 0.2)">
              <animateMotion dur="6s" repeatCount="indefinite" path={MAP_ROUTE} rotate="auto" />
            </circle>
            <circle r="1.55" fill="#1a73e8" stroke="white" strokeWidth="0.9">
              <animateMotion dur="6s" repeatCount="indefinite" path={MAP_ROUTE} rotate="auto" />
            </circle>
          </g>
        ) : (
          <circle
            cx={(MAP_START.x + MAP_ROAD_END.x) / 2}
            cy={(MAP_START.y + MAP_ROAD_END.y) / 2}
            r="1.55"
            fill="#1a73e8"
            stroke="white"
            strokeWidth="0.9"
          />
        )}
      </svg>

      <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1 rounded-full bg-[#0062fa] px-2.5 py-1.5 shadow-[0_4px_12px_rgb(0_98_250_/_0.35)]">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden>
          <path d="M9 20 3 9l9-7 9 7-6 11" strokeLinejoin="round" />
          <path d="M9 20v-7h6v7" strokeLinejoin="round" />
        </svg>
        <span className="text-[0.55rem] font-semibold text-white">Expand Map</span>
      </div>
    </div>
  );
}

export function DriveWithQPick() {
  const t = useTranslations();
  const { driveWithQPick } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="relative bg-[#07111b] py-[var(--section-y-sm)] text-foam sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]"
      aria-labelledby="drive-qpick-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_30%,rgb(0_98_250_/_0.14),transparent_60%),radial-gradient(55%_45%_at_90%_60%,rgb(1_147_251_/_0.12),transparent_55%)]"
        aria-hidden="true"
      />

      <Container className="relative z-[1]">
        <div className="grid min-w-0 items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 xl:gap-20">
          {/* Phone first on mobile */}
          <div className="order-1 min-w-0 lg:order-2">
            <DriverShowcasePhone reduceMotion={reduceMotion} />
          </div>

          <div className="relative order-2 min-w-0 lg:order-1">
            <div
              className="pointer-events-none absolute -inset-x-4 -inset-y-8 bg-[radial-gradient(50%_45%_at_25%_30%,rgb(0_98_250_/_0.14),transparent_70%)]"
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="relative"
            >
              <p className="inline-flex rounded-full border border-foam/18 bg-foam/[0.07] px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.16em] text-brand-bright uppercase backdrop-blur-md">
                {t("driveWithQPick.eyebrow")}
              </p>

              <h2
                id="drive-qpick-heading"
                className="mt-6 max-w-[15ch] font-display text-[clamp(2rem,4.4vw,3.35rem)] leading-[1.06] font-semibold tracking-tight text-balance"
              >
                <span className="block">{t("driveWithQPick.heading")}</span>
                <span className="block">{t("driveWithQPick.headingLine2")}</span>
              </h2>

              <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-pretty text-foam/65 sm:text-lg">
                {t("driveWithQPick.sub")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: reduceMotion ? 0 : 0.12,
                ease: EASE,
              }}
              className="relative mt-8 flex flex-wrap gap-3"
            >
              <Link
                href="/drive"
                className="inline-flex min-h-12 max-w-full items-center justify-center rounded-[16px] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-6 text-sm font-medium text-paper shadow-[0_10px_28px_rgb(0_98_250_/_0.3)] transition-[transform,box-shadow,filter] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:shadow-[0_14px_40px_rgb(0_98_250_/_0.48)] hover:brightness-110 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50"
              >
                {t("driveWithQPick.cta")}
              </Link>
              <Link
                href="/drive"
                className="group inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-[16px] border border-foam/20 bg-foam/[0.07] px-6 text-sm font-medium text-foam backdrop-blur-md transition-[border-color,background-color,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:border-foam/35 hover:bg-foam/[0.12] motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50"
              >
                {t("driveWithQPick.secondaryCta")}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-cinematic)] group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </motion.div>

            <ul className="relative mt-9 hidden flex-wrap gap-2.5 sm:gap-3 md:flex">
              {TRUST_BADGES.map((badge, i) => {
                const Icon = badge.icon;
                return (
                  <motion.li
                    key={badge.id}
                    initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: reduceMotion ? 0 : 0.2 + i * 0.07,
                      ease: EASE,
                    }}
                    whileHover={
                      reduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-2 backdrop-blur-md"
                  >
                    <Icon
                      className="h-3.5 w-3.5 text-brand-bright"
                      strokeWidth={2.2}
                      aria-hidden
                    />
                    <span className="text-[0.75rem] font-medium text-foam/85">
                      {driveWithQPick.trust[badge.id]}
                    </span>
                  </motion.li>
                );
              })}
            </ul>

            <div className="relative mt-8 min-w-0 max-w-full md:hidden">
              <TrustChipMarquee
                labels={TRUST_BADGES.map(
                  (badge) => driveWithQPick.trust[badge.id],
                )}
                ariaLabel={t("driveWithQPick.trustAria")}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
