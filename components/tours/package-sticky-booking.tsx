"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Lock,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { formatTourPriceLkr } from "@/lib/tours/pricing-display";
import { usePackageDetailVehicle } from "@/components/tours/package-detail-vehicle-context";
import type { TourPackage, TourPricingConfig } from "@/lib/tours/types";
import { siteConfig, whatsappLink } from "@/lib/site";
import { VehicleCarouselCard } from "@/components/marketing/vehicle-carousel-card";

const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;

type PackageStickyBookingProps = {
  pkg: TourPackage;
  heroSrc?: string;
  heroAlt?: string;
  bookHref: string;
  pricing: TourPricingConfig;
  included: string[];
};

export function PackageStickyBooking({
  pkg,
  heroSrc,
  heroAlt,
  bookHref,
  pricing,
  included,
}: PackageStickyBookingProps) {
  const { selectedVehicle: vehicle } = usePackageDetailVehicle();
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="tour-detail-card overflow-hidden shadow-[0_28px_70px_rgb(10_22_32_/_0.14),inset_0_1px_0_rgb(255_255_255_/_0.8)] backdrop-blur-xl">
        {heroSrc ? (
          <div className="relative h-40">
            <Image
              src={heroSrc}
              alt={heroAlt ?? pkg.title}
              fill
              loading="lazy"
              className="object-cover"
              sizes="360px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/25 to-transparent" />
          </div>
        ) : null}

        <div className="space-y-5 p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[0.625rem] tracking-[0.16em] text-ink/40 uppercase">
                Private quote
              </p>
              <p className="mt-1.5 font-display text-[1.875rem] font-semibold leading-none text-brand-deep">
                {formatTourPriceLkr(pkg.startingPriceLkr)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-brand/15 bg-brand/8 px-2.5 py-1 text-[0.6875rem] font-semibold text-brand">
              <Star className="h-3 w-3 fill-brand text-brand" aria-hidden />
              4.9
            </span>
          </div>
          <p className="text-xs leading-relaxed text-ink/50">{pricing.quoteHint}</p>

          {vehicle ? (
            <VehicleCarouselCard
              id={vehicle.fleetIconId ?? vehicle.id}
              selected
              displayOnly
              name={vehicle.name}
              passengers={vehicle.passengers}
              luggage={vehicle.luggage}
              subtitle={`A/C${vehicle.wifi ? " · Wi‑Fi" : ""}`}
              showEta={false}
              showDayNightBadge={false}
              fluid
            />
          ) : null}

          <dl className="space-y-3 border-t border-ink/8 pt-5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink/45">Duration</dt>
              <dd className="font-semibold text-ink">{pkg.durationDays} days</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink/45">Stops</dt>
              <dd className="font-semibold text-ink">
                {pkg.destinationSlugs.length}
              </dd>
            </div>
          </dl>

          <div>
            <p className="text-[0.625rem] font-medium tracking-[0.14em] text-ink/40 uppercase">
              Included services
            </p>
            <ul className="mt-3 space-y-2">
              {included.slice(0, 4).map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-xs leading-relaxed text-ink/60"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-foam/80 px-2.5 py-1 text-[0.625rem] font-medium text-ink/55">
              <ShieldCheck className="h-3 w-3 text-brand" aria-hidden />
              Licensed operator
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-foam/80 px-2.5 py-1 text-[0.625rem] font-medium text-ink/55">
              <Lock className="h-3 w-3 text-brand" aria-hidden />
              Secure booking
            </span>
          </div>

          <div className="space-y-3 border-t border-ink/8 pt-5">
            <Link
              href={bookHref}
              className="tour-detail-btn tour-detail-btn--primary h-12 w-full"
            >
              Book This Tour
            </Link>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={whatsappLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="tour-detail-btn tour-detail-btn--ghost h-11 min-h-11 gap-1.5 border-[#25D366]/35 bg-[#25D366]/10 text-xs text-[#1a7a42] hover:border-[#25D366]/55 hover:bg-[#25D366]/16 sm:text-sm"
              >
                <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
                WhatsApp
              </a>
              <a
                href={tel(siteConfig.phones.general)}
                className="tour-detail-btn tour-detail-btn--ghost h-11 min-h-11 gap-1.5 text-xs sm:text-sm"
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
