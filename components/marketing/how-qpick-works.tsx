"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { brandAssets } from "@/lib/tokens";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import "./how-qpick-works.css";

const STEP_IDS = [
  "welcome",
  "register",
  "otp",
  "journey",
  "track",
] as const;

type StepId = (typeof STEP_IDS)[number];

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * How Q Pick Works — premium journey timeline with placeholder phone UIs.
 */
export function HowQPickWorks() {
  const t = useTranslations();
  const { howQPickWorks } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.75", "end 0.55"],
  });
  const lineRaw = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const lineProgress = useSpring(lineRaw, {
    stiffness: 70,
    damping: 28,
    mass: 0.35,
  });

  return (
    <section
      ref={sectionRef}
      className="hqw-stage"
      aria-labelledby="how-qpick-works-heading"
    >
      <Container>
        <motion.header
          className="hqw-header"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <p className="hqw-eyebrow">{t("howQPickWorks.eyebrow")}</p>
          <h2 id="how-qpick-works-heading" className="hqw-heading">
            {t("howQPickWorks.heading")}
          </h2>
          <p className="hqw-sub">{t("howQPickWorks.sub")}</p>
        </motion.header>

        <div className="hqw-timeline">
          <div className="hqw-rail" aria-hidden="true">
            <div className="hqw-rail-track" />
            <motion.div
              className="hqw-rail-progress"
              style={
                reduceMotion
                  ? { scaleX: 1 }
                  : { scaleX: lineProgress, transformOrigin: "left center" }
              }
            />
          </div>

          <ol className="hqw-steps">
            {STEP_IDS.map((id, index) => {
              const step = howQPickWorks.steps[id];
              const isActive = activeIndex === index;
              return (
                <motion.li
                  key={id}
                  className={`hqw-step${isActive ? " is-active" : ""}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  onViewportEnter={() => setActiveIndex(index)}
                  transition={{
                    duration: 0.55,
                    delay: reduceMotion ? 0 : index * 0.08,
                    ease: EASE,
                  }}
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                >
                  <div className="hqw-step-dot" aria-hidden="true">
                    <span>{step.n}</span>
                  </div>

                  <motion.div
                    className="hqw-phone-float"
                    animate={
                      reduceMotion
                        ? undefined
                        : isActive
                          ? { y: [0, -10, 0], scale: 1 }
                          : { y: [0, -5, 0], scale: 0.98 }
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : {
                            y: {
                              duration: 5.8 + index * 0.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: index * 0.18,
                            },
                            scale: { duration: 0.45, ease: EASE },
                          }
                    }
                  >
                    <div className="hqw-phone" aria-hidden="true">
                      <div className="hqw-phone-notch" />
                      <div className="hqw-phone-screen">
                        <StepScreen id={id} />
                      </div>
                    </div>
                  </motion.div>

                  <div className="hqw-copy">
                    <p className="hqw-step-label">
                      {t("howQPickWorks.stepLabel", { n: step.n })}
                    </p>
                    <h3 className="hqw-step-title">{step.title}</h3>
                    <p className="hqw-step-body">{step.body}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}

function StepScreen({ id }: { id: StepId }) {
  switch (id) {
    case "welcome":
      return <WelcomeScreen />;
    case "register":
      return <RegisterScreen />;
    case "otp":
      return <OtpScreen />;
    case "journey":
      return <JourneyScreen />;
    case "track":
      return <TrackScreen />;
  }
}

function WelcomeScreen() {
  return (
    <div className="hqw-ui hqw-ui-welcome">
      <Image
        src={brandAssets.logo}
        alt=""
        width={56}
        height={56}
        className="hqw-ui-logo"
      />
      <p className="hqw-ui-brand">Q Pick</p>
      <p className="hqw-ui-welcome-title">Welcome</p>
      <p className="hqw-ui-muted">Your journey across Sri Lanka starts here.</p>
      <span className="hqw-ui-btn">Get Started</span>
    </div>
  );
}

function RegisterScreen() {
  return (
    <div className="hqw-ui hqw-ui-form">
      <p className="hqw-ui-screen-title">Create account</p>
      <label className="hqw-ui-field">
        <span>Full Name</span>
        <span className="hqw-ui-input">Alex Perera</span>
      </label>
      <label className="hqw-ui-field">
        <span>Mobile Number</span>
        <span className="hqw-ui-input">+94 77 123 4567</span>
      </label>
      <span className="hqw-ui-btn">Continue</span>
    </div>
  );
}

function OtpScreen() {
  return (
    <div className="hqw-ui hqw-ui-form">
      <p className="hqw-ui-screen-title">Verify number</p>
      <p className="hqw-ui-muted">Enter the 6-digit code we sent you.</p>
      <div className="hqw-ui-otp" aria-hidden="true">
        {["4", "8", "1", "", "", ""].map((d, i) => (
          <span key={i} className={d ? "is-filled" : undefined}>
            {d}
          </span>
        ))}
      </div>
      <span className="hqw-ui-btn">Verify</span>
    </div>
  );
}

function JourneyScreen() {
  const tiles = [
    { label: "Ride", kind: "ride" },
    { label: "Airport", kind: "airport" },
    { label: "Tours", kind: "tours" },
    { label: "Favorites", kind: "favorites" },
  ] as const;

  return (
    <div className="hqw-ui hqw-ui-journey">
      <p className="hqw-ui-screen-title">Choose your journey</p>
      <div className="hqw-ui-search">Search destinations</div>
      <div className="hqw-ui-tiles">
        {tiles.map((tile) => (
          <div key={tile.label} className="hqw-ui-tile">
            <span className="hqw-ui-tile-icon" aria-hidden="true">
              <TileIcon kind={tile.kind} />
            </span>
            <span>{tile.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TileIcon({
  kind,
}: {
  kind: "ride" | "airport" | "tours" | "favorites";
}) {
  if (kind === "favorites") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.4 6.2 18.4l.9-5.4L3.2 9.2l5.4-.8L12 3.5z" />
      </svg>
    );
  }
  if (kind === "ride") {
    return (
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M4 15h16l-1.2-4.2A2 2 0 0 0 16.9 9H7.1a2 2 0 0 0-1.9 1.8L4 15z" />
        <circle cx="7.5" cy="16.5" r="1.5" />
        <circle cx="16.5" cy="16.5" r="1.5" />
      </svg>
    );
  }
  if (kind === "airport") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M4 19V6a2 2 0 0 1 2-2h7l5 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M13 4v5h5" />
    </svg>
  );
}

function TrackScreen() {
  return (
    <div className="hqw-ui hqw-ui-track">
      <div className="hqw-ui-map" aria-hidden="true">
        <span className="hqw-ui-route" />
        <span className="hqw-ui-pin hqw-ui-pin-a" />
        <span className="hqw-ui-pin hqw-ui-pin-b" />
      </div>
      <div className="hqw-ui-driver">
        <span className="hqw-ui-avatar" />
        <div>
          <p className="hqw-ui-driver-name">Nimal S.</p>
          <p className="hqw-ui-muted">Toyota Premio · ETA 4 min</p>
        </div>
      </div>
      <div className="hqw-ui-actions">
        <span className="hqw-ui-btn hqw-ui-btn-ghost">Call Driver</span>
        <span className="hqw-ui-btn">Chat</span>
      </div>
    </div>
  );
}
