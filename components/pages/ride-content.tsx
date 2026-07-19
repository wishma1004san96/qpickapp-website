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
        className="border-b border-ink/5 bg-[linear-gradient(180deg,#eef4fb_0%,#F8FAFF_45%,#ffffff_100%)] pt-[6.6rem] sm:pt-[7.7rem]"
        aria-label="Ride booking"
      >
        <Container className="flex flex-col justify-center pb-11 pt-7 sm:pb-14 sm:pt-9 lg:pb-16 lg:pt-10">
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
