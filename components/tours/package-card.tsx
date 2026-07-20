import Image from "next/image";
import Link from "next/link";
import type { TourPackage } from "@/lib/tours/types";
import { formatTourPriceLkr } from "@/lib/tours/pricing-display";
import {
  getBookHref,
  getGalleryImage,
  getPackageHref,
  getTourPricingConfig,
} from "@/lib/tours/repository";

type PackageCardProps = {
  package: TourPackage;
  className?: string;
};

export function PackageCard({ package: pkg, className = "" }: PackageCardProps) {
  const hero = getGalleryImage(pkg.heroGalleryId);
  const detailHref = getPackageHref(pkg.slug);
  const bookHref = getBookHref(pkg.slug);
  const pricing = getTourPricingConfig();

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-[1.35rem] border border-ink/8 bg-white/80 shadow-[0_12px_36px_rgb(10_22_32_/_0.06)] backdrop-blur-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgb(10_22_32_/_0.12)] ${className}`}
    >
      <Link href={detailHref} className="relative block aspect-[16/10] overflow-hidden">
        {hero ? (
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-mist" aria-hidden />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-map-void/80 px-3 py-1 text-[0.6875rem] font-semibold tracking-wide text-foam backdrop-blur-md">
          {pkg.durationDays} days
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
          <Link href={detailHref} className="hover:text-brand">
            {pkg.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/55">
          {pkg.highlights[0]}
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {pkg.highlights.slice(0, 3).map((h) => (
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
        <div className="mt-auto flex gap-2 pt-4">
          <Link
            href={detailHref}
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-ink/12 px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand/30 hover:bg-brand/[0.04]"
          >
            View Details
          </Link>
          <Link
            href={bookHref}
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-3 py-2.5 text-sm font-semibold text-paper shadow-[0_10px_24px_rgb(0_98_250_/_0.28)] transition-[filter] hover:brightness-110"
          >
            Plan this tour
          </Link>
        </div>
      </div>
    </article>
  );
}
