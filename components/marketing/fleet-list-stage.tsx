"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/components/i18n/locale-provider";
import "./fleet-list-stage.css";

/**
 * Brand-colour stage below Experience — Q Pick fleet list inside a
 * pre-rendered 3D phone mockup (Bolt-style product presentation).
 */
export function FleetListStage() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;
  const [enableParallax, setEnableParallax] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const sync = () => setEnableParallax(mq.matches && !reduceMotion);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [reduceMotion]);

  return (
    <section className="fleet-stage" aria-labelledby="fleet-stage-heading">
      <div className="fleet-stage-inner">
        <motion.p
          className="fleet-stage-eyebrow"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {t("fleetList.eyebrow")}
        </motion.p>

        <motion.h2
          id="fleet-stage-heading"
          className="fleet-stage-heading"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: 0.5,
            delay: reduceMotion ? 0 : 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {t("fleetList.heading")}
        </motion.h2>

        <motion.p
          className="fleet-stage-sub"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.5,
            delay: reduceMotion ? 0 : 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {t("fleetList.sub")}
        </motion.p>

        <div className="fleet-stage-phone-plane">
          {enableParallax ? (
            <FleetPhoneParallax reduceMotion={reduceMotion} />
          ) : (
            <FleetPhoneStatic reduceMotion={reduceMotion} />
          )}
        </div>
      </div>
    </section>
  );
}

function FleetPhoneStatic({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="fleet-stage-phone-parallax">
      <motion.div
        className="fleet-stage-phone-float"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <FleetPhoneImage />
      </motion.div>
    </div>
  );
}

function FleetPhoneParallax({ reduceMotion }: { reduceMotion: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start end", "end start"],
  });
  const parallaxRaw = useTransform(scrollYProgress, [0, 1], [14, -14]);
  const parallaxY = useSpring(parallaxRaw, {
    stiffness: 60,
    damping: 28,
    mass: 0.4,
  });

  return (
    <motion.div
      ref={stageRef}
      className="fleet-stage-phone-parallax"
      style={{ y: parallaxY }}
    >
      <motion.div
        className="fleet-stage-phone-float"
        style={reduceMotion ? undefined : { transformPerspective: 1400 }}
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -12, 0],
                rotateX: [0, 2, 0],
                rotateY: [-2, 2, -2],
              }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      >
        <FleetPhoneImage />
      </motion.div>
    </motion.div>
  );
}

function FleetPhoneImage() {
  return (
    <div className="fleet-stage-device-wrap">
      <div className="fleet-stage-device">
        <Image
          src="/images/fleet/qpick-fleet-phone-v3.webp"
          alt="Q Pick Fleet Phone"
          width={1492}
          height={1054}
          sizes="(max-width: 768px) 90vw, (max-width: 1280px) 70vw, 900px"
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  );
}
