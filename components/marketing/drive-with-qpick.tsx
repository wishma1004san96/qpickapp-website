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
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CarFront,
  Headphones,
  Plane,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const BENEFIT_IDS = [
  "rides",
  "airport",
  "schedule",
  "earnings",
  "customers",
  "support",
] as const;

const BENEFIT_ICONS: Record<(typeof BENEFIT_IDS)[number], LucideIcon> = {
  rides: CarFront,
  airport: Plane,
  schedule: CalendarClock,
  earnings: Wallet,
  customers: BadgeCheck,
  support: Headphones,
};

const EASE = [0.22, 1, 0.36, 1] as const;

const PARALLAX_SPRING = { stiffness: 85, damping: 24, mass: 0.55 } as const;

type ScreenId = "splash" | "dashboard" | "profile";

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

const SCREEN_SPRING_SHOWCASE = {
  type: "spring" as const,
  stiffness: 160,
  damping: 24,
  mass: 0.55,
};

const PROFILE_NAME = "Dilan Perera";
const PROFILE_EMAIL = "dilan.perera@qpickdriver.com";

/** 1 splash → 2 profile → 3 dashboard (Hello Dilan + map). */
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

function ScreenshotFrame({
  src,
  alt,
  layout,
  priority,
}: {
  src: string;
  alt: string;
  layout: ScreenLayout;
  priority?: boolean;
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
        priority={priority}
        draggable={false}
      />
    </div>
  );
}

/** Premium phone mockup — splash + native dashboard (with map) + profile. */
function DriverAppPhoneMockup({ reduceMotion }: { reduceMotion: boolean }) {
  const finePointer = useFinePointer();
  const parallaxOn = finePointer && !reduceMotion;
  const [screenIndex, setScreenIndex] = useState(0);
  const [preloaded, setPreloaded] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const phoneRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(
    useTransform(my, [-0.5, 0.5], [6, -6]),
    PARALLAX_SPRING,
  );
  const rotateY = useSpring(
    useTransform(mx, [-0.5, 0.5], [-8, 8]),
    PARALLAX_SPRING,
  );
  const parallaxX = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), PARALLAX_SPRING);
  const parallaxY = useSpring(useTransform(my, [-0.5, 0.5], [-4, 4]), PARALLAX_SPRING);

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

  useEffect(() => {
    if (reduceMotion || !preloaded) return;
    const id = window.setTimeout(() => {
      setScreenIndex((i) => (i + 1) % DRIVER_SCREENS.length);
    }, screen.durationMs);
    return () => window.clearTimeout(id);
  }, [reduceMotion, preloaded, screen.durationMs, screenIndex]);

  useEffect(() => {
    if (screen.id !== "dashboard") {
      setEarnings(0);
      return;
    }
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
  }, [reduceMotion, screen.id, screenIndex]);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!parallaxOn || !phoneRef.current) return;
      if (event.pointerType !== "mouse") return;
      const rect = phoneRef.current.getBoundingClientRect();
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
    <div className="flex justify-center lg:justify-end">
      <div
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        {PRELOAD_SRCS.map((src) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={840}
            height={1900}
            priority
          />
        ))}
      </div>

      <div className="[perspective:1400px]">
        <motion.div
          ref={phoneRef}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          initial={reduceMotion ? false : { opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative w-[min(17.5rem,78vw)]"
          style={
            parallaxOn
              ? {
                  rotateX,
                  rotateY,
                  x: parallaxX,
                  y: parallaxY,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }
              : undefined
          }
        >
          <motion.div
            className="absolute -inset-12 rounded-full bg-[radial-gradient(circle,rgb(0_98_250_/_0.42)_0%,rgb(1_147_251_/_0.12)_38%,transparent_72%)] blur-3xl"
            animate={
              reduceMotion
                ? undefined
                : { opacity: [0.4, 0.72, 0.4], scale: [0.96, 1.08, 0.96] }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }
            aria-hidden="true"
          />

          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -11, 0] }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }
            className="relative"
            style={parallaxOn ? { transformStyle: "preserve-3d" } : undefined}
          >
            <div className="relative rounded-[1.75rem] bg-gradient-to-b from-[#2a313d] via-[#161e28] to-[#0a1118] p-[0.45rem] shadow-[0_2px_0_rgb(255_255_255_/_0.14)_inset,0_48px_96px_rgb(0_0_0_/_0.62),0_20px_48px_rgb(0_98_250_/_0.22),0_4px_12px_rgb(0_0_0_/_0.35)]">
              <div
                className="relative aspect-[9/19.2] overflow-hidden rounded-[1.35rem]"
                style={{ backgroundColor: "#061428" }}
              >
                <div
                  className="absolute top-2.5 left-1/2 z-[5] h-1.5 w-[34%] -translate-x-1/2 rounded-full bg-[#05080d]/95 shadow-[0_1px_2px_rgb(0_0_0_/_0.4)]"
                  aria-hidden="true"
                />

                {!preloaded ? (
                  <ScreenshotFrame
                    src={DRIVER_SCREENS[0].src}
                    alt={DRIVER_SCREENS[0].alt}
                    layout={DRIVER_SCREENS[0].layout!}
                    priority
                  />
                ) : (
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={screen.id}
                      className="absolute inset-0 overflow-hidden"
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, y: 14, scale: 0.98 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={
                        reduceMotion
                          ? undefined
                          : { opacity: 0, y: -10, scale: 0.98 }
                      }
                      transition={
                        reduceMotion ? { duration: 0 } : SCREEN_SPRING_SHOWCASE
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
                          priority={screenIndex === 0}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
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

/** Native driver dashboard — Hello Dilan + stats + BIA hire map. */
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
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.28, 1], opacity: [0.85, 1, 0.85] }
              }
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
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
        priority
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
                priority
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
      className="relative overflow-hidden bg-[#07111b] py-[var(--section-y-sm)] text-foam sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]"
      aria-labelledby="drive-qpick-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_85%_20%,rgb(0_98_250_/_0.18),transparent_55%),radial-gradient(55%_45%_at_10%_85%,rgb(1_147_251_/_0.1),transparent_50%)]"
        aria-hidden="true"
      />

      <Container className="relative z-[1]">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-x-6 -inset-y-10 bg-[radial-gradient(55%_50%_at_30%_35%,rgb(0_98_250_/_0.16),transparent_70%)]"
              aria-hidden="true"
            />

            <motion.header
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="relative"
            >
              <p className="inline-flex rounded-full border border-foam/18 bg-foam/[0.07] px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.16em] text-brand-bright uppercase backdrop-blur-md">
                {t("driveWithQPick.eyebrow")}
              </p>
              <h2
                id="drive-qpick-heading"
                className="mt-5 max-w-[16ch] font-display text-[clamp(1.95rem,4.2vw,3.15rem)] leading-[1.08] font-semibold tracking-tight text-balance"
              >
                <span className="block">{t("driveWithQPick.heading")}</span>
                <span className="block">{t("driveWithQPick.headingLine2")}</span>
              </h2>
              <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-pretty text-foam/65 sm:text-lg">
                {t("driveWithQPick.sub")}
              </p>
            </motion.header>

            <ul className="relative mt-9 grid gap-3 sm:grid-cols-2">
              {BENEFIT_IDS.map((id, i) => {
                const Icon = BENEFIT_ICONS[id];
                return (
                  <motion.li
                    key={id}
                    initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.45,
                      delay: reduceMotion ? 0 : 0.08 + i * 0.06,
                      ease: EASE,
                    }}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : {
                            y: -6,
                            transition: { duration: 0.25, ease: EASE },
                          }
                    }
                    className="group rounded-[20px] border border-foam/12 bg-foam/[0.055] px-4 py-4 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)] backdrop-blur-md transition-[border-color,box-shadow] duration-300 ease-[var(--ease-cinematic)] hover:border-brand/40 hover:shadow-[0_0_28px_rgb(0_98_250_/_0.18),inset_0_1px_0_rgb(255_255_255_/_0.08)]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-brand/25 bg-brand/15 text-brand-bright transition-transform duration-300 ease-[var(--ease-cinematic)] group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm leading-snug font-semibold text-foam">
                          {driveWithQPick.benefits[id].title}
                        </p>
                        <p className="mt-1 text-[0.8rem] leading-snug text-pretty text-foam/55">
                          {driveWithQPick.benefits[id].body}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: reduceMotion ? 0 : 0.48,
                ease: EASE,
              }}
              className="relative mt-9 flex flex-wrap gap-3"
            >
              <Link
                href="/drive"
                className="inline-flex min-h-12 max-w-full items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-6 text-sm font-medium text-paper shadow-[0_8px_24px_rgb(0_98_250_/_0.28)] transition-[transform,box-shadow,filter] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:shadow-[0_12px_36px_rgb(0_98_250_/_0.45)] hover:brightness-110 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50"
              >
                {t("driveWithQPick.cta")}
              </Link>
              <Link
                href="/drive"
                className="group inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-foam/20 bg-foam/[0.07] px-6 text-sm font-medium text-foam backdrop-blur-md transition-[border-color,background-color,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:border-foam/35 hover:bg-foam/[0.12] motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50"
              >
                {t("driveWithQPick.secondaryCta")}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-cinematic)] group-hover:translate-x-1"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </motion.div>
          </div>

          <DriverAppPhoneMockup reduceMotion={reduceMotion} />
        </div>
      </Container>
    </section>
  );
}
