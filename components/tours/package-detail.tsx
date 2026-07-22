import { PackageDetailHero } from "@/components/tours/package-detail-hero";
import { PackageDetailJourneySync } from "@/components/tours/package-detail-journey-sync";
import { PackageDetailRouteMap } from "@/components/tours/package-detail-route-map";
import { PackageDetailVehicleExperience } from "@/components/tours/package-detail-vehicle-experience";
import { PackageDetailVehicleProvider } from "@/components/tours/package-detail-vehicle-context";
import {
  TourDetailSection,
  TourReveal,
  TourSectionHeader,
} from "@/components/tours/package-detail-ui";
import { Container } from "@/components/ui/container";
import { notFound } from "next/navigation";
import { CinematicFinalCta } from "@/components/tours/cinematic-final-cta";
import { CinematicGallery } from "@/components/tours/cinematic-gallery";
import { DayChapterItinerary } from "@/components/tours/day-chapter-itinerary";
import { DestinationExperienceCard } from "@/components/tours/destination-experience-card";
import { FaqAccordion } from "@/components/tours/faq-accordion";
import { IncludedExcluded } from "@/components/tours/included-excluded";
import { JsonLd } from "@/components/tours/json-ld";
import { PackageBookingForm } from "@/components/tours/package-booking-form";
import { PackageCard } from "@/components/tours/package-card";
import { PackageStickyBooking } from "@/components/tours/package-sticky-booking";
import { Reviews } from "@/components/tours/reviews";
import { SuggestedStays } from "@/components/tours/suggested-stays";
import { TourHighlights } from "@/components/tours/tour-highlights";
import { TrustSection } from "@/components/tours/trust-section";
import { WhyThisTour } from "@/components/tours/why-this-tour";
import {
  getAllVehicles,
  getBookHref,
  getCategoryById,
  getDestinationsForPackage,
  getExpandedPackageGallery,
  getFaqsByIds,
  getGalleryImage,
  getPackageBySlug,
  getPackageDayChapters,
  getPackageDetailTrustSignals,
  getPackageHref,
  getPackageItineraryRoute,
  getReviewsForPackage,
  getReviewsSectionMeta,
  getSuggestedStaysForPackage,
  getTourPricingConfig,
} from "@/lib/tours/repository";
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildTouristTripJsonLd,
} from "@/lib/tours/schema";
import { getDestinationImageSrc } from "@/lib/destination-image-catalog";

type PackageDetailProps = {
  slug: string;
};

export function PackageDetail({ slug }: PackageDetailProps) {
  const pkg = getPackageBySlug(slug);
  if (!pkg) notFound();

  const hero = getGalleryImage(pkg.heroGalleryId);
  const gallery = getExpandedPackageGallery(pkg.slug);
  const destinations = getDestinationsForPackage(pkg.slug);
  const destinationNames = destinations.map((d) => d.name);
  const chapters = getPackageDayChapters(pkg.slug);
  const itineraryRoute = getPackageItineraryRoute(pkg.slug);
  const faqs = getFaqsByIds(pkg.faqIds);
  const vehicles = getAllVehicles();
  const stays = getSuggestedStaysForPackage(pkg.slug);
  const related = pkg.relatedPackageSlugs
    .map((s) => getPackageBySlug(s))
    .filter((p): p is NonNullable<typeof p> => p != null);
  const reviews = getReviewsForPackage(pkg.slug);
  const reviewsMeta = getReviewsSectionMeta();
  const trustSignals = getPackageDetailTrustSignals();
  const bookHref = getBookHref(pkg.slug);
  const pricing = getTourPricingConfig();
  const features = pkg.experienceFeatures ?? [];
  const primaryCategoryId =
    pkg.categoryIds.find((id) => id !== "popular") ?? pkg.categoryIds[0];
  const tourStyle =
    getCategoryById(primaryCategoryId)?.title.replace(" Tour Packages", "") ??
    "Private Tour";

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
    <PackageDetailVehicleProvider
      vehicles={vehicles}
      initialVehicleId={pkg.vehicleId}
      recommendedVehicleId={pkg.vehicleId}
    >
      <div className="tour-detail-page">
        <JsonLd data={schemas} />

        <PackageDetailHero pkg={pkg} hero={hero} tourStyle={tourStyle} />

      <div className="bg-foam">
        <Container className="tour-detail-layout">
          <article className="tour-detail-main tour-detail-article">
            <TourReveal>
              <TourDetailSection aria-label="Overview">
                <TourSectionHeader
                  eyebrow="Overview"
                  title="A journey, not a checklist"
                />
                <p className="tour-detail-body tour-detail-stack max-w-3xl">
                  {pkg.seo.intro}
                </p>
              </TourDetailSection>
            </TourReveal>

            <TourReveal>
              <TourHighlights highlights={pkg.highlights} />
            </TourReveal>

            <TourReveal>
              <TourDetailSection aria-label="Gallery">
                <TourSectionHeader
                  eyebrow="Visual journey"
                  title="Gallery"
                  lead="Premium Sri Lankan landscapes, heritage sites, and coastlines on your private route."
                />
                <div className="tour-detail-stack">
                  <CinematicGallery
                    images={gallery.length ? gallery : hero ? [hero] : []}
                    showVideoPlaceholder={pkg.videoPlaceholder !== false}
                  />
                </div>
              </TourDetailSection>
            </TourReveal>

            {features.length > 0 ? (
              <TourReveal>
                <WhyThisTour features={features} />
              </TourReveal>
            ) : null}

            <TourReveal>
              <TrustSection
                signals={trustSignals}
                title="Travel with confidence"
                className="tour-detail-card p-6 sm:p-8"
              />
            </TourReveal>

            <PackageDetailJourneySync>
              <TourReveal>
                <TourDetailSection aria-label="Chauffeur journey">
                  <TourSectionHeader
                    title="Chauffeur journey"
                    lead="Real Sri Lankan roads, numbered stops, and your private vehicle — synced to the day-by-day itinerary."
                  />
                  <div className="tour-detail-stack">
                    {itineraryRoute ? (
                      <PackageDetailRouteMap
                        itineraryRoute={itineraryRoute}
                        title={pkg.title}
                        durationDays={pkg.durationDays}
                      />
                    ) : null}
                  </div>
                </TourDetailSection>
              </TourReveal>

              <TourReveal>
                <TourDetailSection id="itinerary" aria-label="Day by day itinerary">
                  <TourSectionHeader
                    eyebrow="Day by day"
                    title="Scroll the story"
                    lead="Each day is a visual chapter — arrival, heritage, highlands, wildlife, or coast."
                  />
                  <div className="tour-detail-stack">
                    <DayChapterItinerary
                      chapters={chapters}
                      dayToStopId={itineraryRoute?.dayToStopId}
                    />
                  </div>
                </TourDetailSection>
              </TourReveal>
            </PackageDetailJourneySync>

            {destinations.length > 0 ? (
              <TourReveal>
                <TourDetailSection aria-label="Places on this journey">
                  <TourSectionHeader title="Places on this journey" />
                  <div className="tour-detail-grid tour-detail-grid--2 tour-detail-equal-cards tour-detail-stack">
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
                </TourDetailSection>
              </TourReveal>
            ) : null}

            <TourReveal>
              <SuggestedStays stays={stays} />
            </TourReveal>

            <TourReveal>
              <TourDetailSection aria-label="Vehicle experience">
                <TourSectionHeader
                  eyebrow="Private fleet"
                  title="Vehicle experience"
                  lead="Premium real-world vehicles — recommended class highlighted. Change freely when you plan."
                />
                <PackageDetailVehicleExperience />
              </TourDetailSection>
            </TourReveal>

            <TourReveal>
              <IncludedExcluded
                included={pkg.included}
                excluded={pkg.excluded}
              />
            </TourReveal>

            <TourReveal>
              <TourDetailSection aria-label="Travel and packing tips">
                <div className="tour-detail-grid tour-detail-grid--2">
                  <div>
                    <TourSectionHeader title="Travel tips" />
                    <ul className="tour-detail-stack space-y-2.5">
                      {pkg.travelTips.map((tip) => (
                        <li
                          key={tip}
                          className="tour-detail-card tour-detail-card--lift px-4 py-3.5 text-sm leading-[1.65] text-ink/70"
                        >
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <TourSectionHeader title="Packing tips" />
                    <ul className="tour-detail-stack space-y-2.5">
                      {(pkg.packingTips ?? []).map((tip) => (
                        <li
                          key={tip}
                          className="tour-detail-card tour-detail-card--lift px-4 py-3.5 text-sm leading-[1.65] text-ink/70"
                        >
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TourDetailSection>
            </TourReveal>

            <TourReveal>
              <TourDetailSection aria-label="Best time and weather">
                <TourSectionHeader title="Best time & weather" />
                <div className="tour-detail-grid tour-detail-grid--2 tour-detail-stack">
                  <p className="tour-detail-card px-5 py-5 text-sm leading-[1.65] text-ink/65">
                    <span className="tour-detail-eyebrow">Best time to visit</span>
                    <span className="mt-3 block tour-detail-body">{pkg.bestTimeToVisit}</span>
                  </p>
                  <p className="tour-detail-card border-dashed px-5 py-5 text-sm leading-[1.65] text-ink/58">
                    <span className="tour-detail-eyebrow">Weather guidance</span>
                    <span className="mt-3 block tour-detail-body">
                      Share your travel month in the booking form — we advise on
                      seasonal routing, east vs west coast, and safari windows
                      for your dates.
                    </span>
                  </p>
                </div>
              </TourDetailSection>
            </TourReveal>

            <TourReveal>
              <PackageBookingForm
                pkg={pkg}
                vehicles={vehicles}
                destinationNames={destinationNames}
              />
            </TourReveal>

            <TourReveal>
              <TourDetailSection aria-label="Guest reviews">
                <TourSectionHeader
                  eyebrow="Guest stories"
                  title={reviewsMeta.title}
                />
                {reviews.length > 0 ? (
                  <Reviews reviews={reviews} className="tour-detail-stack" />
                ) : (
                  <p className="tour-detail-lead tour-detail-stack">
                    {reviewsMeta.emptyBody}
                  </p>
                )}
              </TourDetailSection>
            </TourReveal>

            {faqs.length > 0 ? (
              <TourReveal>
                <TourDetailSection aria-label="Frequently asked questions">
                  <TourSectionHeader
                    eyebrow="Frequently asked questions"
                    title="FAQ"
                    lead="Everything you need to know before planning your journey with Q Pick."
                  />
                  <div className="tour-detail-stack mt-6 sm:mt-8">
                    <FaqAccordion faqs={faqs} />
                  </div>
                </TourDetailSection>
              </TourReveal>
            ) : null}

            {related.length > 0 ? (
              <TourReveal>
                <TourDetailSection aria-label="Related journeys">
                  <TourSectionHeader title="Related journeys" />
                  <div className="tour-detail-grid tour-detail-grid--2 tour-detail-equal-cards tour-detail-stack">
                    {related.map((rel) => (
                      <PackageCard
                        key={rel.slug}
                        package={rel}
                        variant="related"
                      />
                    ))}
                  </div>
                </TourDetailSection>
              </TourReveal>
            ) : null}
          </article>

          <div className="tour-detail-aside">
            <PackageStickyBooking
              pkg={pkg}
              heroSrc={hero?.src}
              heroAlt={hero?.alt}
              bookHref={bookHref}
              pricing={pricing}
              included={pkg.included}
            />
          </div>
        </Container>

        <Container className="pb-16 sm:pb-20 lg:pb-24">
          <TourReveal>
            <CinematicFinalCta
              headline="Your Sri Lanka Journey Starts Here"
              body={`Ready for ${pkg.title}? Submit the form above or open the planner — we confirm pacing, vehicle, and a written quote.`}
              primaryLabel="Plan My Journey"
              primaryHref={bookHref}
              secondaryLabel="Speak With A Travel Expert"
              secondaryHref="https://wa.me/94783619000"
              imageSrc={hero?.src ?? getDestinationImageSrc("sigiriya")}
              imageAlt={hero?.alt ?? "Sri Lanka private tour"}
            />
          </TourReveal>
        </Container>
      </div>
      </div>
    </PackageDetailVehicleProvider>
  );
}
