import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { TourPackage } from "@/lib/tours/types";
import { formatTourPriceUsd } from "@/lib/tours/pricing-display";
import {
  getBookHref,
  getGalleryImage,
  getPackageHref,
} from "@/lib/tours/repository";

type PremiumTourCardProps = {
  package: TourPackage;
  className?: string;
};

function durationBadge(pkg: TourPackage): string {
  if (pkg.durationLabel) return pkg.durationLabel;
  if (pkg.durationDays === 1) return "1 day";
  return `${pkg.durationDays} days`;
}

export function PremiumTourCard({
  package: pkg,
  className = "",
}: PremiumTourCardProps) {
  const hero = getGalleryImage(pkg.heroGalleryId);
  const detailHref = getPackageHref(pkg.slug);
  const bookHref = getBookHref(pkg.slug);

  return (
    <article
      className={`group tour-detail-card tour-detail-card--lift flex h-full flex-col overflow-hidden backdrop-blur-xl ${className}`}
    >
      <Link
        href={detailHref}
        className="tour-detail-img-zoom relative block aspect-[16/10] shrink-0 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
      >
        {hero ? (
          <>
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-map-void/60 via-map-void/10 to-transparent opacity-85 transition-opacity duration-300 group-hover:opacity-95" />
          </>
        ) : (
          <div className="absolute inset-0 bg-mist" aria-hidden />
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-foam/15 bg-map-void/75 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-foam backdrop-blur-md">
            <Clock className="h-3 w-3" aria-hidden />
            {durationBadge(pkg)}
          </span>
          <span className="inline-flex items-center rounded-full border border-brand/25 bg-brand/90 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-paper backdrop-blur-md">
            Premium
          </span>
        </div>
      </Link>

      <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
        <h3 className="min-h-[2.75rem] font-display text-lg font-semibold tracking-tight text-ink sm:min-h-[3.25rem] sm:text-xl">
          <Link
            href={detailHref}
            className="line-clamp-2 hover:text-brand focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            {pkg.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-3 min-h-[4.25rem] text-sm leading-relaxed text-ink/55">
          {pkg.seo.intro}
        </p>

        <ul className="mt-3 flex max-h-[4.25rem] min-h-[4.25rem] flex-wrap content-start gap-1.5 overflow-hidden">
          {pkg.highlights.slice(0, 5).map((highlight) => (
            <li
              key={highlight}
              className="rounded-full border border-ink/8 bg-foam/80 px-2.5 py-1 text-[0.6875rem] text-ink/60 backdrop-blur-sm"
            >
              {highlight}
            </li>
          ))}
        </ul>

        <div className="mt-4 min-h-[2rem]">
          <p className="font-mono text-sm font-semibold text-brand-deep">
            {formatTourPriceUsd(pkg.startingPriceUsd)}
          </p>
        </div>

        <div className="mt-auto pt-5">
          <Link
            href={bookHref}
            className="tour-detail-btn tour-detail-btn--primary inline-flex min-h-11 w-full items-center justify-center px-3 text-sm"
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}
