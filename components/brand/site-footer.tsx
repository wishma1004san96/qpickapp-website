"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLockup } from "@/components/brand/wordmark";
import { LanguageSwitcher } from "@/components/brand/language-switcher";
import { useTranslations } from "@/components/i18n/locale-provider";
import { AppStoreBadge } from "@/components/ui/app-store-badge";
import {
  footerCompany,
  footerLegal,
  footerServices,
  siteConfig,
  socialLinks,
  whatsappLink,
} from "@/lib/site";

const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;

/**
 * Mobile-first glass footer — no landscape background.
 */
export function SiteFooter() {
  const t = useTranslations();
  const reduceMotion = useReducedMotion();

  return (
    <footer className="relative w-full min-w-0 overflow-x-hidden bg-[linear-gradient(165deg,#061018_0%,#0a1620_45%,#0c1c2e_100%)] pb-[env(safe-area-inset-bottom)] text-foam">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_15%_20%,rgb(0_98_250_/_0.14),transparent_55%),radial-gradient(ellipse_55%_40%_at_90%_85%,rgb(1_147_251_/_0.1),transparent_50%)]"
      />

      <div className="relative mx-auto w-full min-w-0 max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-12 lg:px-10 lg:py-14 xl:px-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0 w-full rounded-[1.25rem] border border-foam/10 bg-foam/[0.05] p-4 shadow-[0_20px_48px_rgb(0_0_0_/_0.28),inset_0_1px_0_rgb(255_255_255_/_0.06)] backdrop-blur-xl sm:rounded-[1.5rem] sm:p-5 md:p-6 lg:rounded-[1.75rem] lg:p-7"
        >
          <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-6 md:gap-y-7 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-0 xl:gap-x-10">
            {/* Brand + contact + action buttons */}
            <div className="flex min-w-0 flex-col items-center text-center md:items-start md:text-left">
              <BrandLockup
                href="/"
                logoSize={36}
                wordmarkSize="sm"
                tone="foam"
              />

              <p className="mt-2.5 max-w-[34ch] text-sm leading-[1.5] tracking-[0.01em] text-pretty text-foam/75">
                {t("footer.blurb")}
              </p>

              <p className="mt-2.5 text-sm font-medium tracking-wide text-foam/95">
                {siteConfig.legalName}
              </p>

              {/* Contact — compact */}
              <div className="mt-3 w-full min-w-0 space-y-2 text-center md:text-left">
                <div className="flex justify-center gap-2 md:justify-start">
                  <span className="mt-0.5 shrink-0 text-[0.85rem] leading-none" aria-hidden="true">
                    📍
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.625rem] font-medium tracking-[0.12em] text-foam/50 uppercase">
                      {t("footer.contact.address")}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug break-words text-foam/80">
                      {siteConfig.addressLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-2 md:justify-start">
                  <span className="mt-0.5 shrink-0 text-[0.85rem] leading-none" aria-hidden="true">
                    ✉
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.625rem] font-medium tracking-[0.12em] text-foam/50 uppercase">
                      {t("footer.contact.email")}
                    </p>
                    <a
                      href={`mailto:${siteConfig.supportEmail}`}
                      className="mt-0.5 block text-sm break-all text-foam/85 transition-colors hover:text-foam focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                      {siteConfig.supportEmail}
                    </a>
                  </div>
                </div>

                <div className="flex justify-center gap-2 md:justify-start">
                  <span className="mt-0.5 shrink-0 text-[0.85rem] leading-none" aria-hidden="true">
                    ☎
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.625rem] font-medium tracking-[0.12em] text-foam/50 uppercase">
                      {t("footer.contact.phones")}
                    </p>
                    <ul className="mt-0.5 space-y-0.5">
                      {(
                        [
                          siteConfig.phones.general,
                          siteConfig.phones.office,
                          siteConfig.phones.mobile,
                        ] as const
                      ).map((phone) => (
                        <li key={phone}>
                          <a
                            href={tel(phone)}
                            className="block text-sm leading-snug text-foam/85 transition-colors hover:text-foam focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                          >
                            {phone}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-center gap-2 md:justify-start">
                  <span className="mt-0.5 shrink-0 text-[0.85rem] leading-none" aria-hidden="true">
                    💬
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.625rem] font-medium tracking-[0.12em] text-foam/50 uppercase">
                      {t("footer.contact.whatsapp")}
                    </p>
                    <a
                      href={whatsappLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 block text-sm text-[#9AF0B8] transition-colors hover:text-[#b8f5cc] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/45"
                    >
                      {siteConfig.phones.whatsapp}
                    </a>
                  </div>
                </div>
              </div>

              {/* CTAs: stacked mobile · horizontal row from md up */}
              <div className="mt-3.5 flex w-full min-w-0 flex-col gap-2 md:flex-row md:flex-wrap md:gap-2">
                <a
                  href={tel(siteConfig.phones.general)}
                  className="inline-flex min-h-12 w-full flex-1 items-center justify-center gap-1.5 rounded-full border border-foam/20 bg-foam/[0.08] px-3 text-sm font-medium text-foam transition-[background-color,border-color,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:-translate-y-0.5 hover:border-brand/40 hover:bg-foam/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 md:min-h-9 md:w-auto md:flex-none md:px-3.5 md:text-[0.8125rem]"
                >
                  <span aria-hidden="true">☎</span>
                  {t("footer.call")}
                </a>
                <a
                  href={whatsappLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 w-full flex-1 items-center justify-center gap-1.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/16 px-3 text-sm font-medium text-[#9AF0B8] transition-[background-color,border-color,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:-translate-y-0.5 hover:border-[#25D366]/55 hover:bg-[#25D366]/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/45 md:min-h-9 md:w-auto md:flex-none md:px-3.5 md:text-[0.8125rem]"
                >
                  <span aria-hidden="true">💬</span>
                  {t("footer.whatsapp")}
                </a>
                <a
                  href={`mailto:${siteConfig.supportEmail}`}
                  className="inline-flex min-h-12 w-full flex-1 items-center justify-center gap-1.5 rounded-full border border-foam/20 bg-foam/[0.08] px-3 text-sm font-medium text-foam transition-[background-color,border-color,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:-translate-y-0.5 hover:border-brand/40 hover:bg-foam/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 md:min-h-9 md:w-auto md:flex-none md:px-3.5 md:text-[0.8125rem]"
                >
                  <span aria-hidden="true">✉</span>
                  {t("footer.emailCta")}
                </a>
              </div>
            </div>

            {/* Services */}
            <FooterCol
              title={t("footer.services")}
              links={footerServices.map((item) => ({
                key: item.key,
                href: item.href,
                label: t(`footer.serviceLinks.${item.key}`),
              }))}
            />

            {/* Company */}
            <FooterCol
              title={t("footer.company")}
              links={footerCompany.map((item) => ({
                key: item.key,
                href: item.href,
                label: t(`footer.companyLinks.${item.key}`),
                external: item.href.startsWith("mailto:"),
              }))}
            />

            {/* Download + Social */}
            <div className="flex min-w-0 flex-col items-center text-center md:items-start md:text-left">
              <p className="mb-2.5 font-mono text-[0.625rem] font-medium tracking-[0.18em] text-foam/55 uppercase">
                {t("footer.downloadApp")}
              </p>
              <div className="flex w-full max-w-xs flex-col items-stretch gap-2 md:max-w-none md:items-start">
                <AppStoreBadge
                  store="android"
                  href={siteConfig.store.driverGooglePlay}
                  subtitle={t("downloadApps.store.driverPlay")}
                  className="!max-w-none !min-h-10 w-full border-foam/20 bg-foam/[0.08] hover:border-foam/35"
                />
                <AppStoreBadge
                  store="ios"
                  className="!max-w-none !min-h-10 w-full border-foam/20 bg-foam/[0.08]"
                />
              </div>

              <ul className="mt-3.5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {socialLinks.map((item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="group inline-flex size-9 items-center justify-center rounded-full border border-foam/20 bg-foam/[0.08] text-foam/80 transition-[color,background-color,border-color,box-shadow,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:-translate-y-0.5 hover:border-brand/45 hover:bg-brand/20 hover:text-foam hover:shadow-[0_0_18px_rgb(0_98_250_/_0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                      <SocialIcon name={item.key} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright — compact ~50–60px */}
          <div className="mt-5 flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-2 border-t border-foam/15 py-3 text-center lg:mt-5 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:text-left">
            <p className="max-w-full text-[0.6875rem] leading-none tracking-wide break-words text-foam/50">
              © {new Date().getFullYear()} {siteConfig.legalName}
            </p>

            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              {footerLegal.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-8 items-center text-[0.6875rem] tracking-wide text-foam/50 transition-[color,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:-translate-y-px hover:text-foam/85 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                  >
                    {t(`footer.legal.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>

            <LanguageSwitcher tone="onDark" compact />
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: readonly {
    key: string;
    href: string;
    label: string;
    external?: boolean;
  }[];
}) {
  return (
    <div className="min-w-0 text-center md:text-left">
      <p className="mb-2 font-mono text-[0.625rem] font-medium tracking-[0.18em] text-foam/55 uppercase">
        {title}
      </p>
      <ul className="space-y-0">
        {links.map((item) => (
          <li key={item.key}>
            {item.external ? (
              <a
                href={item.href}
                className="group inline-flex min-h-10 w-full items-center justify-center py-0.5 text-sm leading-snug text-foam/70 transition-[color,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:-translate-y-0.5 hover:text-foam focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 md:min-h-8 md:w-auto md:justify-start"
              >
                <span className="border-b border-transparent transition-[border-color] duration-[var(--duration-ui)] group-hover:border-brand/50">
                  {item.label}
                </span>
              </a>
            ) : (
              <Link
                href={item.href}
                className="group inline-flex min-h-10 w-full items-center justify-center py-0.5 text-sm leading-snug text-foam/70 transition-[color,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:-translate-y-0.5 hover:text-foam focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 md:min-h-8 md:w-auto md:justify-start"
              >
                <span className="border-b border-transparent transition-[border-color] duration-[var(--duration-ui)] group-hover:border-brand/50">
                  {item.label}
                </span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ name }: { name: (typeof socialLinks)[number]["key"] }) {
  const icons: Record<(typeof socialLinks)[number]["key"], ReactNode> = {
    facebook: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h2.6l.4-3H14V9c0-.6.4-1 1-1Z" />
      </svg>
    ),
    instagram: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
      </svg>
    ),
    tiktok: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.6 4.2c.7 1.5 2 2.6 3.6 3V9c-1.5-.1-2.9-.6-4-1.5v6.4c0 3.1-2.5 5.6-5.6 5.6S5 16.9 5 13.8s2.5-5.6 5.6-5.6c.3 0 .6 0 .9.1v2.8a2.9 2.9 0 0 0-.9-.1c-1.6 0-2.8 1.3-2.8 2.8s1.3 2.8 2.8 2.8 2.8-1.3 2.8-2.8V4.2h2.2Z" />
      </svg>
    ),
    linkedin: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.5 9.5H9v9H6.5v-9ZM7.8 5.2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11 9.5h2.4v1.2h.1c.3-.6 1.2-1.4 2.6-1.4 2.8 0 3.3 1.8 3.3 4.2v4.9H17v-4.4c0-1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3v4.5H11v-9Z" />
      </svg>
    ),
    youtube: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.6 8.2a2.7 2.7 0 0 0-1.9-1.9C18 5.9 12 5.9 12 5.9s-6 0-7.7.4A2.7 2.7 0 0 0 2.4 8.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 3.8 2.7 2.7 0 0 0 1.9 1.9c1.7.4 7.7.4 7.7.4s6 0 7.7-.4a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-3.8ZM10.2 14.8V9.2L15.2 12l-5 2.8Z" />
      </svg>
    ),
  };

  return icons[name];
}
