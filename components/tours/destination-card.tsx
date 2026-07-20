import Image from "next/image";
import Link from "next/link";
import type { TourDestination } from "@/lib/tours/types";

type DestinationCardProps = {
  destination: TourDestination;
  href?: string;
  className?: string;
  compact?: boolean;
};

export function DestinationCard({
  destination,
  href,
  className = "",
  compact = false,
}: DestinationCardProps) {
  const body = (
    <>
      <div className={`relative overflow-hidden ${compact ? "aspect-[4/3]" : "aspect-[16/10]"}`}>
        <Image
          src={destination.imageSrc}
          alt={destination.imageAlt}
          fill
          loading="lazy"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-map-void/70 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[0.625rem] font-medium tracking-wide text-brand-bright uppercase">
            {destination.region}
          </p>
          <h3 className="mt-0.5 font-display text-lg font-semibold text-foam">
            {destination.name}
          </h3>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <p
          className={`text-sm leading-relaxed text-ink/60 ${compact ? "line-clamp-2" : "line-clamp-3"}`}
        >
          {destination.description}
        </p>
        {destination.highlights.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {destination.highlights.slice(0, compact ? 2 : 3).map((item) => (
              <li
                key={item}
                className="rounded-full bg-foam px-2.5 py-1 text-[0.6875rem] text-ink/55"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );

  const classes = `group overflow-hidden rounded-[1.25rem] border border-ink/8 bg-white/70 shadow-[0_10px_28px_rgb(10_22_32_/_0.06)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgb(10_22_32_/_0.1)] ${className}`;

  if (href) {
    return (
      <Link href={href} className={`block ${classes}`}>
        {body}
      </Link>
    );
  }

  return <article className={classes}>{body}</article>;
}
