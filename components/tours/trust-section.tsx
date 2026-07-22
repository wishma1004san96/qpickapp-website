import {
  Clock3,
  Headphones,
  MapPinned,
  Plane,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { TourSectionHeader } from "@/components/tours/package-detail-ui";
import type { TrustSignal } from "@/lib/tours/types";

const ICONS = [ShieldCheck, Users, Plane, Headphones, Sparkles, MapPinned, Clock3];

type TrustSectionProps = {
  signals: TrustSignal[];
  title?: string;
  className?: string;
};

export function TrustSection({
  signals,
  title = "Why Travel With Q Pick",
  className = "",
}: TrustSectionProps) {
  return (
    <section className={className} aria-label={title}>
      <TourSectionHeader title={title} />
      <ul className="tour-detail-grid tour-detail-grid--2 tour-detail-equal-cards tour-detail-stack lg:grid-cols-3 xl:grid-cols-4">
        {signals.map((signal, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <li
              key={signal.id}
              className="tour-detail-card tour-detail-card--lift flex h-full flex-col p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/8 text-brand">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-ink">{signal.title}</h3>
              <p className="mt-1.5 text-xs leading-[1.6] text-ink/55">
                {signal.description}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
