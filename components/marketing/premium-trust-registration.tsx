"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import "./premium-trust-registration.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const CARDS = [
  {
    id: "company" as const,
    logoSrc: "/images/trust/qpick-logo.png",
    logoWidth: 88,
    logoHeight: 88,
    logoClassName: "ptr-logo--qpick",
    logoAltKey: "qpickLogoAlt" as const,
    detailKeys: ["companyNo"] as const,
  },
  {
    id: "sltda" as const,
    logoSrc: "/images/trust/sltda-logo.png",
    logoWidth: 96,
    logoHeight: 96,
    logoClassName: "ptr-logo--sltda",
    logoAltKey: "sltdaLogoAlt" as const,
    detailKeys: ["registrationNo"] as const,
  },
] as const;

export function PremiumTrustRegistration() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className="ptr-section"
      aria-labelledby="premium-trust-heading"
    >
      <Container>
        <motion.div
          className="ptr-header"
          initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p className="ptr-eyebrow">{t("premiumTrustRegistration.eyebrow")}</p>
          <h2 id="premium-trust-heading" className="ptr-heading">
            {t("premiumTrustRegistration.heading")}
          </h2>
          <p className="ptr-sub">{t("premiumTrustRegistration.sub")}</p>
        </motion.div>

        <div className="ptr-grid">
          {CARDS.map((card, index) => (
            <motion.article
              key={card.id}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: reduceMotion ? 0 : index * 0.08,
                ease: EASE,
              }}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -6, transition: { duration: 0.32, ease: EASE } }
              }
              className="ptr-card group"
            >
              <span className="ptr-card-edge" aria-hidden />
              <div className={`ptr-logo-wrap ${card.logoClassName}`}>
                <Image
                  src={card.logoSrc}
                  alt={t(`premiumTrustRegistration.${card.logoAltKey}`)}
                  width={card.logoWidth}
                  height={card.logoHeight}
                  className="ptr-logo"
                  sizes="(max-width: 640px) 72px, 88px"
                />
              </div>
              <p className="ptr-card-label">
                {t(`premiumTrustRegistration.cards.${card.id}.label`)}
              </p>
              <h3 className="ptr-card-title">
                {t(`premiumTrustRegistration.cards.${card.id}.title`)}
              </h3>
              <p className="ptr-card-body">
                {t(`premiumTrustRegistration.cards.${card.id}.body`)}
              </p>
              <div className="ptr-card-meta">
                {card.detailKeys.map((detailKey) => (
                  <span key={detailKey} className="ptr-meta-badge">
                    {t(
                      `premiumTrustRegistration.cards.${card.id}.details.${detailKey}`,
                    )}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
