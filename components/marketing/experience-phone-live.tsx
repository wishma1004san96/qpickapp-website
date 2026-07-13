"use client";

import { useEffect, useState } from "react";

type Phase = "book" | "route" | "confirm" | "track" | "arrive";

const PHASE_MS: Record<Phase, number> = {
  book: 1400,
  route: 1600,
  confirm: 1100,
  track: 2800,
  arrive: 1200,
};

const PHASE_ORDER: Phase[] = ["book", "route", "confirm", "track", "arrive"];

/**
 * In-phone product demo — map, route, booking card, driver motion.
 * Mount only while the live screen is visible so the loop starts clean.
 */
export function ExperiencePhoneLive({
  reduceMotion,
}: {
  active?: boolean;
  reduceMotion: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("book");
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    let cancelled = false;
    let timer = 0;
    let index = 0;

    const schedule = () => {
      if (cancelled) return;
      const current = PHASE_ORDER[index];
      timer = window.setTimeout(() => {
        if (cancelled) return;
        index = (index + 1) % PHASE_ORDER.length;
        if (index === 0) setCycle((c) => c + 1);
        setPhase(PHASE_ORDER[index]);
        schedule();
      }, PHASE_MS[current]);
    };

    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [reduceMotion]);

  const showRoute = reduceMotion || phase !== "book";
  const showConfirm =
    reduceMotion ||
    phase === "confirm" ||
    phase === "track" ||
    phase === "arrive";
  const tracking = reduceMotion || phase === "track" || phase === "arrive";
  const arrived = reduceMotion ? false : phase === "arrive";

  return (
    <div
      className="experience-live"
      data-phase={reduceMotion ? "track" : phase}
    >
      <div className="experience-live-map">
        <div className="experience-live-map-grid" />
        <div className="experience-live-map-wash" />

        <svg
          className="experience-live-route"
          viewBox="0 0 200 320"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={`experience-route-grad-${cycle}`}
              x1="42"
              y1="268"
              x2="156"
              y2="52"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0A84FF" />
              <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          <path
            className={[
              "experience-live-route-path",
              showRoute ? "is-drawn" : "",
              reduceMotion ? "is-static" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            d="M42 268 C58 230 70 210 88 178 C108 142 118 128 132 102 C142 84 148 70 156 52"
            fill="none"
            stroke={`url(#experience-route-grad-${cycle})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span className="experience-live-pin experience-live-pin--you" />
        <span
          className={[
            "experience-live-pin experience-live-pin--dest",
            showRoute ? "is-on" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />

        <span
          key={cycle}
          className={[
            "experience-live-driver",
            showConfirm ? "is-visible" : "",
            tracking ? "is-moving" : "",
            arrived ? "is-arrived" : "",
            reduceMotion ? "is-static" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className="experience-live-driver-dot" />
          <span className="experience-live-driver-pulse" />
        </span>
      </div>

      <div className="experience-live-status">
        <span className="experience-live-status-dot" />
        <span className="experience-live-status-text">
          {arrived
            ? "Driver arrived"
            : tracking
              ? "Driver en route · 4 min"
              : showConfirm
                ? "Ride confirmed"
                : "Galle Face · Colombo"}
        </span>
      </div>

      <div
        className={[
          "experience-live-sheet",
          showConfirm ? "is-confirmed" : "is-booking",
          tracking ? "is-tracking" : "",
          arrived ? "is-arrived" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {!showConfirm && (
          <div className="experience-live-card experience-live-card--book">
            <p className="experience-live-card-kicker">Private chauffeur</p>
            <p className="experience-live-card-title">Airport → City</p>
            <div className="experience-live-card-meta">
              <span>Comfort sedan</span>
              <span>LKR 4,800</span>
            </div>
            <div
              className={[
                "experience-live-cta",
                phase === "route" ? "is-armed" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              Confirm ride
            </div>
          </div>
        )}

        {showConfirm && (
          <div className="experience-live-card experience-live-card--ride">
            <div className="experience-live-ride-row">
              <div className="experience-live-avatar" />
              <div className="experience-live-ride-copy">
                <p className="experience-live-card-title">
                  {arrived ? "You’re here" : "Kasun · Toyota Premio"}
                </p>
                <p className="experience-live-card-sub">
                  {arrived
                    ? "Ride complete"
                    : tracking
                      ? "Tracking live"
                      : "Confirmed · arriving soon"}
                </p>
              </div>
              <div className="experience-live-eta">
                <span>{arrived ? "0" : tracking ? "4" : "6"}</span>
                <small>min</small>
              </div>
            </div>
            {phase === "confirm" && !reduceMotion && (
              <div className="experience-live-confirm-banner">Ride confirmed</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
