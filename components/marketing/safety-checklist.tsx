"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
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

const EASE = [0.22, 1, 0.36, 1] as const;
const TILT_SPRING = { stiffness: 120, damping: 22, mass: 0.5 } as const;

const SAFETY_ITEM_IDS = [
  "verified",
  "pricing",
  "sharing",
  "support",
  "insured",
] as const;

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

function AnimatedCheck({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <span
      className="relative mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/12 text-brand transition-[background-color,box-shadow,transform] duration-300 group-hover:bg-brand group-hover:text-paper group-hover:shadow-[0_0_20px_rgb(0_98_250_/_0.35)]"
      aria-hidden="true"
    >
      <motion.svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-110"
      >
        <motion.path
          d="M3.5 8.2 L6.4 11.1 L12.5 4.8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
        />
      </motion.svg>
    </span>
  );
}

function SafetyGlassPanel({ reduceMotion }: { reduceMotion: boolean }) {
  const { safety } = useMessages();
  const finePointer = useFinePointer();
  const tiltOn = finePointer && !reduceMotion;
  const panelRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), TILT_SPRING);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), TILT_SPRING);

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!tiltOn || !panelRef.current) return;
      if (event.pointerType !== "mouse") return;
      const rect = panelRef.current.getBoundingClientRect();
      mx.set((event.clientX - rect.left) / rect.width - 0.5);
      my.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [mx, my, tiltOn],
  );

  const onPointerLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  return (
    <div className="[perspective:1100px]">
      <motion.div
        ref={panelRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.65, ease: EASE }}
        className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/45 p-4 shadow-[0_24px_64px_rgb(10_22_32_/_0.08),0_0_0_1px_rgb(0_98_250_/_0.04)] backdrop-blur-2xl sm:p-6 lg:p-7"
        style={
          tiltOn
            ? {
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                willChange: "transform",
              }
            : undefined
        }
      >
        <div
          className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgb(0_98_250_/_0.16),transparent_68%)] blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-10 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgb(1_147_251_/_0.12),transparent_70%)] blur-2xl"
          aria-hidden="true"
        />

        <ul className="relative space-y-2.5 sm:space-y-3">
          {SAFETY_ITEM_IDS.map((id, index) => {
            const item = safety.items[id];
            return (
              <motion.li
                key={id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{
                  duration: 0.45,
                  delay: reduceMotion ? 0 : 0.12 + index * 0.08,
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
                className="group relative flex min-h-[4.75rem] items-start gap-3.5 rounded-[20px] border border-white/70 bg-white/55 px-4 py-4 shadow-[0_8px_24px_rgb(10_22_32_/_0.04)] backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-300 [@media(hover:hover)]:hover:border-brand/25 [@media(hover:hover)]:hover:bg-white/75 [@media(hover:hover)]:hover:shadow-[0_16px_40px_rgb(0_98_250_/_0.14)] sm:min-h-[5.25rem] sm:gap-4 sm:px-5 sm:py-5"
              >
                <AnimatedCheck reduceMotion={reduceMotion} />
                <div className="min-w-0 pt-0.5">
                  <p className="text-[0.95rem] leading-snug font-semibold tracking-tight text-ink sm:text-base">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-pretty text-ink/55">
                    {item.body}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}

export function SafetyChecklist() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="relative overflow-hidden py-[var(--section-y-sm)] sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]"
      aria-labelledby="safety-heading"
    >
      {/* Soft blue atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 bg-[#f4f8fc]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_50%_at_12%_20%,rgb(0_98_250_/_0.1),transparent_60%),radial-gradient(50%_45%_at_88%_70%,rgb(1_147_251_/_0.09),transparent_58%),radial-gradient(40%_35%_at_50%_100%,rgb(0_98_250_/_0.06),transparent_55%)]"
        aria-hidden="true"
      />
      {/* Light grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(0 98 250 / 0.045) 1px, transparent 1px), linear-gradient(90deg, rgb(0 98 250 / 0.045) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)",
        }}
        aria-hidden="true"
      />
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />
      {/* Glowing orbs */}
      <motion.div
        className="pointer-events-none absolute top-[8%] left-[8%] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgb(0_98_250_/_0.18),transparent_70%)] blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : { opacity: [0.45, 0.75, 0.45], scale: [0.92, 1.08, 0.92] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none absolute right-[6%] bottom-[12%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgb(1_147_251_/_0.16),transparent_70%)] blur-3xl"
        animate={
          reduceMotion
            ? undefined
            : { opacity: [0.35, 0.7, 0.35], scale: [1.05, 0.92, 1.05] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 9.5, repeat: Infinity, ease: "easeInOut", delay: 1 }
        }
        aria-hidden="true"
      />

      <Container className="relative z-[1]">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:gap-16 xl:gap-20">
          <div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <p className="inline-flex max-w-full rounded-full border border-brand/15 bg-white/50 px-3.5 py-1.5 font-mono text-[0.625rem] tracking-[0.14em] text-brand uppercase shadow-[0_4px_16px_rgb(0_98_250_/_0.06)] backdrop-blur-md sm:text-[0.6875rem] sm:tracking-[0.16em]">
                {t("safety.eyebrow")}
              </p>

              <h2
                id="safety-heading"
                className="mt-5 max-w-[14ch] font-display text-[clamp(1.75rem,4.2vw,3.25rem)] leading-[1.08] font-semibold tracking-tight text-balance text-ink sm:mt-6"
              >
                <span className="block">{t("safety.heading")}</span>
                <span className="block">{t("safety.headingLine2")}</span>
              </h2>

              <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-pretty text-ink/60 sm:text-lg">
                {t("safety.intro")}
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: reduceMotion ? 0 : 0.12,
                ease: EASE,
              }}
              className="mt-8"
            >
              <Link
                href="/safety"
                className="group inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-6 text-sm font-medium text-paper shadow-[0_10px_28px_rgb(0_98_250_/_0.28)] transition-[transform,box-shadow,filter] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:shadow-[0_14px_40px_rgb(0_98_250_/_0.42)] hover:brightness-110 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                {t("safety.cta")}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.9,
                delay: reduceMotion ? 0 : 0.35,
                ease: EASE,
              }}
              className="mt-7"
            >
              <p
                className="text-[0.85rem] tracking-[0.18em] text-brand"
                aria-hidden="true"
              >
                ★★★★★
              </p>
              <p className="mt-1.5 text-sm text-ink/50">{t("safety.trustLine")}</p>
            </motion.div>
          </div>

          <SafetyGlassPanel reduceMotion={reduceMotion} />
        </div>
      </Container>
    </section>
  );
}
