"use client";

import {
  RideFaqSection,
  RideFinalCta,
  RideFleetSection,
  RideSafetySection,
  RideWhySection,
} from "@/components/marketing/ride-page-sections";
import { TaxiFareEstimator } from "@/components/marketing/taxi-fare-estimator";
import { Container } from "@/components/ui/container";

/**
 * Ride page — single booking surface first (no duplicate intro).
 * Estimator is the page hero → why / fleet / safety / FAQ / CTA.
 */
export function RideContent() {
  return (
    <div className="bg-foam">
      <section
        className="border-b border-ink/5 bg-[linear-gradient(180deg,#eef4fb_0%,#F8FAFF_45%,#ffffff_100%)] pt-24 sm:pt-28"
        aria-label="Ride booking"
      >
        <Container className="pb-9 pt-5 sm:pb-11 sm:pt-7 lg:pb-12">
          <TaxiFareEstimator variant="page" />
        </Container>
      </section>

      <RideWhySection />
      <RideFleetSection />
      <RideSafetySection />
      <RideFaqSection />
      <RideFinalCta />
    </div>
  );
}
