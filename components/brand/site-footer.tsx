"use client";

import Link from "next/link";
import { BrandLockup } from "@/components/brand/wordmark";
import { useTranslations } from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import { destinations } from "@/lib/destinations";
import {
  footerCompany,
  footerLegal,
  footerProducts,
  siteConfig,
} from "@/lib/site";

const productKeys = {
  "/ride": "ride",
  "/airport": "airport",
  "/tours": "tours",
  "/destinations": "destinations",
  "/safety": "safety",
} as const;

const companyKeys = {
  "/about": "about",
  "/partners": "partners",
  "/drive": "drive",
  "/support": "support",
} as const;

const legalKeys = {
  "/legal/privacy": "privacy",
  "/legal/terms": "terms",
} as const;

export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer className="border-t border-mist bg-paper pb-[env(safe-area-inset-bottom)]">
      {/* Compact below 768px; md+ spacing matches previous sm/lg footer */}
      <Container className="py-5 md:py-12 lg:py-[var(--section-y-lg)]">
        <div className="grid gap-5 md:gap-12 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] lg:gap-x-20 lg:gap-y-16">
          <div className="max-w-md lg:pr-4">
            <div className="mb-3 md:mb-7">
              <BrandLockup
                href="/"
                logoSize={48}
                wordmarkSize="md"
                tone="ink"
              />
            </div>
            <p className="max-w-[34ch] text-[0.9375rem] leading-[1.65] tracking-[0.01em] text-pretty text-ink-muted">
              {t("footer.blurb")}
            </p>
            <p className="mt-3 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-soft uppercase md:mt-8">
              {t("footer.emergency")}
              <span className="mx-2 text-mist" aria-hidden="true">
                ·
              </span>
              <a
                href={`tel:${siteConfig.emergencyLine.replace(/\s/g, "")}`}
                className="normal-case tracking-wide text-ink-muted transition-colors hover:text-ink focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35"
              >
                {siteConfig.emergencyLine}
              </a>
            </p>
          </div>

          {/* Mobile: 2-col link grid. md+: unwrap into parent (desktop 4-col). */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-5 md:contents">
            <FooterCol
              title={t("footer.move")}
              links={footerProducts.map((item) => ({
                href: item.href,
                label: t(
                  `footer.products.${productKeys[item.href as keyof typeof productKeys]}`,
                ),
              }))}
            />
            <FooterCol
              title={t("footer.company")}
              links={footerCompany.map((item) => ({
                href: item.href,
                label: t(
                  `footer.companyLinks.${companyKeys[item.href as keyof typeof companyKeys]}`,
                ),
              }))}
            />
            <div>
              <p className="mb-3 font-mono text-[0.6875rem] font-medium tracking-[0.18em] text-ink uppercase md:mb-5">
                {t("footer.destinations")}
              </p>
              <ul className="space-y-2 md:space-y-3.5">
                {destinations.map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/destinations/${d.slug}`}
                      className="inline-flex min-h-8 items-center py-0.5 text-sm leading-relaxed text-ink-muted transition-colors hover:text-ink focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 md:min-h-11 md:py-0"
                    >
                      {t(`destinations.${d.slug}.name`)}
                    </Link>
                  </li>
                ))}
                <li className="pt-0.5">
                  <Link
                    href="/destinations"
                    className="inline-flex min-h-8 items-center py-0.5 text-sm font-medium text-brand transition-colors hover:text-brand-deep md:min-h-11 md:py-0"
                  >
                    {t("footer.viewAll")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-mist pt-4 md:mt-12 md:flex-row md:items-center md:justify-between md:gap-4 md:pt-9 lg:mt-20">
          <p className="text-xs tracking-wide text-ink-soft">
            © {new Date().getFullYear()} {siteConfig.name}. {t("footer.rights")}
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 md:gap-x-6 md:gap-y-3">
            {footerLegal.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-8 items-center py-0.5 text-xs tracking-wide text-ink-soft transition-colors hover:text-ink focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 md:min-h-11 md:py-0"
                >
                  {t(
                    `footer.legal.${legalKeys[item.href as keyof typeof legalKeys]}`,
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-3 font-mono text-[0.6875rem] font-medium tracking-[0.18em] text-ink uppercase md:mb-5">
        {title}
      </p>
      <ul className="space-y-2 md:space-y-3.5">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex min-h-8 items-center py-0.5 text-sm leading-relaxed text-ink-muted transition-colors hover:text-ink focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 md:min-h-11 md:py-0"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
