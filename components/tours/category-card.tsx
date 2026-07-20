import Link from "next/link";
import type { TourCategory } from "@/lib/tours/types";

type CategoryCardProps = {
  category: TourCategory;
  packageCount: number;
  className?: string;
};

export function CategoryCard({
  category,
  packageCount,
  className = "",
}: CategoryCardProps) {
  return (
    <Link
      href={`/tours#${category.hash}`}
      className={`group block rounded-[1.25rem] border border-ink/8 bg-gradient-to-br from-white to-[#f0f5fa] p-5 shadow-[0_10px_28px_rgb(10_22_32_/_0.05)] transition-[transform,border-color] hover:-translate-y-0.5 hover:border-brand/25 ${className}`}
    >
      <p className="font-mono text-[0.625rem] tracking-[0.16em] text-brand uppercase">
        {packageCount} packages
      </p>
      <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-ink group-hover:text-brand">
        {category.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/55">
        {category.intro}
      </p>
    </Link>
  );
}
