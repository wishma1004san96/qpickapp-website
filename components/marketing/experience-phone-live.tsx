"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useId, useLayoutEffect, useRef } from "react";
import { useTranslations } from "@/components/i18n/locale-provider";

const VB_W = 320;
const VB_H = 480;
const DEST_BIAS = 0.28;
const ARRIVAL_HOLD_MS = 1400;
const CORNER_RADIUS = 16;

export type LiveTripMode = "arriving" | "riding";

const TRIP_DURATION: Record<LiveTripMode, number> = {
  arriving: 7,
  riding: 12,
};

type Pt = { x: number; y: number };

/** Colombo Fort — shared pickup */
const PICKUP: Pt = { x: 140, y: 360 };
/** Galle Fort — ride destination */
const GALLE: Pt = { x: 250, y: 88 };

/**
 * Driver arriving: only the path from driver's location → pickup.
 * Ride in progress: pickup → Galle Fort (different geometry).
 */
const ROUTE_POINTS: Record<LiveTripMode, Pt[]> = {
  arriving: [
    { x: 52, y: 120 },
    { x: 52, y: 240 },
    { x: 140, y: 240 },
    PICKUP,
  ],
  riding: [
    PICKUP,
    { x: 140, y: 220 },
    { x: 240, y: 220 },
    { x: 240, y: 140 },
    GALLE,
  ],
};

/** Static preview (destination screen) — Colombo Fort → Galle Fort */
export const PREVIEW_ROUTE_POINTS: Pt[] = ROUTE_POINTS.riding;

function buildFilletedCenterline(points: Pt[], radius: number): string {
  if (points.length < 2) return "";

  const rMax = Math.min(
    radius,
    ...points.slice(0, -1).map((p, i) => {
      const next = points[i + 1];
      return Math.hypot(next.x - p.x, next.y - p.y) / 2 - 0.5;
    }),
  );
  const r = Math.max(4, rMax);

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const inLen = Math.hypot(curr.x - prev.x, curr.y - prev.y) || 1;
    const outLen = Math.hypot(next.x - curr.x, next.y - curr.y) || 1;
    const ix = (curr.x - prev.x) / inLen;
    const iy = (curr.y - prev.y) / inLen;
    const ox = (next.x - curr.x) / outLen;
    const oy = (next.y - curr.y) / outLen;

    const before = { x: curr.x - ix * r, y: curr.y - iy * r };
    const after = { x: curr.x + ox * r, y: curr.y + oy * r };

    d += ` L ${before.x} ${before.y}`;
    d += ` Q ${curr.x} ${curr.y} ${after.x} ${after.y}`;
  }

  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

const ROUTE_D: Record<LiveTripMode, string> = {
  arriving: buildFilletedCenterline(ROUTE_POINTS.arriving, CORNER_RADIUS),
  riding: buildFilletedCenterline(ROUTE_POINTS.riding, CORNER_RADIUS),
};

export const PREVIEW_ROUTE_D = buildFilletedCenterline(
  PREVIEW_ROUTE_POINTS,
  CORNER_RADIUS,
);

export { VB_W as MAP_VB_W, VB_H as MAP_VB_H };

function samplePath(
  path: SVGPathElement,
  progress01: number,
): { point: Pt; angle: number; distance: number; total: number } {
  const total = path.getTotalLength();
  const t = Math.max(0, Math.min(1, progress01));
  const distance = t * total;
  const point = path.getPointAtLength(distance);

  let angle = -90;
  if (t < 1 && total > 0) {
    const look = path.getPointAtLength(Math.min(total, distance + 1));
    angle =
      (Math.atan2(look.y - point.y, look.x - point.x) * 180) / Math.PI + 90;
  } else if (total > 0) {
    const before = path.getPointAtLength(Math.max(0, total - 1));
    const end = path.getPointAtLength(total);
    angle =
      (Math.atan2(end.y - before.y, end.x - before.x) * 180) / Math.PI + 90;
  }

  return {
    point: { x: point.x, y: point.y },
    angle,
    distance,
    total,
  };
}

/**
 * One-shot live nav segment — journey orchestrator advances on onComplete.
 */
export function ExperiencePhoneLive({
  mode = "riding",
  reduceMotion: reduceMotionProp,
  onComplete,
}: {
  mode?: LiveTripMode;
  reduceMotion: boolean;
  onComplete?: () => void;
}) {
  const t = useTranslations();
  const uid = useId().replace(/:/g, "");
  const prefersReduced = useReducedMotion();
  const reduceMotion = reduceMotionProp || Boolean(prefersReduced);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const pathRef = useRef<SVGPathElement>(null);
  const points = ROUTE_POINTS[mode];
  const routeD = ROUTE_D[mode];

  /** Normalized progress along active mode route — clamped 0..1 */
  const progress = useMotionValue(0);

  const pickupX = useMotionValue(points[0].x);
  const pickupY = useMotionValue(points[0].y);
  const destX = useMotionValue(points[points.length - 1].x);
  const destY = useMotionValue(points[points.length - 1].y);

  const carX = useMotionValue(points[0].x);
  const carY = useMotionValue(points[0].y);
  const carAngle = useMotionValue(-90);
  const zoom = useMotionValue(1);
  const fade = useMotionValue(0);

  const smoothAngle = useSpring(carAngle, {
    stiffness: 55,
    damping: 22,
    mass: 1.1,
  });

  const camX = useMotionValue(points[0].x);
  const camY = useMotionValue(points[0].y);
  const smoothCamX = useSpring(camX, {
    stiffness: 38,
    damping: 24,
    mass: 1.35,
  });
  const smoothCamY = useSpring(camY, {
    stiffness: 38,
    damping: 24,
    mass: 1.35,
  });
  const smoothZoom = useSpring(zoom, {
    stiffness: 70,
    damping: 24,
    mass: 0.85,
  });

  /** Blue route clip — identical progress as vehicle */
  const pathLength = progress;

  const worldX = useTransform(
    smoothCamX,
    (x) => `${50 - (x / VB_W) * 100}%`,
  );
  const worldY = useTransform(
    smoothCamY,
    (y) => `${50 - (y / VB_H) * 100}%`,
  );
  const origin = useTransform(
    [smoothCamX, smoothCamY],
    ([x, y]) =>
      `${((x as number) / VB_W) * 100}% ${((y as number) / VB_H) * 100}%`,
  );

  const mapOpacity = useTransform(fade, (v) => 1 - v);

  /** Sync everything from the single path + shared progress */
  const applyProgress = useCallback(
    (t01: number) => {
      const path = pathRef.current;
      if (!path) return;

      const { point, angle, total } = samplePath(path, t01);
      if (total <= 0) return;

      // Vehicle ALWAYS from path.getPointAtLength(progress)
      carX.set(point.x);
      carY.set(point.y);
      carAngle.set(angle);

      // Pins from path ends only (never independent coords)
      const start = path.getPointAtLength(0);
      const end = path.getPointAtLength(total);
      pickupX.set(start.x);
      pickupY.set(start.y);
      destX.set(end.x);
      destY.set(end.y);

      camX.set(point.x * (1 - DEST_BIAS) + end.x * DEST_BIAS);
      camY.set(point.y * (1 - DEST_BIAS) + end.y * DEST_BIAS);
    },
    [carX, carY, carAngle, pickupX, pickupY, destX, destY, camX, camY],
  );

  useMotionValueEvent(progress, "change", applyProgress);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    path.setAttribute("d", routeD);
    progress.set(0);
    applyProgress(0);

    const start = path.getPointAtLength(0);
    const end = path.getPointAtLength(path.getTotalLength());
    const cx = start.x * (1 - DEST_BIAS) + end.x * DEST_BIAS;
    const cy = start.y * (1 - DEST_BIAS) + end.y * DEST_BIAS;
    camX.jump(cx);
    camY.jump(cy);
    smoothCamX.jump(cx);
    smoothCamY.jump(cy);
  }, [routeD, applyProgress, progress, camX, camY, smoothCamX, smoothCamY]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    let cancelled = false;
    const controls: Array<{ stop: () => void }> = [];

    const run = async () => {
      path.setAttribute("d", routeD);
      progress.set(0);
      applyProgress(0);
      fade.set(0);
      zoom.set(1);

      if (reduceMotion) {
        progress.set(1);
        applyProgress(1);
        zoom.set(1.1);
        onCompleteRef.current?.();
        return;
      }

      const zoomIn = animate(zoom, 1.1, {
        duration: 1.1,
        ease: [0.22, 1, 0.36, 1],
      });
      controls.push(zoomIn);
      await zoomIn;
      if (cancelled) return;

      const trip = animate(progress, 1, {
        duration: TRIP_DURATION[mode],
        ease: [0.42, 0, 0.58, 1],
      });
      controls.push(trip);
      await trip;
      if (cancelled) return;

      progress.set(1);
      applyProgress(1);

      await new Promise<void>((resolve) => {
        const id = window.setTimeout(resolve, ARRIVAL_HOLD_MS);
        controls.push({ stop: () => window.clearTimeout(id) });
      });
      if (cancelled) return;

      onCompleteRef.current?.();
    };

    void run();

    return () => {
      cancelled = true;
      controls.forEach((c) => c.stop());
    };
  }, [mode, routeD, reduceMotion, progress, zoom, fade, applyProgress]);

  const startPt = points[0];
  const endPt = points[points.length - 1];

  return (
    <div className="experience-live">
      <div className="experience-live-map" aria-hidden="true">
        <motion.div
          className="experience-live-world"
          style={{
            x: worldX,
            y: worldY,
            scale: smoothZoom,
            transformOrigin: origin,
            opacity: mapOpacity,
          }}
        >
          <CityBasemap uid={uid} routeD={routeD} tone={mode} />

          <svg
            className="experience-live-nav"
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient
                id={`exp-route-${uid}`}
                x1={startPt.x}
                y1={startPt.y}
                x2={endPt.x}
                y2={endPt.y}
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1A73E8" />
                <stop offset="1" stopColor="#0062FA" />
              </linearGradient>
            </defs>

            {/* Measure path — single source of truth */}
            <path
              ref={pathRef}
              d={routeD}
              fill="none"
              stroke="transparent"
              strokeWidth={1}
            />

            {/* Ghost full route (riding only) */}
            {mode === "riding" ? (
              <path
                d={routeD}
                fill="none"
                stroke="rgb(10 132 255 / 0.22)"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5 7"
              />
            ) : null}

            {/* Blue trail — same path + same progress as vehicle */}
            <motion.path
              d={routeD}
              fill="none"
              stroke="rgb(255 255 255 / 0.95)"
              strokeWidth={3.6}
              strokeLinecap="butt"
              strokeLinejoin="round"
              style={{ pathLength }}
            />
            <motion.path
              d={routeD}
              fill="none"
              stroke={`url(#exp-route-${uid})`}
              strokeWidth={2.15}
              strokeLinecap="butt"
              strokeLinejoin="round"
              style={{ pathLength }}
            />

            {/* Pins + vehicle live in THIS SVG — same coords as the path */}
            {mode === "arriving" ? (
              <>
                {/* Driver origin — soft */}
                <motion.circle
                  className="experience-live-svg-pin experience-live-svg-pin--driver"
                  r={5}
                  style={{ cx: pickupX, cy: pickupY }}
                />
                {/* Pickup (Colombo Fort) */}
                <motion.circle
                  className="experience-live-svg-pin experience-live-svg-pin--pickup"
                  r={6.5}
                  style={{ cx: destX, cy: destY }}
                />
                <motion.circle
                  className="experience-live-svg-pin-pulse experience-live-svg-pin-pulse--pickup"
                  r={6.5}
                  style={{ cx: destX, cy: destY }}
                />
              </>
            ) : (
              <>
                <motion.circle
                  className="experience-live-svg-pin experience-live-svg-pin--pickup"
                  r={6.5}
                  style={{ cx: pickupX, cy: pickupY }}
                />
                <motion.circle
                  className="experience-live-svg-pin-pulse experience-live-svg-pin-pulse--pickup"
                  r={6.5}
                  style={{ cx: pickupX, cy: pickupY }}
                />
                <motion.circle
                  className="experience-live-svg-pin experience-live-svg-pin--drop"
                  r={6.5}
                  style={{ cx: destX, cy: destY }}
                />
                <motion.circle
                  className="experience-live-svg-pin-pulse experience-live-svg-pin-pulse--drop"
                  r={6.5}
                  style={{ cx: destX, cy: destY }}
                />
              </>
            )}

            <motion.g
              className="experience-live-svg-car"
              style={{ x: carX, y: carY, rotate: smoothAngle }}
            >
              {/* Soft shadow under car — not a solid dot */}
              <ellipse
                cx={0}
                cy={1}
                rx={7}
                ry={4}
                fill="rgb(0 0 0 / 0.18)"
              />
              {/* Top-down car icon */}
              <path
                className="experience-live-svg-car-body"
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
              />
              {/* Cabin / windshield */}
              <path
                className="experience-live-svg-car-window"
                d="M -3.4 -2.8 L -3.4 2.2 C -3.4 3.2 -2.6 4 -1.6 4 L 1.6 4 C 2.6 4 3.4 3.2 3.4 2.2 L 3.4 -2.8 C 3.4 -3.6 2.8 -4.2 2 -4.2 L -2 -4.2 C -2.8 -4.2 -3.4 -3.6 -3.4 -2.8 Z"
              />
              {/* Hood glass */}
              <rect
                className="experience-live-svg-car-hood"
                x={-3}
                y={-8.2}
                width={6}
                height={2.4}
                rx={0.8}
              />
              {/* Headlights */}
              <rect x={-5.2} y={-9.6} width={2} height={1.2} rx={0.4} fill="#FFE08A" />
              <rect x={3.2} y={-9.6} width={2} height={1.2} rx={0.4} fill="#FFE08A" />
              {/* Taillights */}
              <rect x={-5} y={8.6} width={2.2} height={1.1} rx={0.35} fill="#FF5A5A" />
              <rect x={2.8} y={8.6} width={2.2} height={1.1} rx={0.35} fill="#FF5A5A" />
            </motion.g>
          </svg>
        </motion.div>
      </div>

      <motion.div
        className="experience-live-status"
        initial={reduceMotion ? false : { y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        style={{ left: "50%", x: "-50%" }}
      >
        <span className="experience-live-status-dot" />
        <span className="experience-live-status-text">
          {mode === "arriving"
            ? t("phoneJourney.live.statusArriving")
            : t("phoneJourney.live.statusRiding")}
        </span>
      </motion.div>

      <div className="experience-live-sheet">
        <motion.div
          className="experience-live-card experience-live-card--tracking"
          initial={reduceMotion ? false : { y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <div className="experience-live-ride-row">
            <div className="experience-live-avatar" aria-hidden="true">
              <span className="experience-live-avatar-initial">K</span>
            </div>
            <div className="experience-live-ride-copy">
              <p className="experience-live-card-title">
                {t("phoneJourney.live.driverVehicle")}
              </p>
              <p className="experience-live-card-sub">
                {mode === "arriving"
                  ? t("phoneJourney.live.enRoute")
                  : t("phoneJourney.live.route")}
              </p>
            </div>
            <div className="experience-live-eta">
              <span>{mode === "arriving" ? "3" : "48"}</span>
              <small>{t("phoneJourney.live.minutesUnit")}</small>
            </div>
          </div>
          <div className="experience-live-card-footer">
            <span className="experience-live-plate">{t("phoneJourney.live.plate")}</span>
            <span className="experience-live-rating">{t("phoneJourney.live.rating")}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** Basemap — navigation corridor uses the same centerline path */
function CityBasemap({
  uid,
  routeD,
  tone = "riding",
}: {
  uid: string;
  routeD: string;
  tone?: LiveTripMode;
}) {
  return (
    <svg
      className="experience-live-basemap"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`land-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EDEAE3" />
          <stop offset="55%" stopColor="#E8E4DB" />
          <stop offset="100%" stopColor="#E2DED4" />
        </linearGradient>
        <linearGradient id={`park-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9DDB8" />
          <stop offset="100%" stopColor="#AFC897" />
        </linearGradient>
        <linearGradient id={`water-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B3D4E6" />
          <stop offset="100%" stopColor="#8EBFD8" />
        </linearGradient>
        <filter id={`soft-${uid}`} x="-12%" y="-12%" width="124%" height="124%">
          <feDropShadow
            dx="0"
            dy="1.1"
            stdDeviation="1.4"
            floodColor="#1c221c"
            floodOpacity="0.14"
          />
        </filter>
        <filter id={`road-shadow-${uid}`}>
          <feDropShadow
            dx="0"
            dy="0.7"
            stdDeviation="0.9"
            floodColor="#2a3228"
            floodOpacity="0.2"
          />
        </filter>
        <radialGradient id={`vig-${uid}`} cx="50%" cy="42%" r="72%">
          <stop offset="48%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(36,40,30,0.11)" />
        </radialGradient>
      </defs>

      <rect
        width={VB_W}
        height={VB_H}
        fill={tone === "arriving" ? "#E8EDF2" : `url(#land-${uid})`}
      />

      <path
        d="M -12 148 C 36 132 78 154 98 182 C 120 214 116 246 90 274 C 58 310 18 320 -12 312 Z"
        fill={`url(#water-${uid})`}
        opacity={tone === "arriving" ? 0.55 : 0.78}
        filter={`url(#soft-${uid})`}
      />
      <path
        d="M 248 436 C 286 420 318 438 340 458 L 340 500 L 236 500 C 232 472 236 448 248 436 Z"
        fill={`url(#water-${uid})`}
        opacity={tone === "arriving" ? 0.35 : 0.5}
      />

      <g filter={`url(#soft-${uid})`}>
        <path
          d="M 16 42 C 48 28 92 34 108 58 C 122 80 108 104 78 108 C 42 112 8 88 16 42 Z"
          fill={`url(#park-${uid})`}
        />
        <path
          d="M 204 248 C 236 236 282 252 286 292 C 290 330 252 348 220 340 C 186 332 178 272 204 248 Z"
          fill={`url(#park-${uid})`}
          opacity="0.92"
        />
        <path
          d="M 40 418 C 72 400 118 416 124 448 C 128 470 96 486 64 480 C 28 472 20 436 40 418 Z"
          fill={`url(#park-${uid})`}
          opacity="0.88"
        />
        <path
          d="M 190 36 C 222 24 258 42 262 72 C 266 100 240 118 210 110 C 178 102 170 56 190 36 Z"
          fill={`url(#park-${uid})`}
          opacity="0.82"
        />
      </g>

      <g filter={`url(#soft-${uid})`}>
        <g fill="#D5D0C6">
          <path d="M 24 40 H 70 V 78 H 24 Z" />
          <path d="M 168 40 H 214 V 90 H 168 Z" />
          <path d="M 260 40 H 304 V 100 H 260 Z" />
          <path d="M 24 130 H 78 V 190 H 24 Z" />
          <path d="M 168 130 H 210 V 190 H 168 Z" />
          <path d="M 268 130 H 304 V 190 H 268 Z" />
          <path d="M 24 250 H 90 V 310 H 24 Z" />
          <path d="M 168 250 H 210 V 320 H 168 Z" />
          <path d="M 268 250 H 304 V 340 H 268 Z" />
          <path d="M 24 330 H 90 V 370 H 24 Z" />
          <path d="M 168 340 H 210 V 370 H 168 Z" />
          <path d="M 268 360 H 304 V 420 H 268 Z" />
          <path d="M 176 430 H 220 V 460 H 176 Z" />
        </g>
        <g fill="#C8C3B8" opacity="0.8">
          <rect x="34" y="50" width="22" height="12" rx="2" />
          <rect x="178" y="52" width="22" height="14" rx="2" />
          <rect x="34" y="150" width="24" height="14" rx="2" />
          <rect x="178" y="268" width="20" height="18" rx="2" />
        </g>
      </g>

      <g
        fill="none"
        stroke="#F7F5F0"
        strokeWidth="4.2"
        strokeLinecap="round"
        opacity="0.95"
        filter={`url(#road-shadow-${uid})`}
      >
        <path d="M 16 96 H 304" />
        <path d="M 16 160 H 304" />
        <path d="M 16 280 H 304" />
        <path d="M 16 340 H 304" />
        <path d="M 100 16 V 464" />
        <path d="M 190 16 V 464" />
        <path d="M 280 16 V 464" />
      </g>

      <g
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#road-shadow-${uid})`}
      >
        <path d="M 16 400 H 304" />
        <path d="M 16 220 H 304" />
        <path d="M 140 16 V 464" />
        <path d="M 240 16 V 464" />
      </g>

      <path
        d={routeD}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#road-shadow-${uid})`}
      />

      <g
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#road-shadow-${uid})`}
      >
        <path d="M -6 160 C 70 148 140 172 330 156" />
        <path d="M 48 4 C 56 140 52 280 66 492" />
      </g>

      <g
        fill="none"
        stroke="#D4B45A"
        strokeWidth="1.2"
        strokeDasharray="6 8"
        strokeLinecap="round"
        opacity="0.45"
      >
        <path d="M -6 160 C 70 148 140 172 330 156" />
        <path d="M 48 4 C 56 140 52 280 66 492" />
      </g>

      <rect
        width={VB_W}
        height={VB_H}
        fill={`url(#vig-${uid})`}
        pointerEvents="none"
      />
    </svg>
  );
}
