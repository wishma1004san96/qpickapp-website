"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Smartphone } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import "./banking-partner-section.css";

const EASE = [0.22, 1, 0.36, 1] as const;

export function BankingPartnerSection() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="bps-section"
      aria-labelledby="banking-partner-heading"
    >
      <div className="bps-bg" aria-hidden>
        <div className="bps-bg-base" />
        <div className="bps-bg-vignette" />
        <div className="bps-bg-glow-cyan" />
        <div className="bps-bg-glow-red-brand" />
        <div className="bps-bg-glow-red-panel" />
        <div className="bps-bg-horizon" />
        <svg
          className="bps-bg-trails"
          viewBox="0 0 1200 500"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="bps-line-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="bps-line-red" x1="0" y1="0" x2="1200" y2="0">
              <stop stopColor="#ff4d54" stopOpacity="0" />
              <stop offset="0.2" stopColor="#ff4d54" stopOpacity="0.55" />
              <stop offset="0.55" stopColor="#ff6b70" stopOpacity="0.85" />
              <stop offset="0.85" stopColor="#ff4d54" stopOpacity="0.5" />
              <stop offset="1" stopColor="#ff4d54" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="bps-line-cyan" x1="0" y1="0" x2="1200" y2="0">
              <stop stopColor="#66ccff" stopOpacity="0" />
              <stop offset="0.35" stopColor="#a8e4ff" stopOpacity="0.35" />
              <stop offset="0.7" stopColor="#66ccff" stopOpacity="0.2" />
              <stop offset="1" stopColor="#66ccff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M40 400 C200 300, 360 220, 520 250 S780 210, 960 270"
            stroke="url(#bps-line-red)"
            strokeWidth="1.75"
            filter="url(#bps-line-glow)"
          />
          <path
            d="M120 430 C320 370, 520 390, 720 340 S960 310, 1160 360"
            stroke="url(#bps-line-cyan)"
            strokeWidth="1.25"
            filter="url(#bps-line-glow)"
          />
          <path
            d="M200 460 C420 420, 640 440, 860 400 S1080 380, 1180 410"
            stroke="#ffffff"
            strokeWidth="0.75"
            opacity="0.12"
          />
          <circle cx="520" cy="250" r="3.5" fill="#ff6b70" filter="url(#bps-line-glow)" />
          <circle cx="360" cy="220" r="2.5" fill="#a8e4ff" opacity="0.8" />
        </svg>
      </div>

      <Container>
        <div className="bps-composition">
          <motion.div
            className="bps-story"
            initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="bps-eyebrow">
              <span className="bps-eyebrow-mark" aria-hidden />
              {t("bankingPartner.eyebrow")}
            </p>
            <h2 id="banking-partner-heading" className="bps-heading">
              <span className="bps-heading-line">
                {t("bankingPartner.headingLine1")}
              </span>
              <span className="bps-heading-line bps-heading-line--accent">
                {t("bankingPartner.headingLine2")}
              </span>
            </h2>
            <div className="bps-heading-divider" aria-hidden />
            <p className="bps-description">{t("bankingPartner.description")}</p>

            <div className="bps-lockup">
              <Image
                src="/images/banking/pan-asia-bank-logo.png"
                alt={t("bankingPartner.logoAlt")}
                width={340}
                height={340}
                className="bps-lockup-logo"
                sizes="(max-width: 899px) 120px, 170px"
              />
              <div className="bps-lockup-text">
                <p className="bps-bank-name">
                  {t("bankingPartner.bankName")}
                  <span className="bps-bank-name-rule" aria-hidden />
                </p>
                <p className="bps-bank-tagline">
                  {t("bankingPartner.bankTagline")}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bps-payment-wrap"
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.6,
              delay: reduceMotion ? 0 : 0.12,
              ease: EASE,
            }}
          >
            <motion.div
              className="bps-payment-panel"
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -4, transition: { duration: 0.3, ease: EASE } }
              }
            >
              <p className="bps-payment-title">
                {t("bankingPartner.paymentCardTitle")}
              </p>

              <div className="bps-qr-wrap">
                <img
                  src="/images/banking/pan-asia-bank-qr.png"
                  alt={t("bankingPartner.qrAlt")}
                  className="bps-qr"
                  width={320}
                  height={320}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <p className="bps-payment-label">
                <Smartphone
                  className="bps-payment-icon"
                  strokeWidth={1.75}
                  aria-hidden
                />
                {t("bankingPartner.paymentLabel")}
              </p>
              <p className="bps-payment-instruction">
                {t("bankingPartner.paymentInstruction")}
              </p>

              <div className="bps-partnership-footer">
                <Image
                  src="/images/trust/qpick-logo.png"
                  alt=""
                  width={32}
                  height={32}
                  className="bps-partnership-logo bps-partnership-logo--qpick"
                  aria-hidden
                />
                <span className="bps-partnership-divider" aria-hidden />
                <Image
                  src="/images/banking/pan-asia-bank-logo.png"
                  alt=""
                  width={32}
                  height={32}
                  className="bps-partnership-logo bps-partnership-logo--pab"
                  aria-hidden
                />
              </div>
              <p className="bps-partnership-label">
                {t("bankingPartner.partnershipLabel")}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
