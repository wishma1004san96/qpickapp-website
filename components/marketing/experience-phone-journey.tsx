"use client";

import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BrandLogo } from "@/components/brand/wordmark";
import {
  DEFAULT_FLEET_PHOTO_SRC,
  vehiclePhotoSrc,
} from "@/components/icons/vehicles";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import {
  ExperiencePhoneLive,
  MAP_VB_H,
  MAP_VB_W,
  PREVIEW_ROUTE_D,
  PREVIEW_ROUTE_POINTS,
} from "@/components/marketing/experience-phone-live";
import "./experience-phone-journey.css";

export type JourneyStepId =
  | "splash"
  | "login"
  | "dashboard"
  | "account"
  | "pickup"
  | "destination"
  | "vehicles"
  | "booking"
  | "searching"
  | "accepted"
  | "arriving"
  | "pickedup"
  | "riding"
  | "completed"
  | "rate"
  | "submitted"
  | "home";

type StepDef = {
  id: JourneyStepId;
  hold?: number;
};

const STEPS: StepDef[] = [
  /** Duration controlled by splashGate overlay (black + logo). */
  { id: "splash" },
  { id: "login", hold: 2000 },
  { id: "dashboard", hold: 1800 },
  { id: "account", hold: 2000 },
  { id: "pickup", hold: 2600 },
  { id: "destination", hold: 3000 },
  { id: "vehicles", hold: 3200 },
  { id: "booking", hold: 2600 },
  { id: "searching" },
  { id: "accepted", hold: 2200 },
  { id: "arriving" },
  { id: "pickedup", hold: 2000 },
  { id: "riding" },
  { id: "completed", hold: 1800 },
  { id: "rate", hold: 3800 },
  { id: "submitted", hold: 1800 },
  { id: "home", hold: 2000 },
];

const SPLASH_HOLD_MS = 1900;

type VehicleId = "tuk" | "mini" | "sedan" | "suv" | "van";

const VEHICLE_IDS: VehicleId[] = ["tuk", "mini", "sedan", "suv", "van"];
const VEHICLE_META: Record<VehicleId, { seats: number; ac: boolean }> = {
  tuk: { seats: 3, ac: false },
  mini: { seats: 4, ac: true },
  sedan: { seats: 4, ac: true },
  suv: { seats: 6, ac: true },
  van: { seats: 10, ac: true },
};

const PICKUP_PIN = PREVIEW_ROUTE_POINTS[0];
const DEST_PIN = PREVIEW_ROUTE_POINTS[PREVIEW_ROUTE_POINTS.length - 1];

/** Real customer-app login screenshot (not the onboarding carousel). */
/** Status-bar icons removed from these assets for the marketing phone mock. */
const LOGIN_SHOT = "/images/app/login-clean.webp";

/**
 * Note: filenames are mismatched — account.webp is Home; home.webp is Account.
 * Do NOT use onboarding.webp (Book Your Ride intro carousel).
 */
const DASHBOARD_SHOT = "/images/app/account-clean.webp";
const ACCOUNT_SHOT = "/images/app/home-clean.webp";

const BLACK_FADE_MS = 250;
const TRANSITION_S = 0.26;
const easeOut = [0.22, 1, 0.36, 1] as const;

function resolveJourneyLock(raw: string | null): number | null {
  if (!raw) return null;
  const byId = STEPS.findIndex((s) => s.id === raw);
  if (byId >= 0) return byId;
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0 && n < STEPS.length) return n;
  return null;
}

/**
 * Full customer-app journey inside the phone.
 * Always boots black → Splash (logo). Advances only while `active`.
 */
export function ExperiencePhoneJourney({
  reduceMotion,
  onStepChange,
  active = true,
}: {
  reduceMotion: boolean;
  onStepChange?: (step: JourneyStepId, label: string) => void;
  /** False while the phone is off-screen — freezes the journey. */
  active?: boolean;
}) {
  const t = useTranslations();
  const [lockedIndex, setLockedIndex] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [blackFade, setBlackFade] = useState(true);
  const [bootReady, setBootReady] = useState(false);
  /** Force Splash visually for the opening beat even if timers race. */
  const [splashGate, setSplashGate] = useState(true);
  const isLocked = lockedIndex != null;
  const step = STEPS[index] ?? STEPS[0];
  const stepLabel = t(`phoneJourney.steps.${step.id}`);
  const canAdvance = isLocked ? false : active && bootReady && !splashGate;

  useEffect(() => {
    // Resolve lock inside this effect so the free-run boot never races
    // and overwrites a URL-locked step (e.g. ?journey=dashboard).
    const locked = resolveJourneyLock(
      new URLSearchParams(window.location.search).get("journey"),
    );
    setLockedIndex(locked);
    if (locked != null) {
      setIndex(locked);
      setBlackFade(false);
      setBootReady(true);
      setSplashGate(false);
      return;
    }

    // Always run the splash → login handoff. iOS "Reduce Motion" must NOT
    // leave the phone frozen on splash (hold is null on that step).
    const fadeMs = reduceMotion ? 0 : BLACK_FADE_MS;
    const splashMs = reduceMotion ? 700 : SPLASH_HOLD_MS;

    setIndex(0);
    setBlackFade(!reduceMotion);
    setBootReady(false);
    setSplashGate(true);

    const fadeId = window.setTimeout(() => {
      setBlackFade(false);
      setBootReady(true);
    }, fadeMs);

    const gateId = window.setTimeout(() => {
      setSplashGate(false);
      setIndex(1);
      console.log("Phone slideshow started");
    }, fadeMs + splashMs);

    return () => {
      window.clearTimeout(fadeId);
      window.clearTimeout(gateId);
    };
  }, [reduceMotion]);

  const beginBlackFade = useCallback(() => {
    const fadeMs = reduceMotion ? 0 : BLACK_FADE_MS;
    const splashMs = reduceMotion ? 700 : SPLASH_HOLD_MS;
    setIndex(0);
    setBlackFade(!reduceMotion);
    setBootReady(false);
    setSplashGate(true);
    window.setTimeout(() => {
      setBlackFade(false);
      setBootReady(true);
    }, fadeMs);
    window.setTimeout(() => {
      setSplashGate(false);
      setIndex(1);
    }, fadeMs + splashMs);
  }, [reduceMotion]);

  const advance = useCallback(() => {
    if (!canAdvance) return;
    setIndex((i) => {
      const next = (i + 1) % STEPS.length;
      if (next === 0) beginBlackFade();
      return next;
    });
  }, [canAdvance, beginBlackFade]);

  useEffect(() => {
    onStepChange?.(step.id, stepLabel);
  }, [step.id, stepLabel, onStepChange]);

  useEffect(() => {
    if (!active || isLocked) return;
    // Safety net: if splash gate somehow stalls (Safari timer quirks), force login.
    if (index !== 0 || !splashGate) return;
    const id = window.setTimeout(() => {
      setSplashGate(false);
      setBootReady(true);
      setBlackFade(false);
      setIndex(1);
      console.log("Phone slideshow started");
    }, 3200);
    return () => window.clearTimeout(id);
  }, [active, isLocked, index, splashGate]);

  useEffect(() => {
    if (!canAdvance) return;
    if (step.hold == null) return;
    const id = window.setTimeout(advance, step.hold);
    return () => window.clearTimeout(id);
  }, [step, advance, canAdvance]);

  useEffect(() => {
    if (step.id !== "rate") {
      setStars(0);
      return;
    }
    if (reduceMotion) {
      setStars(5);
      return;
    }
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setStars(n);
      if (n >= 5) window.clearInterval(id);
    }, 220);
    return () => window.clearInterval(id);
  }, [step.id, reduceMotion]);

  const liveAdvance = canAdvance ? advance : undefined;

  return (
    <div className="experience-journey">
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={step.id}
          className="experience-journey-screen"
          initial={
            reduceMotion
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 10, scale: 0.988 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            reduceMotion
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: -6, scale: 1.012 }
          }
          transition={{
            duration: TRANSITION_S,
            ease: easeOut,
          }}
          style={{ zIndex: 2 }}
          aria-hidden={false}
        >
          <JourneyStepView
            id={step.id}
            reduceMotion={reduceMotion}
            stars={stars}
            onLiveComplete={liveAdvance}
          />
        </motion.div>
      </AnimatePresence>
      <div
        className="experience-journey-boot-fade"
        aria-hidden="true"
        style={{
          opacity: blackFade ? 1 : 0,
          transition: reduceMotion ? "none" : `opacity ${BLACK_FADE_MS}ms ease`,
          pointerEvents: blackFade ? "auto" : "none",
        }}
      />
      {splashGate && !isLocked ? (
        <div className="experience-journey-splash-gate" aria-hidden="true">
          <SplashScreen reduceMotion={reduceMotion} />
        </div>
      ) : null}
    </div>
  );
}

function JourneyStepView({
  id,
  reduceMotion,
  stars,
  onLiveComplete,
  frozen = false,
}: {
  id: JourneyStepId;
  reduceMotion: boolean;
  stars: number;
  onLiveComplete?: () => void;
  frozen?: boolean;
}) {
  switch (id) {
    case "splash":
      return <SplashScreen key="splash" reduceMotion={reduceMotion} />;
    case "login":
      return (
        <ShotScreen
          src={LOGIN_SHOT}
          labelKey="login"
          failedFallback={<LoginFallback />}
        />
      );
    case "dashboard":
      return (
        <ShotScreen
          src={DASHBOARD_SHOT}
          labelKey="home"
          failedFallback={<DashboardScreen />}
        />
      );
    case "account":
      return <ShotScreen src={ACCOUNT_SHOT} labelKey="account" />;
    case "pickup":
      return <ConfirmPickupScreen reduceMotion={reduceMotion} />;
    case "destination":
      return <DestinationScreen reduceMotion={reduceMotion} />;
    case "vehicles":
      return <VehiclesScreen reduceMotion={reduceMotion} />;
    case "booking":
      return <BookingConfirmScreen reduceMotion={reduceMotion} />;
    case "searching":
      return (
        <SearchingScreen
          key="searching"
          reduceMotion={reduceMotion || frozen}
          onComplete={frozen ? undefined : onLiveComplete}
        />
      );
    case "accepted":
      return <AcceptedScreen />;
    case "arriving":
      return (
        <ExperiencePhoneLive
          key="arriving"
          mode="arriving"
          reduceMotion={reduceMotion}
          onComplete={frozen ? undefined : onLiveComplete}
          frozen={frozen}
          freezeAt={0.48}
        />
      );
    case "pickedup":
      return <PickedUpScreen reduceMotion={reduceMotion} />;
    case "riding":
      return (
        <ExperiencePhoneLive
          key="riding"
          mode="riding"
          reduceMotion={reduceMotion}
          onComplete={frozen ? undefined : onLiveComplete}
          frozen={frozen}
          freezeAt={0.42}
        />
      );
    case "completed":
      return <CompletedScreen />;
    case "rate":
      return <RateScreen stars={stars} />;
    case "submitted":
      return <SubmittedScreen />;
    case "home":
      return (
        <ShotScreen
          src={DASHBOARD_SHOT}
          labelKey="home"
          failedFallback={<DashboardScreen />}
        />
      );
    default:
      return null;
  }
}

/**
 * Frozen marketing keyframe from the shared Experience phone journey.
 * Used by How Q Pick Works — same screens/assets as Experience Q Pick.
 */
export function ExperienceJourneyFrame({
  step,
  reduceMotion = false,
}: {
  step: JourneyStepId;
  reduceMotion?: boolean;
}) {
  return (
    <div className="experience-journey experience-journey--frame">
      <div className="experience-journey-screen" style={{ zIndex: 2 }}>
        <JourneyStepView
          id={step}
          reduceMotion={reduceMotion}
          stars={5}
          frozen
        />
      </div>
    </div>
  );
}

function SplashScreen({ reduceMotion }: { reduceMotion: boolean }) {
  const t = useTranslations();
  return (
    <div className="experience-app experience-app--splash">
      <div className="experience-splash-glow" aria-hidden="true" />

      <motion.div
        className="experience-splash-logo-wrap"
        initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: easeOut }}
      >
        <motion.div
          className="experience-splash-logo-halo"
          aria-hidden="true"
          initial={{ opacity: 0.35, scale: 0.92 }}
          animate={
            reduceMotion
              ? { opacity: 0.55, scale: 1 }
              : {
                  opacity: [0.35, 0.7, 0.35],
                  scale: [0.92, 1.08, 0.92],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 2.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
        <BrandLogo size={76} />
      </motion.div>

      <motion.p
        className="experience-splash-tagline"
        initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOut, delay: 0.35 }}
      >
        {t("phoneJourney.splash.tagline")}
      </motion.p>

      <motion.div
        className="experience-splash-loader"
        aria-hidden="true"
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.55 }}
      >
        <motion.span
          className="experience-splash-loader-bar"
          initial={{ scaleX: reduceMotion ? 1 : 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 1.05,
            ease: easeOut,
            delay: reduceMotion ? 0 : 0.65,
          }}
          style={{ transformOrigin: "left center" }}
        />
      </motion.div>
    </div>
  );
}

/** Frozen splash shown while the phone is off-screen / waiting to start. */
export function ExperienceSplashIdle({
  reduceMotion,
}: {
  reduceMotion: boolean;
}) {
  return <SplashScreen reduceMotion={reduceMotion} />;
}

function LoginFallback() {
  const t = useTranslations();
  return (
    <div className="experience-app experience-app--pad">
      <BrandLogo size={48} />
      <h3 className="experience-app-h">{t("phoneJourney.login.welcome")}</h3>
      <p className="experience-app-muted">{t("phoneJourney.login.subtitle")}</p>
      <div className="experience-app-field">{t("phoneJourney.login.emailOrPhone")}</div>
      <div className="experience-app-field">{t("phoneJourney.login.password")}</div>
      <div className="experience-app-btn">{t("phoneJourney.login.continue")}</div>
    </div>
  );
}

function DashboardScreen() {
  const t = useTranslations();
  return (
    <div className="experience-app experience-app--pad experience-app--foam">
      <div className="experience-app-top">
        <div>
          <p className="experience-app-muted">{t("phoneJourney.dashboard.greeting")}</p>
          <h3 className="experience-app-h">{t("phoneJourney.dashboard.whereTo")}</h3>
        </div>
        <BrandLogo size={28} />
      </div>
      <div className="experience-app-search">{t("phoneJourney.dashboard.searchPlaceholder")}</div>
      <div className="experience-app-chip-row">
        <span className="experience-app-chip">{t("phoneJourney.dashboard.chips.airport")}</span>
        <span className="experience-app-chip">{t("phoneJourney.dashboard.chips.home")}</span>
        <span className="experience-app-chip">{t("phoneJourney.dashboard.chips.saved")}</span>
      </div>
    </div>
  );
}

function JourneyBasemap({
  uid,
  showRoute = false,
}: {
  uid: string;
  showRoute?: boolean;
}) {
  const start = PICKUP_PIN;
  const end = DEST_PIN;
  return (
    <svg
      className="experience-dest-map-svg"
      viewBox={`0 0 ${MAP_VB_W} ${MAP_VB_H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`jm-land-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EEF2F6" />
          <stop offset="100%" stopColor="#E4EAEF" />
        </linearGradient>
        <linearGradient
          id={`jm-route-${uid}`}
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0193FB" />
          <stop offset="1" stopColor="#0062FA" />
        </linearGradient>
      </defs>
      <rect width={MAP_VB_W} height={MAP_VB_H} fill={`url(#jm-land-${uid})`} />
      <path
        d="M -20 160 C 40 140 90 180 70 240 C 40 300 0 320 -20 300 Z"
        fill="#B8D4E8"
        opacity="0.7"
      />
      <path
        d="M 200 40 C 240 28 290 50 300 90 C 310 130 270 150 230 140 C 190 128 170 60 200 40 Z"
        fill="#C5DBC0"
        opacity="0.85"
      />
      <g fill="#D8DEE4" opacity="0.9">
        <rect x="24" y="60" width="48" height="36" rx="3" />
        <rect x="180" y="180" width="42" height="48" rx="3" />
        <rect x="80" y="300" width="56" height="40" rx="3" />
        <rect x="250" y="280" width="40" height="50" rx="3" />
      </g>
      <g
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.95"
      >
        <path d="M 16 220 H 304" />
        <path d="M 140 16 V 464" />
        <path d="M 240 16 V 464" />
      </g>
      {showRoute ? (
        <>
          <path
            d={PREVIEW_ROUTE_D}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={PREVIEW_ROUTE_D}
            fill="none"
            stroke={`url(#jm-route-${uid})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={start.x} cy={start.y} r="7" fill="#0062FA" />
          <circle cx={start.x} cy={start.y} r="3.2" fill="#FFFFFF" />
          <circle cx={end.x} cy={end.y} r="7" fill="#0A1620" />
          <circle cx={end.x} cy={end.y} r="3.2" fill="#FFFFFF" />
        </>
      ) : null}
    </svg>
  );
}

function ConfirmPickupScreen({ reduceMotion }: { reduceMotion: boolean }) {
  const t = useTranslations();
  const uid = useId().replace(/:/g, "");
  const p = PICKUP_PIN;

  return (
    <div className="experience-app experience-app--map">
      <div className="experience-dest-map" aria-hidden="true">
        <JourneyBasemap uid={uid} />
        <svg
          className="experience-dest-map-svg"
          viewBox={`0 0 ${MAP_VB_W} ${MAP_VB_H}`}
          preserveAspectRatio="xMidYMid slice"
        >
          <circle
            cx={p.x}
            cy={p.y}
            r="18"
            fill="rgb(0 98 250 / 0.14)"
            className="experience-pickup-pulse"
          />
          <circle cx={p.x} cy={p.y} r="8" fill="#0062FA" />
          <circle cx={p.x} cy={p.y} r="3.4" fill="#FFFFFF" />
        </svg>
        <div className="experience-dest-map-fade" />
      </div>

      <motion.div
        className="experience-dest-sheet"
        initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 32 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.48, ease: easeOut, delay: 0.1 }}
      >
        <p className="experience-app-kicker">{t("phoneJourney.pickup.kicker")}</p>
        <h3 className="experience-app-h">{t("phoneJourney.pickup.title")}</h3>
        <div className="experience-app-route-card experience-app-route-card--float">
          <div className="experience-app-route-row">
            <span className="experience-app-dot experience-app-dot--pickup" />
            <div>
              <p className="experience-app-label">{t("phoneJourney.pickup.label")}</p>
              <p className="experience-app-value">{t("phoneJourney.pickup.value")}</p>
            </div>
          </div>
        </div>
        <div className="experience-app-btn">{t("phoneJourney.pickup.confirm")}</div>
      </motion.div>
    </div>
  );
}

function DestinationScreen({ reduceMotion }: { reduceMotion: boolean }) {
  const t = useTranslations();
  const uid = useId().replace(/:/g, "");

  return (
    <div className="experience-app experience-app--map">
      <div className="experience-dest-map" aria-hidden="true">
        <JourneyBasemap uid={uid} showRoute />
        <div className="experience-dest-map-fade" />
      </div>

      <motion.div
        className="experience-dest-sheet"
        initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 36 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: easeOut, delay: 0.12 }}
      >
        <p className="experience-app-kicker">{t("phoneJourney.destination.kicker")}</p>
        <h3 className="experience-app-h">{t("phoneJourney.destination.title")}</h3>
        <div className="experience-app-route-card experience-app-route-card--float">
          <div className="experience-app-route-row">
            <span className="experience-app-dot experience-app-dot--pickup" />
            <div>
              <p className="experience-app-label">{t("phoneJourney.destination.pickupLabel")}</p>
              <p className="experience-app-value">{t("phoneJourney.destination.pickupValue")}</p>
            </div>
          </div>
          <div className="experience-app-route-line" />
          <div className="experience-app-route-row">
            <span className="experience-app-dot experience-app-dot--drop" />
            <div>
              <p className="experience-app-label">{t("phoneJourney.destination.destinationLabel")}</p>
              <p className="experience-app-value">{t("phoneJourney.destination.destinationValue")}</p>
            </div>
          </div>
        </div>
        <div className="experience-app-btn">{t("phoneJourney.destination.continue")}</div>
      </motion.div>
    </div>
  );
}

function VehiclesScreen({ reduceMotion }: { reduceMotion: boolean }) {
  const t = useTranslations();
  const { phoneJourney } = useMessages();
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setHighlight(true);
      return;
    }
    const id = window.setTimeout(() => setHighlight(true), 1100);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  const vehicles = VEHICLE_IDS.map((id) => ({
    id,
    category: phoneJourney.vehicles.categories[id],
    model: phoneJourney.vehicles.models[id],
    seats: VEHICLE_META[id].seats,
    ac: VEHICLE_META[id].ac,
    eta: phoneJourney.vehicles.etas[id],
    price: phoneJourney.vehicles.prices[id],
  }));

  return (
    <div className="experience-app experience-app--vehicles">
      <motion.div
        className="experience-vehicles-head"
        initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -8 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: easeOut }}
      >
        <p className="experience-app-kicker">{t("phoneJourney.vehicles.route")}</p>
        <h3 className="experience-app-h">{t("phoneJourney.vehicles.title")}</h3>
      </motion.div>

      <ul className="experience-app-vehicle-cards">
        {vehicles.map((v, i) => {
          const selected = highlight && v.id === "sedan";
          return (
            <motion.li
              key={v.id}
              className={[
                "experience-app-vcard",
                selected ? "is-selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 10 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.4,
                ease: easeOut,
                delay: reduceMotion ? 0 : 0.05 * i,
              }}
            >
              <div className="experience-app-vcard-media" aria-hidden="true">
                <VehiclePhoto kind={v.id} />
              </div>
              <div className="experience-app-vcard-body">
                <div className="experience-app-vcard-top">
                  <div>
                    <p className="experience-app-vcard-cat">{v.category}</p>
                    <p className="experience-app-vcard-model">{v.model}</p>
                  </div>
                  <p className="experience-app-vcard-price">{v.price}</p>
                </div>
                <div className="experience-app-vcard-meta">
                  <span>{t("phoneJourney.vehicles.seats", { count: v.seats })}</span>
                  {v.ac ? (
                    <span className="experience-app-ac">{t("phoneJourney.vehicles.ac")}</span>
                  ) : null}
                  <span className="experience-app-vcard-eta">
                    {t("phoneJourney.vehicles.eta", { time: v.eta })}
                  </span>
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

function BookingConfirmScreen({ reduceMotion }: { reduceMotion: boolean }) {
  const t = useTranslations();
  return (
    <div className="experience-app experience-app--pad experience-app--foam experience-app--booking">
      <motion.div
        initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 18 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        <p className="experience-app-kicker">{t("phoneJourney.booking.kicker")}</p>
        <h3 className="experience-app-h">{t("phoneJourney.booking.title")}</h3>

        <div className="experience-app-booking-hero">
          <div className="experience-app-vcard-media" aria-hidden="true">
            <VehiclePhoto kind="sedan" />
          </div>
          <div>
            <p className="experience-app-vcard-cat">{t("phoneJourney.vehicles.categories.sedan")}</p>
            <p className="experience-app-muted">{t("phoneJourney.booking.vehicleMeta")}</p>
          </div>
        </div>

        <div className="experience-app-booking-rows">
          <div className="experience-app-booking-row">
            <span>{t("phoneJourney.booking.route")}</span>
            <strong>{t("phoneJourney.booking.routeValue")}</strong>
          </div>
          <div className="experience-app-booking-row">
            <span>{t("phoneJourney.booking.fare")}</span>
            <strong className="experience-app-booking-fare">{t("phoneJourney.booking.fareValue")}</strong>
          </div>
          <div className="experience-app-booking-row">
            <span>{t("phoneJourney.booking.eta")}</span>
            <strong>{t("phoneJourney.booking.etaValue")}</strong>
          </div>
          <div className="experience-app-booking-row">
            <span>{t("phoneJourney.booking.payment")}</span>
            <strong>{t("phoneJourney.booking.paymentValue")}</strong>
          </div>
        </div>
      </motion.div>
      <div className="experience-app-btn">{t("phoneJourney.booking.bookRide")}</div>
    </div>
  );
}

/** Nearby road centerlines aligned to JourneyBasemap white corridors */
const SEARCH_ROADS = {
  /** Vertical corridor through Colombo Fort (basemap x=140) */
  colombo: "M 140 48 L 140 440",
  /** East vertical arterial (basemap x=240) */
  east: "M 240 48 L 240 440",
  /** Cross street (basemap y=220) */
  cross: "M 24 220 L 300 220",
  /**
   * Selected sedan approach: along cross street then down toward pickup,
   * ending just above the pin so both stay readable.
   */
  sedan: "M 48 220 L 140 220 L 140 318",
} as const;

type SearchVehicleKind = "tuk" | "mini" | "sedan" | "suv";

type SearchDriver = {
  id: string;
  kind: SearchVehicleKind;
  pathD: string;
  /** Seconds for one full traverse of the path */
  duration: number;
  /** Start progress 0..1 */
  start: number;
  /** Scale of top-view icon */
  scale?: number;
};

const SEARCH_DRIVERS: SearchDriver[] = [
  {
    id: "sedan",
    kind: "sedan",
    pathD: SEARCH_ROADS.sedan,
    duration: 3.8,
    start: 0.12,
    scale: 1.22,
  },
  {
    id: "tuk",
    kind: "tuk",
    pathD: SEARCH_ROADS.cross,
    duration: 5.2,
    start: 0.28,
    scale: 1.05,
  },
  {
    id: "mini",
    kind: "mini",
    pathD: SEARCH_ROADS.colombo,
    duration: 4.6,
    start: 0.62,
    scale: 1.12,
  },
  {
    id: "suv",
    kind: "suv",
    pathD: SEARCH_ROADS.east,
    duration: 5.8,
    start: 0.4,
    scale: 1.18,
  },
];
function sampleSearchPath(
  path: SVGPathElement,
  progress01: number,
): { x: number; y: number; angle: number } {
  const total = path.getTotalLength();
  const t = Math.max(0, Math.min(1, progress01));
  const dist = t * total;
  const point = path.getPointAtLength(dist);
  let angle = -90;
  if (total > 0) {
    const look = path.getPointAtLength(Math.min(total, dist + 1.5));
    const before = path.getPointAtLength(Math.max(0, dist - 0.5));
    angle =
      (Math.atan2(look.y - before.y, look.x - before.x) * 180) / Math.PI + 90;
  }
  return { x: point.x, y: point.y, angle };
}

function SearchingScreen({
  reduceMotion,
  onComplete,
}: {
  reduceMotion: boolean;
  onComplete?: () => void;
}) {
  const t = useTranslations();
  const uid = useId().replace(/:/g, "");
  const p = PICKUP_PIN;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [phase, setPhase] = useState<"searching" | "selected">("searching");

  useEffect(() => {
    if (reduceMotion) {
      setPhase("selected");
      const id = window.setTimeout(() => onCompleteRef.current?.(), 700);
      return () => window.clearTimeout(id);
    }

    // Keep vehicles cruising when locked for QA (`?journey=searching`)
    if (!onComplete) return;

    const selectId = window.setTimeout(() => setPhase("selected"), 2600);
    const doneId = window.setTimeout(() => onCompleteRef.current?.(), 3800);
    return () => {
      window.clearTimeout(selectId);
      window.clearTimeout(doneId);
    };
  }, [reduceMotion, onComplete]);

  return (
    <div className="experience-app experience-app--map">
      <div
        className="experience-dest-map experience-dest-map--full"
        aria-hidden="true"
      >
        <JourneyBasemap uid={uid} />
        <svg
          className="experience-dest-map-svg"
          viewBox={`0 0 ${MAP_VB_W} ${MAP_VB_H}`}
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Soft ripple around pickup */}
          <circle
            cx={p.x}
            cy={p.y}
            r="34"
            fill="none"
            stroke="rgb(0 98 250 / 0.28)"
            strokeWidth="2"
            className="experience-pickup-ripple"
          />
          <circle
            cx={p.x}
            cy={p.y}
            r="22"
            fill="none"
            stroke="rgb(1 147 251 / 0.22)"
            strokeWidth="1.5"
            className="experience-pickup-ripple"
            style={{ animationDelay: "0.7s" }}
          />
          {/* Pickup pin — distinct from vehicle markers */}
          <path
            d={`M ${p.x} ${p.y - 16}
                C ${p.x + 11} ${p.y - 16} ${p.x + 11} ${p.y - 2} ${p.x} ${p.y + 8}
                C ${p.x - 11} ${p.y - 2} ${p.x - 11} ${p.y - 16} ${p.x} ${p.y - 16} Z`}
            fill="#0062FA"
            stroke="#FFFFFF"
            strokeWidth="1.4"
          />
          <circle cx={p.x} cy={p.y - 8} r="3.4" fill="#FFFFFF" />

          {SEARCH_DRIVERS.map((driver) => (
            <SearchRoadVehicle
              key={driver.id}
              driver={driver}
              reduceMotion={reduceMotion}
              selected={phase === "selected" && driver.kind === "sedan"}
              fading={phase === "selected" && driver.kind !== "sedan"}
            />
          ))}
        </svg>
      </div>

      <motion.div
        className="experience-search-overlay"
        initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: easeOut }}
      >
        {phase === "searching" ? (
          <>
            <div
              className="experience-app-pulse experience-app-pulse--sm"
              aria-hidden="true"
            />
            <h3 className="experience-app-h">{t("phoneJourney.searching.title")}</h3>
            <p className="experience-app-muted">
              {t("phoneJourney.searching.matching")}
            </p>
          </>
        ) : (
          <>
            <p className="experience-app-kicker">{t("phoneJourney.searching.driverFound")}</p>
            <h3 className="experience-app-h">{t("phoneJourney.searching.sedanSelected")}</h3>
            <p className="experience-app-muted">{t("phoneJourney.searching.selectedMeta")}</p>
          </>
        )}
      </motion.div>
    </div>
  );
}

function SearchRoadVehicle({
  driver,
  reduceMotion,
  selected,
  fading,
}: {
  driver: SearchDriver;
  reduceMotion: boolean;
  selected: boolean;
  fading: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const progress = useMotionValue(driver.start);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const angle = useMotionValue(-90);

  const apply = useCallback(
    (t: number) => {
      const path = pathRef.current;
      if (!path) return;
      const sample = sampleSearchPath(path, t);
      x.set(sample.x);
      y.set(sample.y);
      angle.set(sample.angle);
    },
    [x, y, angle],
  );

  useMotionValueEvent(progress, "change", apply);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    path.setAttribute("d", driver.pathD);
    apply(driver.start);
  }, [driver.pathD, driver.start, apply]);

  useEffect(() => {
    if (reduceMotion || selected || fading) {
      apply(driver.kind === "sedan" ? 1 : driver.start);
      return;
    }

    let cancelled = false;
    const controls: Array<{ stop: () => void }> = [];
    let ping = true;

    const run = async () => {
      while (!cancelled) {
        const to = ping ? 1 : 0;
        const from = progress.get();
        const span = Math.abs(to - from) || 1;
        const ctrl = animate(progress, to, {
          duration: driver.duration * span,
          ease: "linear",
        });
        controls.push(ctrl);
        await ctrl;
        if (cancelled) return;
        ping = !ping;
      }
    };

    void run();
    return () => {
      cancelled = true;
      controls.forEach((c) => c.stop());
    };
  }, [
    reduceMotion,
    selected,
    fading,
    driver.duration,
    driver.kind,
    driver.start,
    progress,
    apply,
  ]);

  // When selected, ease sedan to path end (pickup)
  useEffect(() => {
    if (!selected || reduceMotion) return;
    const ctrl = animate(progress, 1, {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => ctrl.stop();
  }, [selected, reduceMotion, progress]);

  return (
    <g>
      <path
        ref={pathRef}
        d={driver.pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={1}
      />
      <motion.g
        className="experience-search-vehicle"
        style={{ x, y, rotate: angle }}
        initial={{ opacity: 1, scale: 1 }}
        animate={{
          opacity: fading ? 0 : 1,
          scale: fading ? 0.82 : selected ? 1.12 : 1,
        }}
        transition={{ duration: 0.55, ease: easeOut }}
      >
        {selected ? (
          <ellipse
            className="experience-search-vehicle-glow"
            cx={0}
            cy={2}
            rx={14}
            ry={9}
            fill="rgb(0 98 250 / 0.34)"
          />
        ) : null}
        <g transform={`scale(${driver.scale ?? 1.1})`}>
          <TopViewVehicle kind={driver.kind} highlighted={selected} />
        </g>
      </motion.g>
    </g>
  );
}

function TopViewVehicle({
  kind,
  highlighted,
}: {
  kind: SearchVehicleKind;
  highlighted?: boolean;
}) {
  const stroke = "#FFFFFF";
  const strokeW = 1.15;

  if (kind === "tuk") {
    return (
      <g className="experience-search-topview">
        <ellipse cx={0} cy={1.4} rx={5.2} ry={3.1} fill="rgb(0 0 0 / 0.16)" />
        <path
          d="M -4.2 -7.5 C -5 -7.5 -5.6 -6.8 -5.6 -5.9 L -5.6 5.2 C -5.6 6.4 -4.6 7.4 -3.4 7.4 L 3.4 7.4 C 4.6 7.4 5.6 6.4 5.6 5.2 L 5.6 -5.9 C 5.6 -6.8 5 -7.5 4.2 -7.5 Z"
          fill="#F4C430"
          stroke={stroke}
          strokeWidth={strokeW}
          paintOrder="stroke fill"
        />
        <path
          d="M -3.2 -3.5 L -3.2 1.8 L 3.2 1.8 L 3.2 -3.5 Z"
          fill="#0A84FF"
          opacity="0.8"
        />
        <rect x={-4.6} y={-7.1} width={1.6} height={1.1} rx={0.3} fill="#FFE08A" />
        <rect x={3} y={-7.1} width={1.6} height={1.1} rx={0.3} fill="#FFE08A" />
      </g>
    );
  }

  if (kind === "mini") {
    return (
      <g className="experience-search-topview">
        <ellipse cx={0} cy={1.2} rx={5.8} ry={3.3} fill="rgb(0 0 0 / 0.15)" />
        <path
          d="M -4 -9 C -5 -9 -5.6 -8.2 -5.6 -7.2 L -5.6 -2.4 C -6.2 -1.8 -6.4 -0.8 -6.4 0.1 C -6.4 1 -6.2 2 -5.6 2.6 L -5.6 6.2 C -5.6 7.6 -4.5 8.8 -3.1 8.8 L 3.1 8.8 C 4.5 8.8 5.6 7.6 5.6 6.2 L 5.6 2.6 C 6.2 2 6.4 1 6.4 0.1 C 6.4 -0.8 6.2 -1.8 5.6 -2.4 L 5.6 -7.2 C 5.6 -8.2 5 -9 4 -9 Z"
          fill="#EAF1F7"
          stroke="#0062FA"
          strokeWidth={strokeW}
          paintOrder="stroke fill"
        />
        <path
          d="M -2.8 -2.2 L -2.8 2 C -2.8 2.8 -2.1 3.4 -1.3 3.4 L 1.3 3.4 C 2.1 3.4 2.8 2.8 2.8 2 L 2.8 -2.2 C 2.8 -2.9 2.2 -3.4 1.5 -3.4 L -1.5 -3.4 C -2.2 -3.4 -2.8 -2.9 -2.8 -2.2 Z"
          fill="#0193FB"
          opacity="0.55"
        />
        <rect x={-4.8} y={-8.6} width={1.5} height={1} rx={0.3} fill="#FFE08A" />
        <rect x={3.3} y={-8.6} width={1.5} height={1} rx={0.3} fill="#FFE08A" />
        <rect x={-4.6} y={7.4} width={1.6} height={0.9} rx={0.25} fill="#FF5A5A" />
        <rect x={3} y={7.4} width={1.6} height={0.9} rx={0.25} fill="#FF5A5A" />
      </g>
    );
  }

  if (kind === "suv") {
    return (
      <g className="experience-search-topview">
        <ellipse cx={0} cy={1.4} rx={6.4} ry={3.6} fill="rgb(0 0 0 / 0.16)" />
        <path
          d="M -4.6 -10 C -5.8 -10 -6.6 -9 -6.6 -7.8 L -6.6 -2.6 C -7.3 -2 -7.6 -0.8 -7.6 0.2 C -7.6 1.2 -7.3 2.4 -6.6 3 L -6.6 7 C -6.6 8.8 -5.2 10.2 -3.4 10.2 L 3.4 10.2 C 5.2 10.2 6.6 8.8 6.6 7 L 6.6 3 C 7.3 2.4 7.6 1.2 7.6 0.2 C 7.6 -0.8 7.3 -2 6.6 -2.6 L 6.6 -7.8 C 6.6 -9 5.8 -10 4.6 -10 Z"
          fill="#3D4B56"
          stroke={stroke}
          strokeWidth={strokeW}
          paintOrder="stroke fill"
        />
        <path
          d="M -3.2 -2.6 L -3.2 2.4 C -3.2 3.3 -2.4 4 -1.5 4 L 1.5 4 C 2.4 4 3.2 3.3 3.2 2.4 L 3.2 -2.6 C 3.2 -3.4 2.5 -4 1.7 -4 L -1.7 -4 C -2.5 -4 -3.2 -3.4 -3.2 -2.6 Z"
          fill="#A8C8E8"
        />
        <rect x={-5.4} y={-9.4} width={1.8} height={1.1} rx={0.3} fill="#FFE08A" />
        <rect x={3.6} y={-9.4} width={1.8} height={1.1} rx={0.3} fill="#FFE08A" />
        <rect x={-5} y={8.6} width={1.8} height={1} rx={0.3} fill="#FF5A5A" />
        <rect x={3.2} y={8.6} width={1.8} height={1} rx={0.3} fill="#FF5A5A" />
      </g>
    );
  }

  // Sedan — matches live nav car language
  return (
    <g className="experience-search-topview">
      <ellipse cx={0} cy={1.2} rx={6.6} ry={3.7} fill="rgb(0 0 0 / 0.16)" />
      <path
        d="M -4.2 -10.5
           C -5.2 -10.5 -6 -9.6 -6 -8.5
           L -6 -3.2
           C -6.8 -2.6 -7.2 -1.4 -7.2 0
           C -7.2 1.4 -6.8 2.6 -6 3.2
           L -6 7.2
           C -6 9 -4.8 10.5 -3.2 10.5
           L 3.2 10.5
           C 4.8 10.5 6 9 6 7.2
           L 6 3.2
           C 6.8 2.6 7.2 1.4 7.2 0
           C 7.2 -1.4 6.8 -2.6 6 -3.2
           L 6 -8.5
           C 6 -9.6 5.2 -10.5 4.2 -10.5
           Z"
        fill={highlighted ? "#0062FA" : "#0A84FF"}
        stroke={stroke}
        strokeWidth={1.35}
        paintOrder="stroke fill"
      />
      <path
        d="M -3.4 -2.8 L -3.4 2.2 C -3.4 3.2 -2.6 4 -1.6 4 L 1.6 4 C 2.6 4 3.4 3.2 3.4 2.2 L 3.4 -2.8 C 3.4 -3.6 2.8 -4.2 2 -4.2 L -2 -4.2 C -2.8 -4.2 -3.4 -3.6 -3.4 -2.8 Z"
        fill="#E6F2FF"
      />
      <rect x={-3} y={-8.2} width={6} height={2.4} rx={0.8} fill="#C8E1FF" />
      <rect x={-5.2} y={-9.6} width={2} height={1.2} rx={0.4} fill="#FFE08A" />
      <rect x={3.2} y={-9.6} width={2} height={1.2} rx={0.4} fill="#FFE08A" />
      <rect x={-5} y={8.6} width={2.2} height={1.1} rx={0.35} fill="#FF5A5A" />
      <rect x={2.8} y={8.6} width={2.2} height={1.1} rx={0.35} fill="#FF5A5A" />
    </g>
  );
}

function AcceptedScreen() {
  const t = useTranslations();
  return (
    <div className="experience-app experience-app--pad experience-app--foam">
      <p className="experience-app-badge">{t("phoneJourney.accepted.badge")}</p>
      <div className="experience-app-driver">
        <div className="experience-app-avatar">K</div>
        <div>
          <h3 className="experience-app-h">{t("phoneJourney.accepted.driverName")}</h3>
          <p className="experience-app-muted">{t("phoneJourney.accepted.vehicle")}</p>
          <p className="experience-app-stars">{t("phoneJourney.accepted.rating")}</p>
        </div>
      </div>
      <div className="experience-app-meta-row">
        <span>{t("phoneJourney.accepted.plate")}</span>
        <span>{t("phoneJourney.accepted.eta")}</span>
      </div>
      <div className="experience-app-btn">{t("phoneJourney.accepted.track")}</div>
    </div>
  );
}

function PickedUpScreen({ reduceMotion }: { reduceMotion: boolean }) {
  const t = useTranslations();
  return (
    <div className="experience-app experience-app--center experience-app--foam">
      <motion.div
        className="experience-app-check experience-app-check--pickup"
        initial={{ opacity: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: easeOut }}
        aria-hidden="true"
      >
        ✓
      </motion.div>
      <motion.h3
        className="experience-app-h"
        initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 10 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: easeOut, delay: 0.12 }}
      >
        {t("phoneJourney.pickedUp.title")}
      </motion.h3>
      <motion.p
        className="experience-app-muted"
        initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 8 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: easeOut, delay: 0.2 }}
      >
        {t("phoneJourney.pickedUp.subtitle")}
      </motion.p>
    </div>
  );
}

function CompletedScreen() {
  const t = useTranslations();
  return (
    <div className="experience-app experience-app--center experience-app--foam">
      <div className="experience-app-check" aria-hidden="true">
        ✓
      </div>
      <h3 className="experience-app-h">{t("phoneJourney.completed.title")}</h3>
      <p className="experience-app-muted">{t("phoneJourney.completed.route")}</p>
      <p className="experience-app-kicker">{t("phoneJourney.completed.fare")}</p>
    </div>
  );
}

function RateScreen({ stars }: { stars: number }) {
  const t = useTranslations();
  return (
    <div className="experience-app experience-app--pad experience-app--foam">
      <p className="experience-live-rate-kicker">★★★★★</p>
      <h3 className="experience-live-rate-title">{t("phoneJourney.rate.title")}</h3>
      <div className="experience-live-rate-driver">
        <div className="experience-live-avatar" aria-hidden="true">
          <span className="experience-live-avatar-initial">K</span>
        </div>
        <div className="experience-live-ride-copy">
          <p className="experience-live-card-title">{t("phoneJourney.rate.driverName")}</p>
          <p className="experience-live-card-sub">{t("phoneJourney.rate.vehicle")}</p>
        </div>
      </div>
      <p className="experience-live-rate-prompt">{t("phoneJourney.rate.prompt")}</p>
      <div className="experience-live-rate-stars" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={[
              "experience-live-rate-star",
              n <= stars ? "is-on" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            ★
          </span>
        ))}
      </div>
      <div className="experience-live-rate-input">{t("phoneJourney.rate.reviewPlaceholder")}</div>
      <div className="experience-live-rate-submit">{t("phoneJourney.rate.submit")}</div>
    </div>
  );
}

function SubmittedScreen() {
  const t = useTranslations();
  return (
    <div className="experience-app experience-app--center experience-app--foam">
      <div className="experience-app-check" aria-hidden="true">
        ✓
      </div>
      <h3 className="experience-app-h">{t("phoneJourney.submitted.title")}</h3>
      <p className="experience-app-muted">{t("phoneJourney.submitted.subtitle")}</p>
      <div className="experience-app-btn experience-app-btn--ghost">{t("phoneJourney.submitted.backHome")}</div>
    </div>
  );
}

function VehiclePhoto({ kind }: { kind: string }) {
  const src = vehiclePhotoSrc(kind) ?? DEFAULT_FLEET_PHOTO_SRC;

  return (
    <Image
      src={src}
      alt=""
      width={56}
      height={34}
      unoptimized
      className="experience-app-vphoto"
      aria-hidden
    />
  );
}

function ShotScreen({
  src,
  labelKey,
  failedFallback,
  priority = false,
}: {
  src: string;
  labelKey: "login" | "home" | "account";
  failedFallback?: ReactNode;
  priority?: boolean;
}) {
  const t = useTranslations();
  const [failed, setFailed] = useState(false);
  const label = t(`phoneJourney.shotLabels.${labelKey}`);
  if (failed) return <>{failedFallback ?? null}</>;
  return (
    <div className="experience-journey-shot">
      <Image
        src={src}
        alt={t("phoneJourney.shotAlt", { label })}
        fill
        sizes="(min-width: 1024px) 315px, 250px"
        className="experience-phone-shot object-cover object-top"
        unoptimized
        priority={priority}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
