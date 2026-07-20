import {
  Clock3,
  Headphones,
  MapPinned,
  Plane,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
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
    <section className={className}>
      <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {signals.map((signal, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <li
              key={signal.id}
              className="rounded-[1.2rem] border border-ink/8 bg-white/75 p-5 shadow-[0_8px_24px_rgb(10_22_32_/_0.04)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/8 text-brand">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-ink">{signal.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink/50">
                {signal.description}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
