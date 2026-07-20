import { JsonLd } from "@/components/tours/json-ld";
import { ToursExperience } from "@/components/tours/tours-experience";
import {
  getAllDestinations,
  getAllPackages,
  getAllVehicles,
  getBookHref,
  getCategories,
  getFinalCta,
  getGalleryImage,
  getHubFaqs,
  getHubHero,
  getReviews,
  getReviewsSectionMeta,
  getTrustSignals,
} from "@/lib/tours/repository";
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildPackageListJsonLd,
} from "@/lib/tours/schema";

export function ToursHub() {
  const hero = getHubHero();
  const heroImage = getGalleryImage(hero.imageId);
  const packages = getAllPackages();
  const destinations = getAllDestinations();
  const categories = getCategories();
  const vehicles = getAllVehicles();
  const trust = getTrustSignals();
  const reviews = getReviews();
  const reviewsMeta = getReviewsSectionMeta();
  const faqs = getHubFaqs();
  const finalCta = getFinalCta();
  const finalCtaImage = getGalleryImage(finalCta.imageId);

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tours", path: "/tours" },
  ]);
  const faqLd = buildFaqPageJsonLd(faqs);
  const listLd = buildPackageListJsonLd(packages.filter((p) => p.popular));

  return (
    <>
      <JsonLd data={[breadcrumb, faqLd, listLd]} />
      <ToursExperience
        hero={hero}
        heroImage={heroImage}
        packages={packages}
        destinations={destinations}
        categories={categories}
        vehicles={vehicles}
        trust={trust}
        reviews={reviews}
        reviewsMeta={reviewsMeta}
        faqs={faqs}
        finalCta={finalCta}
        finalCtaImage={finalCtaImage}
        bookHref={getBookHref()}
      />
    </>
  );
}
