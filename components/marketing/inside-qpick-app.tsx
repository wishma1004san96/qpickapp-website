"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useMessages, useTranslations } from "@/components/i18n/locale-provider";
import {
  StoryLiveCycle,
  StoryPlanScreen,
  StoryVehiclesScreen,
} from "@/components/marketing/experience-story-screens";
import { Container } from "@/components/ui/container";
import "./inside-qpick-app.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_MS = 5500;

/** Real Sri Lanka destinations — crossfade + slow zoom. */
const CITY_SLIDES = [
  {
    id: "sigiriya",
    alt: "Sigiriya Rock Fortress, Sri Lanka",
    src: "https://images.unsplash.com/photo-1711797750174-c3750dd9d7c9?auto=format&fit=crop&w=2400&q=88",
  },
  {
    id: "kandy",
    alt: "Temple of the Tooth, Kandy, Sri Lanka",
    src: "https://images.unsplash.com/photo-1541410965313-d53b3c16ef17?auto=format&fit=crop&w=2400&q=88",
  },
  {
    id: "ella",
    alt: "Nine Arches Bridge and Ella hills, Sri Lanka",
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2400&q=88",
  },
  {
    id: "galle",
    alt: "Galle Fort coastline, Sri Lanka",
    src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=2400&q=88",
  },
  {
    id: "mirissa",
    alt: "Mirissa beach, south coast Sri Lanka",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=88",
  },
  {
    id: "colombo",
    alt: "Luxury Colombo hotel arrival, Sri Lanka",
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2400&q=88",
  },
  {
    id: "tea",
    alt: "Tea country hills, Nuwara Eliya Sri Lanka",
    src: "https://images.unsplash.com/photo-1501785888041-af3ee95c1045?auto=format&fit=crop&w=2400&q=88",
  },
  {
    id: "yala",
    alt: "Wildlife safari landscape, Yala Sri Lanka",
    src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2400&q=88",
  },
] as const;

const PANELS = [
  { id: "plan", Screen: StoryPlanScreen },
  { id: "vehicles", Screen: StoryVehiclesScreen },
  { id: "live", Screen: StoryLiveCycle },
] as const;

/**
 * Inside the Q Pick App — product UI showcase (Plan → Choose → Travel).
 * Separate from Experience Q Pick; do not merge the two sections.
 */
export function InsideQPickApp() {
  const t = useTranslations();
  const { insideQPickApp } = useMessages();
  const reduceMotion = useReducedMotion() ?? false;
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setSlide((n) => (n + 1) % CITY_SLIDES.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <section
      aria-labelledby="inside-qpick-app-heading"
      className="iqpa-stage"
    >
      <div className="iqpa-bg" aria-hidden="true">
        {CITY_SLIDES.map((city, index) => {
          const active = reduceMotion ? index === 0 : index === slide;
          return (
            <div
              key={city.id}
              className={[
                "iqpa-bg-slide",
                active ? "is-active" : "",
                reduceMotion ? "is-static" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Image
                src={city.src}
                alt=""
                fill
                sizes="100vw"
                className="iqpa-bg-image"
                priority={index === 0}
              />
            </div>
          );
        })}
        <div className="iqpa-bg-veil" />
      </div>

      <Container className="iqpa-inner">
        <header className="iqpa-header">
          <p className="iqpa-eyebrow">{insideQPickApp.eyebrow}</p>
          <h2 id="inside-qpick-app-heading" className="iqpa-heading">
            {insideQPickApp.heading}
          </h2>
          <p className="iqpa-sub">{insideQPickApp.sub}</p>
        </header>

        <ol className="iqpa-gallery">
          {PANELS.map((panel, index) => {
            const copy = insideQPickApp.panels[panel.id];
            const Screen = panel.Screen;
            return (
              <li key={panel.id} className="iqpa-panel">
                <motion.div
                  className="iqpa-panel-inner"
                  initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: 0.65,
                    delay: reduceMotion ? 0 : index * 0.08,
                    ease: EASE,
                  }}
                >
                  <div
                    className="iqpa-phone"
                    role="img"
                    aria-label={t("insideQPickApp.panelAria", {
                      label: copy.label,
                    })}
                  >
                    <div className="iqpa-phone-shell">
                      <div className="iqpa-phone-glass" aria-hidden="true" />
                      <div className="iqpa-phone-bezel">
                        <div className="iqpa-phone-display">
                          <div className="iqpa-island" aria-hidden="true">
                            <span className="iqpa-island-camera" />
                          </div>
                          <Screen reduceMotion={reduceMotion} />
                        </div>
                      </div>
                    </div>
                    <div className="iqpa-phone-reflection" aria-hidden="true" />
                  </div>

                  <div className="iqpa-caption">
                    <span className="iqpa-caption-n">{copy.n}</span>
                    <h3 className="iqpa-caption-title">{copy.label}</h3>
                    <p className="iqpa-caption-body">{copy.body}</p>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
