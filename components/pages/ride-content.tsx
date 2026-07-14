"use client";

import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { DriverTrustRow } from "@/components/marketing/driver-trust-row";
import { FarePreview } from "@/components/marketing/fare-preview";
import { PageShell } from "@/components/marketing/page-shell";

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
      primaryCta={{ href: "/support", label: t("pages.ride.primaryCta") }}
      secondaryCta={{ href: "/safety", label: t("pages.ride.secondaryCta") }}
    >
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
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

        <div className="space-y-4">
          <FarePreview
            from={ride.farePreview.from}
            to={ride.farePreview.to}
            currency={ride.farePreview.currency}
            amount={ride.farePreview.amount}
            note={ride.farePreview.note}
            fromLabel={ride.farePreview.fromLabel}
            toLabel={ride.farePreview.toLabel}
          />
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
