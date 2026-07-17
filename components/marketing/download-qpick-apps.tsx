"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { AppStoreBadge } from "@/components/ui/app-store-badge";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site";

type AppTab = "passenger" | "driver";

const PASSENGER_SCREENS = [
  { src: "/images/app/home.webp", altKey: "screenHome" },
  { src: "/images/app/destination.webp", altKey: "screenBooking" },
  { src: "/images/app/tracking.webp", altKey: "screenTracking" },
] as const;

const DRIVER_SCREENS = ["dashboard", "request", "earnings"] as const;

const EASE = [0.22, 1, 0.36, 1] as const;
const SCREEN_MS = 3200;
const DRIVER_PLAY_STORE_URL = siteConfig.store.driverGooglePlay;

/**
 * Download the Q Pick Apps — passenger / driver showcase with real app screens.
 */
export function DownloadQPickApps() {
  const t = useTranslations();
  const { downloadApps } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;
  const [tab, setTab] = useState<AppTab>("passenger");
  const [screenIndex, setScreenIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const len =
      tab === "passenger" ? PASSENGER_SCREENS.length : DRIVER_SCREENS.length;
    const id = window.setInterval(() => {
      setScreenIndex((i) => (i + 1) % len);
    }, SCREEN_MS);
    return () => window.clearInterval(id);
  }, [tab, reduceMotion]);

  const onTabChange = (next: AppTab) => {
    setTab(next);
    setScreenIndex(0);
  };

  const features =
    tab === "passenger"
      ? downloadApps.passenger.features
      : downloadApps.driver.features;
  const title =
    tab === "passenger"
      ? t("downloadApps.passenger.title")
      : t("downloadApps.driver.title");

  return (
    <section
      className="relative overflow-hidden bg-[#07111b] py-[var(--section-y-sm)] text-foam sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]"
      aria-labelledby="download-apps-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_55%_at_18%_45%,rgb(0_98_250_/_0.22),transparent_55%),radial-gradient(50%_45%_at_90%_80%,rgb(1_147_251_/_0.12),transparent_50%)]"
        aria-hidden="true"
      />

      <Container className="relative z-[1]">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
          {/* Phone — first on mobile/tablet, left on desktop */}
          <motion.div
            className="order-1 flex justify-center lg:order-1 lg:justify-start"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="relative">
              <div
                className="absolute top-1/2 left-1/2 h-[78%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/35 blur-3xl"
                aria-hidden="true"
              />
              <motion.div
                className="relative w-[min(17.5rem,72vw)]"
                animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 6.5, repeat: Infinity, ease: "easeInOut" }
                }
                style={
                  reduceMotion ? undefined : { transformPerspective: 1400 }
                }
              >
                <div className="relative rounded-[1.85rem] bg-gradient-to-b from-[#252b36] to-[#0a1018] p-[0.5rem] shadow-[0_32px_70px_rgb(0_0_0_/_0.5)]">
                  <div className="relative aspect-[9/19] overflow-hidden rounded-[1.4rem] bg-[#0a1620]">
                    <div
                      className="absolute top-2.5 left-1/2 z-[3] h-1.5 w-[32%] -translate-x-1/2 rounded-full bg-black"
                      aria-hidden="true"
                    />
                    <AnimatePresence mode="wait">
                      {tab === "passenger" ? (
                        <motion.div
                          key={`p-${screenIndex}`}
                          className="absolute inset-0"
                          initial={
                            reduceMotion ? false : { opacity: 0, scale: 1.02 }
                          }
                          animate={{ opacity: 1, scale: 1 }}
                          exit={
                            reduceMotion ? undefined : { opacity: 0 }
                          }
                          transition={{ duration: 0.4, ease: EASE }}
                        >
                          <Image
                            src={PASSENGER_SCREENS[screenIndex].src}
                            alt={t(
                              `downloadApps.passenger.${PASSENGER_SCREENS[screenIndex].altKey}`,
                            )}
                            fill
                            sizes="(max-width: 1024px) 72vw, 280px"
                            className="object-cover object-top"
                            priority={false}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key={`d-${screenIndex}`}
                          className="absolute inset-0"
                          initial={
                            reduceMotion ? false : { opacity: 0, scale: 1.02 }
                          }
                          animate={{ opacity: 1, scale: 1 }}
                          exit={
                            reduceMotion ? undefined : { opacity: 0 }
                          }
                          transition={{ duration: 0.4, ease: EASE }}
                        >
                          <DriverScreen
                            kind={DRIVER_SCREENS[screenIndex]}
                            copy={downloadApps.driver.screens}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div
            className="order-2 lg:order-2"
            initial={reduceMotion ? false : { opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <p className="inline-flex rounded-full border border-foam/20 bg-foam/10 px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.18em] text-brand-bright uppercase backdrop-blur-md">
              {t("downloadApps.eyebrow")}
            </p>
            <h2
              id="download-apps-heading"
              className="mt-5 max-w-[14ch] font-display text-[clamp(1.85rem,4vw,3rem)] leading-[1.1] font-semibold tracking-tight text-balance"
            >
              {t("downloadApps.heading")}
            </h2>
            <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-pretty text-foam/65 sm:text-lg">
              {t("downloadApps.sub")}
            </p>

            <div
              role="tablist"
              aria-label={t("downloadApps.tablistAria")}
              className="mt-8 inline-flex rounded-full border border-foam/15 bg-foam/[0.06] p-1 backdrop-blur-md"
            >
              {(["passenger", "driver"] as const).map((id) => {
                const selected = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    id={`download-tab-${id}`}
                    onClick={() => onTabChange(id)}
                    className={[
                      "min-h-10 rounded-full px-4 text-sm font-medium transition-[background-color,color,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50",
                      selected
                        ? "bg-brand text-paper shadow-[var(--shadow-glow-brand)]"
                        : "text-foam/70 hover:text-foam",
                    ].join(" ")}
                  >
                    {t(`downloadApps.tabs.${id}`)}
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              aria-labelledby={`download-tab-${tab}`}
              className="mt-8"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <h3 className="text-xl font-semibold tracking-tight text-balance text-foam">
                    {title}
                  </h3>
                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {features.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-foam/80"
                      >
                        <span
                          className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand/25 text-brand-bright"
                          aria-hidden="true"
                        >
                          <svg
                            viewBox="0 0 16 16"
                            width="10"
                            height="10"
                            fill="none"
                          >
                            <path
                              d="M3.5 8.2 L6.4 11.1 L12.5 4.8"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span className="text-pretty">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
                    {tab === "passenger" ? (
                      <>
                        <AppStoreBadge
                          store="android"
                          className="border-foam/20 bg-ink/80 sm:min-w-[12.5rem]"
                        />
                        <AppStoreBadge
                          store="ios"
                          className="border-foam/20 bg-ink/80 sm:min-w-[12.5rem]"
                        />
                      </>
                    ) : (
                      <>
                        <AppStoreBadge
                          store="android"
                          href={DRIVER_PLAY_STORE_URL}
                          className="border-foam/20 bg-ink/80 sm:min-w-[12.5rem]"
                          subtitle={t("downloadApps.store.driverPlay")}
                        />
                        <AppStoreBadge
                          store="ios"
                          className="border-foam/20 bg-ink/80 sm:min-w-[12.5rem]"
                        />
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function DriverScreen({
  kind,
  copy,
}: {
  kind: (typeof DRIVER_SCREENS)[number];
  copy: {
    dashboardTitle: string;
    online: string;
    earningsLabel: string;
    earningsValue: string;
    requestTitle: string;
    route: string;
    fare: string;
    accept: string;
    earningsScreenTitle: string;
    weekLabel: string;
    tripsLabel: string;
    tripsValue: string;
  };
}) {
  if (kind === "request") {
    return (
      <div className="flex h-full flex-col bg-[#eef2f6] px-3.5 pt-9 pb-4 font-sans text-[#0a1620]">
        <p className="text-[0.7rem] font-semibold text-[#5b6b76]">
          {copy.requestTitle}
        </p>
        <div className="mt-3 flex-1 rounded-[0.9rem] bg-[#d9e2ea]">
          <div
            className="h-full w-full opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(rgb(148 163 184 / 0.25) 1px, transparent 1px), linear-gradient(90deg, rgb(148 163 184 / 0.25) 1px, transparent 1px)",
              backgroundSize: "12px 12px",
            }}
          />
        </div>
        <div className="mt-3 rounded-[0.9rem] bg-white p-3 shadow-sm">
          <p className="text-[0.78rem] font-bold">{copy.route}</p>
          <p className="mt-1 text-[0.65rem] text-[#5b6b76]">{copy.fare}</p>
          <span className="mt-2.5 flex min-h-8 items-center justify-center rounded-[0.65rem] bg-[#0062fa] text-[0.68rem] font-semibold text-white">
            {copy.accept}
          </span>
        </div>
      </div>
    );
  }

  if (kind === "earnings") {
    return (
      <div className="flex h-full flex-col bg-[#eef2f6] px-3.5 pt-9 pb-4 font-sans text-[#0a1620]">
        <p className="text-[0.82rem] font-bold">{copy.earningsScreenTitle}</p>
        <div className="mt-4 rounded-[0.9rem] bg-white p-4 shadow-sm">
          <p className="text-[0.6rem] tracking-wide text-[#5b6b76] uppercase">
            {copy.weekLabel}
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight">
            {copy.earningsValue}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8eef4]">
            <div className="h-full w-[72%] rounded-full bg-[#0062fa]" />
          </div>
        </div>
        <div className="mt-3 rounded-[0.9rem] bg-white p-4 shadow-sm">
          <p className="text-[0.6rem] text-[#5b6b76]">{copy.tripsLabel}</p>
          <p className="mt-1 text-lg font-bold">{copy.tripsValue}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#eef2f6] px-3.5 pt-9 pb-4 font-sans text-[#0a1620]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.82rem] font-bold">{copy.dashboardTitle}</p>
        <span className="rounded-full bg-[#1f7a4c]/14 px-2 py-0.5 text-[0.58rem] font-semibold text-[#1f7a4c]">
          {copy.online}
        </span>
      </div>
      <div className="mt-3 rounded-[0.9rem] bg-white p-3 shadow-sm">
        <p className="text-[0.58rem] tracking-wide text-[#5b6b76] uppercase">
          {copy.earningsLabel}
        </p>
        <p className="mt-1 text-lg font-bold">{copy.earningsValue}</p>
      </div>
      <div className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-[0.9rem] bg-[#dde5ec]">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(rgb(148 163 184 / 0.2) 1px, transparent 1px), linear-gradient(90deg, rgb(148 163 184 / 0.2) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <span className="absolute top-[58%] left-[24%] h-2 w-2 rounded-full bg-[#0062fa] shadow-[0_0_0_3px_rgb(0_98_250_/_0.22)]" />
        <span className="absolute top-[28%] right-[26%] h-2 w-2 rounded-full bg-[#0a1620]" />
      </div>
    </div>
  );
}
