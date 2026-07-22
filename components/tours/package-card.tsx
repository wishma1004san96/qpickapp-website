import Image from "next/image";
import Link from "next/link";
import { Car, Clock, MapPin, Star } from "lucide-react";
import type { TourPackage } from "@/lib/tours/types";
import { formatTourPriceLkr } from "@/lib/tours/pricing-display";
import {
  getBookHref,
  getDestinationsForPackage,
  getGalleryImage,
  getPackageHref,
  getTourPricingConfig,
  getVehicleById,
} from "@/lib/tours/repository";

type PackageCardProps = {
  package: TourPackage;
  className?: string;
  variant?: "default" | "related";
};

function routeSummary(pkg: TourPackage) {
  const destinations = getDestinationsForPackage(pkg.slug);
  if (destinations.length === 0) return null;
  const names = destinations.map((d) => d.name);
  if (names.length <= 3) return names.join(" → ");
  return `${names.slice(0, 2).join(" → ")} → … → ${names[names.length - 1]}`;
}

export function PackageCard({
  package: pkg,
  className = "",
  variant = "default",
}: PackageCardProps) {
  const hero = getGalleryImage(pkg.heroGalleryId);
  const detailHref = getPackageHref(pkg.slug);
  const bookHref = getBookHref(pkg.slug);
  const pricing = getTourPricingConfig();
  const vehicle = getVehicleById(pkg.vehicleId);
  const route = variant === "related" ? routeSummary(pkg) : null;
  const isRelated = variant === "related";

  return (
    <article
      className={`group tour-detail-card tour-detail-card--lift flex flex-col overflow-hidden ${className}`}
    >
      <Link
        href={detailHref}
        className="tour-detail-img-zoom relative block aspect-[16/10] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
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
            <div className="absolute inset-0 bg-gradient-to-t from-map-void/55 via-map-void/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />
          </>
        ) : (
          <div className="absolute inset-0 bg-mist" aria-hidden />
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-map-void/75 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-foam backdrop-blur-md">
            <Clock className="h-3 w-3" aria-hidden />
            {pkg.durationDays} days
          </span>
          {isRelated ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-map-void/75 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide text-foam backdrop-blur-md">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" aria-hidden />
              4.9
            </span>
          ) : null}
        </div>
        {isRelated && vehicle ? (
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full border border-foam/20 bg-foam/15 px-2.5 py-1 text-[0.6875rem] font-medium text-foam backdrop-blur-md">
            <Car className="h-3 w-3" aria-hidden />
            {vehicle.name}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
          <Link href={detailHref} className="hover:text-brand focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">
            {pkg.title}
          </Link>
        </h3>
        {isRelated && route ? (
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink/50">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand/70" aria-hidden />
            <span>{route}</span>
          </p>
        ) : (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/55">
            {pkg.highlights[0]}
          </p>
        )}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {pkg.highlights.slice(0, isRelated ? 2 : 3).map((h) => (
            <li
              key={h}
              className="rounded-full bg-foam px-2.5 py-1 text-[0.6875rem] text-ink/60"
            >
              {h}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-mono text-sm font-semibold text-brand-deep">
          {formatTourPriceLkr(pkg.startingPriceLkr)}
        </p>
        {pkg.startingPriceLkr == null ? (
          <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink/40">
            {pricing.quoteHint}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-2.5 pt-5 sm:gap-3">
          <Link
            href={detailHref}
            className="tour-detail-btn tour-detail-btn--ghost min-h-11 flex-1 px-3 text-sm"
          >
            View Details
          </Link>
          <Link
            href={bookHref}
            className="tour-detail-btn tour-detail-btn--primary min-h-11 flex-1 px-3 text-sm"
          >
            Plan this tour
          </Link>
        </div>
      </div>
    </article>
  );
}
