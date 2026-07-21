"use client";

import {
  AnimatePresence,
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
  type ReactNode,
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
const SCREEN_SPRING = {
  type: "spring" as const,
  stiffness: 160,
  damping: 24,
  mass: 0.55,
};

const TRUST_BADGES = [
  { id: "verified", icon: BadgeCheck },
  { id: "payouts", icon: Wallet },
  { id: "support", icon: Headphones },
] as const;

type ScreenId = "splash" | "profile" | "dashboard";

type ScreenLayout = {
  bg: string;
  mode: "contain" | "cover";
  objectPosition: string;
};

type DriverScreen = {
  id: ScreenId;
  src: string;
  alt: string;
  durationMs: number;
  layout?: ScreenLayout;
};

/** Splash → profile → dashboard loop */
const DRIVER_SCREENS: DriverScreen[] = [
  {
    id: "splash",
    src: "/images/app/driver-app/splash.webp",
    alt: "Q Pick Driver splash screen",
    durationMs: 2500,
    layout: { bg: "#061428", mode: "contain", objectPosition: "50% 50%" },
  },
  {
    id: "profile",
    src: "/images/app/driver-app/profile-avatar.webp",
    alt: "Q Pick Driver profile",
    durationMs: 4000,
  },
  {
    id: "dashboard",
    src: "/images/app/driver-app/hire-map.webp",
    alt: "Q Pick Driver dashboard",
    durationMs: 4500,
  },
];

const PRELOAD_SRCS = [
  "/images/app/driver-app/splash.webp",
  "/images/app/driver-app/profile-avatar.webp",
  "/images/app/driver-app/hire-map.webp",
] as const;

const PROFILE_NAME = "Dilan Perera";
const PROFILE_EMAIL = "dilan.perera@qpickdriver.com";

const FLOAT_CARDS = [
  {
    id: "ride",
    icon: Navigation,
    titleKey: "rideTitle" as const,
    bodyKey: "rideBody" as const,
    // Tuck tight against phone left edge; desktop anchors beside phone bezel
    className:
      "left-0 top-[10%] z-[3] w-[10.75rem] -translate-x-[calc(100%-2.75rem)] lg:left-1/2 lg:right-auto lg:top-[12%] lg:w-[11.25rem] lg:-translate-x-[calc(100%+9rem)]",
    bobClass: "drive-float-bob drive-float-bob--a",
    delay: 0,
  },
  {
    id: "airport",
    icon: Plane,
    titleKey: "airportTitle" as const,
    bodyKey: "airportBody" as const,
    className:
      "right-0 top-[10%] z-[3] w-[10.75rem] translate-x-[calc(100%-2.75rem)] lg:top-[12%] lg:w-[11.25rem] lg:translate-x-[calc(100%-3rem)]",
    bobClass: "drive-float-bob drive-float-bob--b",
    delay: 0.4,
  },
  {
    id: "earnings",
    icon: Wallet,
    titleKey: "earningsTitle" as const,
    bodyKey: "earningsBody" as const,
    className:
      "bottom-[18%] left-0 z-[3] w-[10.75rem] -translate-x-[calc(100%-2.75rem)] lg:bottom-[20%] lg:w-[11.25rem] lg:-translate-x-[calc(100%-3rem)]",
    bobClass: "drive-float-bob drive-float-bob--c",
    delay: 0.8,
  },
  {
    id: "online",
    icon: BadgeCheck,
    titleKey: "onlineTitle" as const,
    bodyKey: "onlineBody" as const,
    // Tuck tight against phone right edge; desktop anchors beside phone bezel
    className:
      "right-0 bottom-[18%] z-[3] w-[10.75rem] translate-x-[calc(100%-2.75rem)] lg:left-1/2 lg:right-auto lg:bottom-[20%] lg:w-[11.25rem] lg:translate-x-[9rem]",
    bobClass: "drive-float-bob drive-float-bob--d",
    delay: 1.2,
  },
];

function FloatCardFace({
  icon: Icon,
  title,
  body,
  compact = false,
}: {
  icon: (typeof FLOAT_CARDS)[number]["icon"];
  title: string;
  body: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "rounded-[16px] border border-white/15 bg-white/[0.1] px-2.5 py-2.5 shadow-[0_12px_32px_rgb(0_0_0_/_0.3)] backdrop-blur-xl"
          : "rounded-[20px] border border-white/15 bg-white/[0.1] px-3.5 py-3 shadow-[0_16px_40px_rgb(0_0_0_/_0.35)] backdrop-blur-xl"
      }
    >
      <div className={`flex items-start ${compact ? "gap-2" : "gap-2.5"}`}>
        <span
          className={`grid shrink-0 place-items-center bg-brand/20 text-brand-bright ${
            compact
              ? "h-7 w-7 rounded-[10px]"
              : "h-8 w-8 rounded-[12px]"
          }`}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
        </span>
        <div className="min-w-0">
          <p
            className={`leading-tight font-semibold text-foam ${
              compact ? "text-[0.68rem]" : "text-[0.72rem]"
            }`}
          >
            {title}
          </p>
          <p
            className={`mt-0.5 leading-snug text-foam/55 ${
              compact ? "text-[0.58rem]" : "text-[0.65rem]"
            }`}
          >
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

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

/** Floating iPhone showcase — splash → profile → dashboard + glass cards. */
function DriverShowcasePhone({ reduceMotion }: { reduceMotion: boolean }) {
  const finePointer = useFinePointer();
  const isDesktop = useMinWidth(1024);
  const parallaxOn = finePointer && !reduceMotion && isDesktop;
  const stageRef = useRef<HTMLDivElement>(null);
  const { driveWithQPick } = useMessages();
  const floats = driveWithQPick.floatCards;
  const [screenIndex, setScreenIndex] = useState(0);
  const [preloaded, setPreloaded] = useState(false);
  const [earnings, setEarnings] = useState(0);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), PARALLAX_SPRING);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), PARALLAX_SPRING);
  const shiftX = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), PARALLAX_SPRING);
  const shiftY = useSpring(useTransform(my, [-0.5, 0.5], [-8, 8]), PARALLAX_SPRING);

  const screen = DRIVER_SCREENS[screenIndex];

  useEffect(() => {
    let cancelled = false;
    const loaders = PRELOAD_SRCS.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    );
    void Promise.all(loaders).then(() => {
      if (!cancelled) setPreloaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Always cycle screens on mount — do not gate on Reduce Motion.
  useEffect(() => {
    if (!preloaded) return;
    console.log("Driver slideshow started");
    const id = window.setTimeout(() => {
      setScreenIndex((i) => (i + 1) % DRIVER_SCREENS.length);
    }, screen.durationMs);
    return () => window.clearTimeout(id);
  }, [preloaded, screen.durationMs, screenIndex]);

  useEffect(() => {
    if (screen.id !== "dashboard") {
      setEarnings(0);
      return;
    }
    console.log("Floating animation started");
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
  }, [screen.id, screenIndex]);

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
      className="relative mx-auto flex w-full max-w-[24rem] flex-col items-center gap-5 overflow-visible px-3 py-6 sm:max-w-[34rem] sm:gap-0 sm:px-8 sm:py-8 lg:max-w-none lg:px-6 lg:py-10 [perspective:1200px]"
    >
      <div
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        {PRELOAD_SRCS.map((src) => (
          <Image key={src} src={src} alt="" width={840} height={1900} />
        ))}
      </div>

      <motion.div
        className="pointer-events-none absolute top-[8%] h-[55%] w-[80%] rounded-full bg-[radial-gradient(circle,rgb(0_98_250_/_0.48)_0%,rgb(1_147_251_/_0.16)_42%,transparent_72%)] blur-3xl sm:top-1/2 sm:h-[70%] sm:w-[75%] sm:-translate-y-1/2"
        initial={{ opacity: 0.55, scale: 0.94 }}
        animate={{ opacity: [0.55, 0.85, 0.55], scale: [0.94, 1.08, 0.94] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      {/* Phone first on mobile — screen fully visible, no cards on top */}
      <div className="relative z-[5] order-1 w-[min(14.5rem,72vw)] sm:absolute sm:top-1/2 sm:left-1/2 sm:w-[min(16.5rem,48%)] sm:-translate-x-1/2 sm:-translate-y-1/2 lg:w-[17rem]">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: EASE }}
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
              <div
                className="relative aspect-[9/19.2] overflow-hidden rounded-[1.55rem]"
                style={{ backgroundColor: "#061428" }}
              >
                <div
                  className="absolute top-2.5 left-1/2 z-10 h-1.5 w-[32%] -translate-x-1/2 rounded-full bg-[#05080d]"
                  aria-hidden="true"
                />

                {!preloaded ? (
                  <ScreenshotFrame
                    src={DRIVER_SCREENS[0].src}
                    alt={DRIVER_SCREENS[0].alt}
                    layout={DRIVER_SCREENS[0].layout!}
                  />
                ) : (
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={screen.id}
                      className="absolute inset-0 overflow-hidden"
                      initial={
                        reduceMotion
                          ? { opacity: 1 }
                          : { opacity: 0, y: 14, scale: 0.98 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: -10, scale: 0.98 }
                      }
                      transition={
                        reduceMotion ? { duration: 0.2 } : SCREEN_SPRING
                      }
                    >
                      {screen.id === "dashboard" ? (
                        <DriverDashboardScreen
                          earnings={earnings}
                          reduceMotion={reduceMotion}
                        />
                      ) : screen.id === "profile" ? (
                        <DriverProfileScreen reduceMotion={reduceMotion} />
                      ) : (
                        <ScreenshotFrame
                          src={screen.src}
                          alt={screen.alt}
                          layout={screen.layout!}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile: 2×2 grid under the phone — never covers the screen */}
      <div className="relative z-[4] order-2 grid w-full grid-cols-2 gap-2.5 sm:hidden">
        {FLOAT_CARDS.map((card) => (
          <div key={card.id} className={card.bobClass}>
            <FloatCardFace
              icon={card.icon}
              title={floats[card.titleKey]}
              body={floats[card.bodyKey]}
              compact
            />
          </div>
        ))}
      </div>

      {/* Tablet/desktop: float beside the phone, tucked close to the bezel */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        {FLOAT_CARDS.map((card) => (
          <motion.div
            key={card.id}
            className={`absolute ${card.className}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.55,
              delay: 0.2 + card.delay * 0.12,
              ease: EASE,
            }}
          >
            <div className={card.bobClass}>
              <FloatCardFace
                icon={card.icon}
                title={floats[card.titleKey]}
                body={floats[card.bodyKey]}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reserve vertical space for absolute floats on sm+ */}
      <div className="hidden min-h-[32rem] w-full sm:block lg:min-h-[36rem]" aria-hidden="true" />
    </div>
  );
}

function ScreenshotFrame({
  src,
  alt,
  layout,
}: {
  src: string;
  alt: string;
  layout: ScreenLayout;
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: layout.bg }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 78vw, 280px"
        className={`select-none ${
          layout.mode === "contain" ? "object-contain" : "object-cover"
        }`}
        style={{ objectPosition: layout.objectPosition }}
        draggable={false}
      />
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

type ProfileMenuItem = {
  id: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  badge?: string;
};

/** Native profile — Dilan Perera + verified badge. */
function DriverProfileScreen({ reduceMotion }: { reduceMotion: boolean }) {
  const menuItems: ProfileMenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      active: true,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
        </svg>
      ),
    },
    {
      id: "history",
      label: "Trip History",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "payments",
      label: "Payments",
      badge: "New",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      ),
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
  ];

  const motionProps = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease: EASE },
        };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#eef1f4] font-sans text-[#0a1620]">
      <div className="absolute inset-0 overflow-hidden bg-[#eef2f6]">
        <Image
          src="/images/app/driver-app/dashboard-clean.webp"
          alt=""
          fill
          sizes="(max-width: 1024px) 78vw, 280px"
          className="select-none object-cover"
          style={{ objectPosition: "78% 50%" }}
          aria-hidden
        />
        <div className="absolute top-[3.5%] right-[3%] flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0062fa" strokeWidth="2" aria-hidden>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
      </div>

      <div className="absolute inset-y-0 left-0 flex w-[86%] flex-col rounded-r-[1.1rem] bg-white shadow-[4px_0_28px_rgb(10_22_32_/_0.1)]">
        <div className="px-4 pt-4 pb-2">
          <motion.div className="relative h-[3.7rem] w-[3.7rem] shrink-0" {...motionProps(0)}>
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <Image
                src="/images/app/driver-app/profile-avatar.webp"
                alt={PROFILE_NAME}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <motion.span
              className="absolute right-[6px] bottom-[6px] z-[1] grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-white shadow-[0_1px_5px_rgb(10_22_32_/_0.2)]"
              aria-hidden
              animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
              transition={{
                duration: 0.85,
                repeat: Infinity,
                repeatDelay: 2.15,
                ease: "easeInOut",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 2 4.5 5.2v5.4c0 5 3.4 9.6 7.5 11.4 4.1-1.8 7.5-6.4 7.5-11.4V5.2L12 2z"
                  fill="#1f7a4c"
                />
                <path
                  d="m9.2 11.6 2 2 3.8-3.9"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          </motion.div>

          <motion.div className="mt-3" {...motionProps(0.06)}>
            <p className="text-[0.98rem] leading-tight font-bold tracking-[-0.01em] text-[#1a2832]">
              {PROFILE_NAME}
            </p>
            <p className="mt-1 text-[0.7rem] leading-snug text-[#7a8a96]">
              {PROFILE_EMAIL}
            </p>
          </motion.div>

          <motion.div
            className="mt-3.5 flex overflow-hidden rounded-xl bg-[#f1f4f8]"
            {...motionProps(0.12)}
          >
            <div className="flex flex-1 flex-col items-center px-2 py-2.5">
              <span className="text-[0.95rem] leading-none font-bold">4.9</span>
              <span className="mt-1 text-[0.58rem] text-[#6b7c88]">Rating</span>
            </div>
            <div className="w-px bg-[#dce3ea]" />
            <div className="flex flex-1 flex-col items-center px-2 py-2.5">
              <span className="text-[0.95rem] leading-none font-bold">304</span>
              <span className="mt-1 text-[0.58rem] text-[#6b7c88]">Trips</span>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 overflow-hidden px-3 pt-3 pb-4">
          <p className="px-1 text-[0.58rem] font-semibold tracking-[0.12em] text-[#9aa8b3] uppercase">
            Main Menu
          </p>
          <ul className="mt-2 space-y-1">
            {menuItems.map((item, i) => (
              <motion.li key={item.id} {...motionProps(0.18 + i * 0.06)}>
                <div
                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 ${
                    item.active ? "bg-[#e8f1ff] text-[#0062fa]" : "text-[#3a4a56]"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                      item.active ? "bg-[#0062fa] text-white" : "bg-[#f1f4f8]"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1 text-[0.8rem] font-semibold">
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="rounded-full bg-[#e11d48] px-1.5 py-0.5 text-[0.52rem] font-semibold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                  <ChevronRightIcon
                    className={item.active ? "text-[#0062fa]" : "text-[#b0bcc6]"}
                  />
                </div>
              </motion.li>
            ))}
          </ul>

          <p className="mt-4 px-1 text-[0.58rem] font-semibold tracking-[0.12em] text-[#9aa8b3] uppercase">
            Account
          </p>
          <motion.div
            className="mt-2 flex items-center gap-2.5 rounded-xl px-2.5 py-2.5"
            {...motionProps(0.55)}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#fde8ea] text-[#e11d48]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span className="text-[0.8rem] font-semibold text-[#e11d48]">Sign Out</span>
          </motion.div>
        </div>
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
        <div className="grid min-w-0 items-center gap-8 overflow-visible sm:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 xl:gap-20">
          {/* Phone first on mobile */}
          <div className="order-1 min-w-0 overflow-visible lg:order-2">
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
