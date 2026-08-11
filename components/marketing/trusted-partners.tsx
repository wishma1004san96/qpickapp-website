"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import "./trusted-partners.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const PARTNER_LOGOS = [
  {
    id: "hnbLife",
    src: "/images/partners/hnb-life.png",
    width: 156,
    height: 52,
  },
  {
    id: "qpick",
    src: "/images/partners/qpick.png",
    width: 52,
    height: 52,
    rounded: true,
  },
  {
    id: "stripe",
    src: "/images/partners/stripe.png",
    width: 52,
    height: 52,
    rounded: true,
  },
  {
    id: "nvGlobal",
    src: "/images/partners/nv-global.png",
    width: 132,
    height: 52,
  },
  {
    id: "linkedCircles",
    src: "/images/partners/linked-circles.png",
    width: 52,
    height: 52,
  },
  {
    id: "panAsiaBank",
    src: "/images/partners/pan-asia-bank.png",
    width: 52,
    height: 52,
    rounded: true,
  },
  {
    id: "sltda",
    src: "/images/partners/sltda.png",
    width: 52,
    height: 52,
    rounded: true,
  },
  {
    id: "google",
    src: "/images/partners/google.png",
    width: 52,
    height: 52,
  },
  {
    id: "aws",
    src: "/images/partners/aws.png",
    width: 88,
    height: 52,
  },
] as const;

type PartnerLogo = (typeof PARTNER_LOGOS)[number];

function logoClassName(logo: PartnerLogo) {
  return `tps-logo${"rounded" in logo && logo.rounded ? " tps-logo--rounded" : ""}`;
}

export function TrustedPartnersSection() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;
  const marqueeItems = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <section
      className="tps-section"
      aria-labelledby="trusted-partners-heading"
    >
      <div className="tps-bg" aria-hidden />

      <div className="tps-inner">
        <Container>
          <motion.div
          className="tps-header"
          initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <p className="tps-eyebrow">
            <span className="tps-eyebrow-mark" aria-hidden />
            {t("trustedPartners.eyebrow")}
          </p>
          <h2 id="trusted-partners-heading" className="tps-heading">
            <span className="tps-heading-line">
              {t("trustedPartners.headingLine1")}
            </span>
            <span className="tps-heading-line">
              {t("trustedPartners.headingLine2")}
            </span>
          </h2>
          <p className="tps-description">{t("trustedPartners.description")}</p>
        </motion.div>

        <div
          className="tps-marquee"
          role="region"
          aria-label={t("trustedPartners.marqueeAriaLabel")}
        >
          <div className="tps-marquee-fade tps-marquee-fade--left" aria-hidden />
          <div className="tps-marquee-fade tps-marquee-fade--right" aria-hidden />

          <div className="tps-marquee-viewport">
            <ul className="tps-marquee-track">
              {marqueeItems.map((logo, index) => (
                <li
                  key={`${logo.id}-${index}`}
                  className="tps-logo-item"
                  aria-hidden={index >= PARTNER_LOGOS.length ? true : undefined}
                >
                  <div className="tps-logo-wrap">
                    <Image
                      src={logo.src}
                      alt={
                        index >= PARTNER_LOGOS.length
                          ? ""
                          : t(`trustedPartners.logos.${logo.id}`)
                      }
                      width={logo.width}
                      height={logo.height}
                      className={logoClassName(logo)}
                      sizes="(max-width: 640px) 120px, 180px"
                      draggable={false}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <ul className="tps-static-grid">
              {PARTNER_LOGOS.map((logo) => (
                <li key={logo.id} className="tps-logo-item">
                  <div className="tps-logo-wrap">
                    <Image
                      src={logo.src}
                      alt={t(`trustedPartners.logos.${logo.id}`)}
                      width={logo.width}
                      height={logo.height}
                      className={logoClassName(logo)}
                      sizes="(max-width: 640px) 120px, 180px"
                      draggable={false}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </Container>
      </div>
    </section>
  );
}
