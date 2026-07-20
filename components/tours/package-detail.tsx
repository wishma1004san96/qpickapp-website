import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { AnimatedRouteMap } from "@/components/tours/animated-route-map";
import { CinematicFinalCta } from "@/components/tours/cinematic-final-cta";
import { CinematicGallery } from "@/components/tours/cinematic-gallery";
import { DayChapterItinerary } from "@/components/tours/day-chapter-itinerary";
import { DestinationExperienceCard } from "@/components/tours/destination-experience-card";
import { FaqAccordion } from "@/components/tours/faq-accordion";
import { JsonLd } from "@/components/tours/json-ld";
import { PackageCard } from "@/components/tours/package-card";
import { SuggestedStays } from "@/components/tours/suggested-stays";
import { VehicleCard } from "@/components/tours/vehicle-card";
import { WhyThisTour } from "@/components/tours/why-this-tour";
import { formatTourPriceLkr } from "@/lib/tours/pricing-display";
import {
  getAllVehicles,
  getBookHref,
  getDestinationsForPackage,
  getFaqsByIds,
  getGalleryImage,
  getPackageBySlug,
  getPackageDayChapters,
  getPackageGallery,
  getPackageHref,
  getPackageItineraryRoute,
  getSuggestedStaysForPackage,
  getTourPricingConfig,
  getVehicleById,
} from "@/lib/tours/repository";
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildTouristTripJsonLd,
} from "@/lib/tours/schema";

type PackageDetailProps = {
  slug: string;
};

export function PackageDetail({ slug }: PackageDetailProps) {
  const pkg = getPackageBySlug(slug);
  if (!pkg) notFound();

  const hero = getGalleryImage(pkg.heroGalleryId);
  const gallery = getPackageGallery(pkg.slug);
  const destinations = getDestinationsForPackage(pkg.slug);
  const chapters = getPackageDayChapters(pkg.slug);
  const itineraryRoute = getPackageItineraryRoute(pkg.slug);
  const faqs = getFaqsByIds(pkg.faqIds);
  const vehicle = getVehicleById(pkg.vehicleId);
  const vehicles = getAllVehicles();
  const stays = getSuggestedStaysForPackage(pkg.slug);
  const related = pkg.relatedPackageSlugs
    .map((s) => getPackageBySlug(s))
    .filter((p): p is NonNullable<typeof p> => p != null);
  const bookHref = getBookHref(pkg.slug);
  const pricing = getTourPricingConfig();
  const features = pkg.experienceFeatures ?? [];

  const schemas = [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Tours", path: "/tours" },
      { name: pkg.title, path: getPackageHref(pkg.slug) },
    ]),
    buildTouristTripJsonLd(pkg),
    buildFaqPageJsonLd(faqs),
  ];

  return (
    <>
      <JsonLd data={schemas} />

      <section className="relative isolate min-h-[min(78vh,720px)] overflow-hidden bg-map-void text-foam">
        {hero ? (
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            priority
            className="object-cover scale-105"
            sizes="100vw"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-map-void via-map-void/50 to-map-void/25" />
        <Container className="relative flex min-h-[min(78vh,720px)] flex-col justify-end pb-14 pt-28">
          <nav aria-label="Breadcrumb" className="text-xs text-foam/55">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href="/" className="hover:text-foam">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/tours" className="hover:text-foam">
                  Tours
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-foam/80">{pkg.title}</li>
            </ol>
          </nav>
          <p className="mt-5 font-mono text-[0.6875rem] tracking-[0.2em] text-brand-bright uppercase">
            {pkg.durationDays}-day private chauffeur journey
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,3.75rem)] font-semibold leading-[1.05] tracking-tight">
            {pkg.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foam/70 sm:text-base">
            {pkg.seo.intro.slice(0, 160)}
            {pkg.seo.intro.length > 160 ? "…" : ""}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={bookHref}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-7 text-sm font-semibold text-paper shadow-[0_14px_32px_rgb(0_98_250_/_0.4)]"
            >
              Book This Tour
            </Link>
            <a
              href="#itinerary"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-foam/25 bg-foam/10 px-7 text-sm font-semibold text-foam backdrop-blur-md"
            >
              Read the journey
            </a>
          </div>
        </Container>
      </section>

      <div className="bg-foam">
        <Container className="grid gap-12 py-14 lg:grid-cols-[1fr_340px] lg:gap-14 lg:py-20">
          <article className="min-w-0 space-y-16">
            <section>
              <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
                Overview
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                A journey, not a checklist
              </h2>
              <p className="mt-4 text-[0.975rem] leading-relaxed text-ink/65 sm:text-base">
                {pkg.seo.intro}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Gallery
              </h2>
              <div className="mt-5">
                <CinematicGallery
                  images={gallery.length ? gallery : hero ? [hero] : []}
                  showVideoPlaceholder={pkg.videoPlaceholder !== false}
                />
              </div>
            </section>

            {features.length > 0 ? (
              <WhyThisTour features={features} />
            ) : null}

            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Chauffeur journey
              </h2>
              <p className="mt-2 text-sm text-ink/55">
                Real Sri Lankan roads, numbered stops, and your private vehicle —
                synced to the day-by-day itinerary.
              </p>
              <div className="mt-5">
                {itineraryRoute ? (
                  <AnimatedRouteMap
                    itineraryRoute={itineraryRoute}
                    title={pkg.title}
                    vehicle={vehicle}
                    durationDays={pkg.durationDays}
                  />
                ) : null}
              </div>
            </section>

            <section id="itinerary" className="scroll-mt-28">
              <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand uppercase">
                Day by day
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                Scroll the story
              </h2>
              <p className="mt-2 max-w-xl text-sm text-ink/55">
                Each day is a visual chapter — arrival, heritage, highlands,
                wildlife, or coast.
              </p>
              <div className="mt-10">
                <DayChapterItinerary chapters={chapters} />
              </div>
            </section>

            {destinations.length > 0 ? (
              <section>
                <h2 className="font-display text-2xl font-semibold text-ink">
                  Places on this journey
                </h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {destinations.map((destination, i) => (
                    <DestinationExperienceCard
                      key={destination.slug}
                      destination={destination}
                      timeFromPrevious={
                        i === 0
                          ? "From CMB corridor"
                          : `After ${destinations[i - 1]?.name}`
                      }
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <SuggestedStays stays={stays} />

            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Vehicle experience
              </h2>
              <p className="mt-2 text-sm text-ink/55">
                Recommended class highlighted — change freely when you plan.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {vehicles.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    selected={v.id === pkg.vehicleId}
                    experience
                  />
                ))}
              </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-ink/8 bg-white p-6">
                <h2 className="font-display text-xl font-semibold text-ink">
                  Included
                </h2>
                <ul className="mt-4 space-y-2.5 text-sm text-ink/65">
                  {pkg.included.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-brand">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.35rem] border border-ink/8 bg-white p-6">
                <h2 className="font-display text-xl font-semibold text-ink">
                  Excluded
                </h2>
                <ul className="mt-4 space-y-2.5 text-sm text-ink/65">
                  {pkg.excluded.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-ink/30">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">
                  Travel tips
                </h2>
                <ul className="mt-4 space-y-2">
                  {pkg.travelTips.map((tip) => (
                    <li
                      key={tip}
                      className="rounded-[1rem] border border-ink/8 bg-white px-4 py-3 text-sm leading-relaxed text-ink/70"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">
                  Packing tips
                </h2>
                <ul className="mt-4 space-y-2">
                  {(pkg.packingTips ?? []).map((tip) => (
                    <li
                      key={tip}
                      className="rounded-[1rem] border border-ink/8 bg-white px-4 py-3 text-sm leading-relaxed text-ink/70"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Best time & weather
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <p className="rounded-[1.35rem] border border-ink/8 bg-white p-5 text-sm leading-relaxed text-ink/65">
                  <span className="block font-mono text-[0.625rem] tracking-wide text-ink/40 uppercase">
                    Best time to visit
                  </span>
                  <span className="mt-2 block">{pkg.bestTimeToVisit}</span>
                </p>
                <p className="rounded-[1.35rem] border border-dashed border-ink/15 bg-foam/80 p-5 text-sm leading-relaxed text-ink/55">
                  <span className="block font-mono text-[0.625rem] tracking-wide text-ink/40 uppercase">
                    Weather placeholder
                  </span>
                  <span className="mt-2 block">
                    Live forecasts will appear here in a future update. For now,
                    use each destination’s seasonal guidance above and tell us
                    your travel month when requesting a quote.
                  </span>
                </p>
              </div>
            </section>

            {faqs.length > 0 ? (
              <section>
                <h2 className="font-display text-2xl font-semibold text-ink">
                  FAQ
                </h2>
                <div className="mt-5">
                  <FaqAccordion faqs={faqs} />
                </div>
              </section>
            ) : null}

            {related.length > 0 ? (
              <section>
                <h2 className="font-display text-2xl font-semibold text-ink">
                  Related journeys
                </h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {related.map((rel) => (
                    <PackageCard key={rel.slug} package={rel} />
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white/90 shadow-[0_20px_50px_rgb(10_22_32_/_0.1)] backdrop-blur-xl">
              {hero ? (
                <div className="relative h-36">
                  <Image
                    src={hero.src}
                    alt={hero.alt}
                    fill
                    className="object-cover"
                    sizes="340px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                </div>
              ) : null}
              <div className="p-6">
                <p className="font-mono text-[0.625rem] tracking-wide text-ink/40 uppercase">
                  Private quote
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-brand-deep">
                  {formatTourPriceLkr(pkg.startingPriceLkr)}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ink/45">
                  {pricing.quoteHint}
                </p>
                <dl className="mt-5 space-y-3 border-t border-ink/8 pt-5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink/45">Duration</dt>
                    <dd className="font-semibold text-ink">
                      {pkg.durationDays} days
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink/45">Vehicle</dt>
                    <dd className="font-semibold text-ink">
                      {vehicle?.name ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink/45">Stops</dt>
                    <dd className="font-semibold text-ink">
                      {pkg.destinationSlugs.length}
                    </dd>
                  </div>
                </dl>
                <Link
                  href={bookHref}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-sm font-semibold text-paper shadow-[0_12px_28px_rgb(0_98_250_/_0.35)]"
                >
                  Book This Tour
                </Link>
                <a
                  href="https://wa.me/94783619000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-ink/12 text-sm font-semibold text-ink hover:border-brand/30"
                >
                  Speak with an expert
                </a>
              </div>
            </div>
          </aside>
        </Container>

        <Container className="pb-20 sm:pb-24">
          <CinematicFinalCta
            headline="Your Sri Lanka Journey Starts Here"
            body={`Ready for ${pkg.title}? Open the planner — we confirm pacing, vehicle, and a written quote.`}
            primaryLabel="Plan My Journey"
            primaryHref={bookHref}
            secondaryLabel="Speak With A Travel Expert"
            secondaryHref="https://wa.me/94783619000"
            imageSrc={hero?.src ?? "/images/destinations/sigiriya.webp"}
            imageAlt={hero?.alt ?? "Sri Lanka private tour"}
          />
        </Container>
      </div>
    </>
  );
}
