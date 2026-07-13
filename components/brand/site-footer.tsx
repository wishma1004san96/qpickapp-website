import Link from "next/link";
import { BrandLockup } from "@/components/brand/wordmark";
import { Container } from "@/components/ui/container";
import { destinations } from "@/lib/destinations";
import {
  footerCompany,
  footerLegal,
  footerProducts,
  siteConfig,
} from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-mist bg-paper">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="grid gap-14 sm:gap-16 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))] lg:gap-x-20 lg:gap-y-16">
          <div className="max-w-md lg:pr-4">
            <div className="mb-7">
              <BrandLockup
                href="/"
                logoSize={48}
                wordmarkSize="md"
                tone="ink"
              />
            </div>
            <p className="max-w-[34ch] text-[0.9375rem] leading-[1.75] tracking-[0.01em] text-ink-muted">
              Premium movement across Sri Lanka — airport transfers, city rides,
              and island journeys under one trusted standard.
            </p>
            <p className="mt-8 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-soft uppercase">
              Emergency
              <span className="mx-2 text-mist" aria-hidden="true">
                ·
              </span>
              <a
                href={`tel:${siteConfig.emergencyLine.replace(/\s/g, "")}`}
                className="normal-case tracking-wide text-ink-muted transition-colors hover:text-ink"
              >
                {siteConfig.emergencyLine}
              </a>
            </p>
          </div>

          <FooterCol title="Move" links={footerProducts} />
          <FooterCol title="Company" links={footerCompany} />
          <div>
            <p className="mb-5 font-mono text-[0.6875rem] font-medium tracking-[0.18em] text-ink uppercase">
              Destinations
            </p>
            <ul className="space-y-3.5">
              {destinations.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/destinations/${d.slug}`}
                    className="text-sm leading-relaxed text-ink-muted transition-colors hover:text-ink"
                  >
                    {d.name}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/destinations"
                  className="text-sm font-medium text-brand transition-colors hover:text-brand-deep"
                >
                  View all
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-mist pt-9 sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs tracking-wide text-ink-soft">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-6">
            {footerLegal.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-xs tracking-wide text-ink-soft transition-colors hover:text-ink"
                >
                  {item.label}
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
      <p className="mb-5 font-mono text-[0.6875rem] font-medium tracking-[0.18em] text-ink uppercase">
        {title}
      </p>
      <ul className="space-y-3.5">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm leading-relaxed text-ink-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
