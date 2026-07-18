"use client";

import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { DriverTrustRow } from "@/components/marketing/driver-trust-row";
import { PageShell } from "@/components/marketing/page-shell";
import { TaxiFareEstimator } from "@/components/marketing/taxi-fare-estimator";

export function RideContent() {
  const t = useTranslations();
  const { pages } = useMessages();
  const { ride } = pages;
  const features = [
    ride.features.onDemand,
    ride.features.scheduled,
    ride.features.intercity,
  ];

  return (
    <PageShell
      title={t("pages.ride.title")}
      description={t("pages.ride.description")}
      primaryCta={{ href: "#taxi-fare", label: t("pages.ride.primaryCta") }}
      secondaryCta={{ href: "/safety", label: t("pages.ride.secondaryCta") }}
    >
      <div className="space-y-12 sm:space-y-14">
        <div className="grid gap-8 sm:grid-cols-3">
          {features.map((item) => (
            <div key={item.title} className="border-t border-mist pt-5">
              <h2 className="text-lg font-medium text-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <TaxiFareEstimator />

        <div className="max-w-md">
          <DriverTrustRow
            name={ride.driverTrust.name}
            trips={ride.driverTrust.trips}
            rating={ride.driverTrust.rating}
            verifiedLabel={ride.driverTrust.verifiedLabel}
            tripsLabel={t("pages.ride.driverTrust.tripsLabel", {
              count: ride.driverTrust.trips,
            })}
          />
        </div>
      </div>
    </PageShell>
  );
}
