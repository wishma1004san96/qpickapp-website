import type { TourCategory, TourPackage } from "@/lib/tours/types";
import { PackageCard } from "@/components/tours/package-card";

type CategorySectionProps = {
  category: TourCategory;
  packages: TourPackage[];
  className?: string;
};

export function CategorySection({
  category,
  packages,
  className = "",
}: CategorySectionProps) {
  if (packages.length === 0) return null;

  return (
    <section id={category.hash} className={`scroll-mt-28 ${className}`}>
      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-ink">
        {category.title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/55 sm:text-base">
        {category.intro}
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard key={`${category.id}-${pkg.slug}`} package={pkg} />
        ))}
      </div>
    </section>
  );
}
