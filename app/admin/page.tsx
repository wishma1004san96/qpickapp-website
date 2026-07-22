import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const modules = [
  {
    href: "/admin/ride-requests",
    title: "Ride Requests",
    body: "Real-time taxi rides — nearby driver matching and status workflow.",
  },
  {
    href: "/admin/airport-transfers",
    title: "Airport Transfer Requests",
    body: "CMB pickup transfers — review and assign a driver.",
  },
  {
    href: "/admin/tour-bookings",
    title: "Tour Booking Requests",
    body: "Multi-day tours — review and assign a driver/guide.",
  },
  {
    href: "/admin/pricing",
    title: "Taxi fare pricing",
    body: "Meter rates for the Ride estimator (not used by Airport/Tour).",
  },
  {
    href: "/admin/drivers/pending",
    title: "Pending Drivers",
    body: "Review driver onboarding applications, verify documents, and approve chauffeurs.",
  },
] as const;

export default function AdminHubPage() {
  return (
    <main className="min-h-svh bg-foam">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs font-medium tracking-wide text-ink/45 uppercase">
          Q Pick Admin
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          Booking modules
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Three separate booking systems — do not mix Ride, Airport Transfer,
          and Tour workflows.
        </p>
        <ul className="mt-8 space-y-3">
          {modules.map((m) => (
            <li key={m.href}>
              <Link
                href={m.href}
                className="block rounded-[1.1rem] border border-ink/10 bg-paper p-5 transition-[border-color,box-shadow] hover:border-brand/30 hover:shadow-[var(--shadow-ambient)]"
              >
                <p className="font-display text-lg font-semibold text-ink">
                  {m.title}
                </p>
                <p className="mt-1 text-sm text-ink/55">{m.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
