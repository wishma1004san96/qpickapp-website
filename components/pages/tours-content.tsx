"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { PlanSriLankaTour } from "@/components/marketing/plan-sri-lanka-tour";
import { PrivateToursPreview } from "@/components/marketing/private-tours-preview";
import { DestinationStrip } from "@/components/marketing/destination-strip";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const EASE = [0.22, 1, 0.36, 1] as const;
const PACKAGE_IDS = ["coastal", "triangle", "highland"] as const;
const ITINERARY_IDS = ["south", "culture", "tea"] as const;
const VEHICLE_IDS = ["sedan", "suv", "van"] as const;
const WHY_IDS = ["chauffeur", "pacing", "estimate", "support"] as const;
const FAQ_IDS = ["customize", "payment", "hotels", "changes"] as const;

/**
 * Premium Tours destination page — planner lives here (moved from Home).
 */
export function ToursContent() {
  const t = useTranslations();
  const { pages } = useMessages();
  const tours = pages.tours;
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div className="bg-foam">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-foam/10 bg-map-void pt-28 pb-[var(--section-y-sm)] text-foam sm:pt-32 sm:pb-[var(--section-y-md)] lg:pb-[var(--section-y-lg)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_20%,rgb(0_98_250_/_0.2),transparent_55%)]"
          aria-hidden="true"
        />
        <Container className="relative z-[1]">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="max-w-3xl"
          >
            <p className="inline-flex rounded-full border border-foam/20 bg-foam/10 px-3.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.18em] text-brand-bright uppercase backdrop-blur-md">
              {t("pages.tours.eyebrow")}
            </p>
            <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.08] font-semibold tracking-tight text-balance">
              {t("pages.tours.title")}
            </h1>
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-pretty text-foam/65 sm:text-lg">
              {t("pages.tours.description")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#planner" size="lg">
                {t("pages.tours.primaryCta")}
              </ButtonLink>
              <ButtonLink
                href="#packages"
                size="lg"
                variant="secondary"
                className="border-foam/25 bg-foam/10 text-foam hover:border-foam/40 hover:bg-foam/16 hover:text-foam"
              >
                {t("pages.tours.secondaryCta")}
              </ButtonLink>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Interactive planner */}
      <PlanSriLankaTour id="planner" ctaHref="/support" />

      {/* Private tour value preview */}
      <PrivateToursPreview
        primaryHref="#planner"
        secondaryHref="#packages"
        cardHref="#planner"
      />

      {/* Popular packages */}
      <section
        id="packages"
        className="bg-foam py-[var(--section-y-sm)] sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]"
        aria-labelledby="tours-packages-heading"
      >
        <Container>
          <h2
            id="tours-packages-heading"
            className="font-display text-h2 tracking-tight text-balance text-ink"
          >
            {t("pages.tours.packages.heading")}
          </h2>
          <p className="mt-3 max-w-xl text-ink-muted text-pretty">
            {t("pages.tours.packages.sub")}
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PACKAGE_IDS.map((id, i) => {
              const pkg = tours.packages[id];
              return (
                <motion.article
                  key={id}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: reduceMotion ? 0 : i * 0.05,
                    ease: EASE,
                  }}
                  className="flex flex-col rounded-[1.2rem] border border-mist bg-paper p-6 shadow-[var(--shadow-ambient)] transition-[transform,box-shadow] duration-[var(--duration-ui)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[var(--shadow-lift)]"
                >
                  <p className="font-mono text-[0.65rem] tracking-[0.14em] text-brand uppercase">
                    {pkg.days}
                  </p>
                  <h3 className="mt-2 text-lg font-medium text-ink text-balance">
                    {pkg.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-pretty text-ink-muted">
                    {pkg.body}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-ink">{pkg.price}</p>
                </motion.article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Suggested itineraries */}
      <section
        className="border-y border-mist bg-paper py-[var(--section-y-sm)] sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]"
        aria-labelledby="tours-itineraries-heading"
      >
        <Container>
          <h2
            id="tours-itineraries-heading"
            className="font-display text-h2 tracking-tight text-balance text-ink"
          >
            {t("pages.tours.itineraries.heading")}
          </h2>
          <p className="mt-3 max-w-xl text-ink-muted text-pretty">
            {t("pages.tours.itineraries.sub")}
          </p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {ITINERARY_IDS.map((id) => {
              const item = tours.itineraries[id];
              return (
                <article
                  key={id}
                  className="rounded-[1.2rem] border border-mist bg-foam/50 p-6"
                >
                  <h3 className="text-lg font-medium text-ink">{item.title}</h3>
                  <ol className="mt-4 space-y-2.5">
                    {item.stops.map((stop, index) => (
                      <li
                        key={stop}
                        className="flex gap-3 text-sm text-ink-muted"
                      >
                        <span className="font-mono text-xs text-brand">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-pretty">{stop}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Vehicle comparison */}
      <section
        className="bg-foam py-[var(--section-y-sm)] sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]"
        aria-labelledby="tours-vehicles-heading"
      >
        <Container>
          <h2
            id="tours-vehicles-heading"
            className="font-display text-h2 tracking-tight text-balance text-ink"
          >
            {t("pages.tours.vehicles.heading")}
          </h2>
          <p className="mt-3 max-w-xl text-ink-muted text-pretty">
            {t("pages.tours.vehicles.sub")}
          </p>
          <div className="mt-10 overflow-x-auto rounded-[1.2rem] border border-mist bg-paper">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-mist bg-foam/80">
                <tr>
                  <th className="px-5 py-4 font-medium text-ink">
                    {t("pages.tours.vehicles.colVehicle")}
                  </th>
                  <th className="px-5 py-4 font-medium text-ink">
                    {t("pages.tours.vehicles.colGuests")}
                  </th>
                  <th className="px-5 py-4 font-medium text-ink">
                    {t("pages.tours.vehicles.colBest")}
                  </th>
                  <th className="px-5 py-4 font-medium text-ink">
                    {t("pages.tours.vehicles.colFrom")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {VEHICLE_IDS.map((id) => {
                  const row = tours.vehicles.rows[id];
                  return (
                    <tr key={id} className="border-b border-mist last:border-0">
                      <td className="px-5 py-4 font-medium text-ink">
                        {row.name}
                      </td>
                      <td className="px-5 py-4 text-ink-muted">{row.guests}</td>
                      <td className="px-5 py-4 text-ink-muted text-pretty">
                        {row.best}
                      </td>
                      <td className="px-5 py-4 tabular-nums text-ink">
                        {row.from}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Destinations */}
      <DestinationStrip />

      {/* Why travel with Q Pick */}
      <section
        className="border-y border-mist bg-map-void py-[var(--section-y-sm)] text-foam sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]"
        aria-labelledby="tours-trust-heading"
      >
        <Container>
          <h2
            id="tours-trust-heading"
            className="font-display text-h2 tracking-tight text-balance"
          >
            {t("pages.tours.trust.heading")}
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_IDS.map((id) => (
              <li
                key={id}
                className="rounded-[1.1rem] border border-foam/12 bg-foam/[0.06] p-5 backdrop-blur-md"
              >
                <p className="font-medium">{tours.trust.items[id].title}</p>
                <p className="mt-2 text-sm leading-relaxed text-pretty text-foam/60">
                  {tours.trust.items[id].body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* FAQ */}
      <section
        className="bg-paper py-[var(--section-y-sm)] sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]"
        aria-labelledby="tours-faq-heading"
      >
        <Container>
          <h2
            id="tours-faq-heading"
            className="font-display text-h2 tracking-tight text-balance text-ink"
          >
            {t("pages.tours.faq.heading")}
          </h2>
          <div className="mx-auto mt-8 max-w-3xl divide-y divide-mist border-y border-mist">
            {FAQ_IDS.map((id) => (
              <details key={id} className="group py-4">
                <summary className="cursor-pointer list-none text-base font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {tours.faq.items[id].q}
                    <span
                      aria-hidden="true"
                      className="text-ink-soft transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-pretty text-ink-muted">
                  {tours.faq.items[id].a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* Inquiry CTA */}
      <section className="relative overflow-hidden border-t border-mist bg-foam py-[var(--section-y-sm)] sm:py-[var(--section-y-md)] lg:py-[var(--section-y-lg)]">
        <Container className="relative z-[1] text-center">
          <h2 className="font-display text-h2 tracking-tight text-balance text-ink">
            {t("pages.tours.inquiry.heading")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-muted text-pretty">
            {t("pages.tours.inquiry.sub")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/support" size="lg">
              {t("pages.tours.inquiry.primary")}
            </ButtonLink>
            <ButtonLink href="#planner" size="lg" variant="secondary">
              {t("pages.tours.inquiry.secondary")}
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-ink-soft">
            <Link
              href="/destinations"
              className="underline-offset-4 hover:text-ink hover:underline"
            >
              {t("pages.tours.inquiry.destinations")}
            </Link>
          </p>
        </Container>
      </section>
    </div>
  );
}
