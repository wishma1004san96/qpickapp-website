"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const fieldClass =
  "w-full rounded-[14px] border border-ink/10 bg-white px-3.5 py-3 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink/40 focus:border-brand/35 focus:ring-2 focus:ring-brand/20";

const DESTINATION_OPTIONS = [
  "Colombo",
  "Negombo",
  "Kandy",
  "Galle",
  "Ella",
  "Nuwara Eliya",
  "Sigiriya",
  "Mirissa",
  "Trincomalee",
  "Anuradhapura",
  "Yala",
  "Bentota",
] as const;

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function TourBookingForm() {
  const router = useRouter();
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [destinations, setDestinations] = useState<string[]>(["Kandy"]);
  const [customDestination, setCustomDestination] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [vehicleType, setVehicleType] = useState("suv");
  const [passengers, setPassengers] = useState(2);
  const [specialRequest, setSpecialRequest] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const endDate = useMemo(() => {
    const start = new Date(`${startDate}T12:00:00`);
    if (Number.isNaN(start.getTime())) return "";
    start.setDate(start.getDate() + Math.max(numberOfDays - 1, 0));
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  }, [startDate, numberOfDays]);

  function toggleDestination(label: string) {
    setDestinations((prev) =>
      prev.includes(label)
        ? prev.filter((d) => d !== label)
        : [...prev, label],
    );
  }

  function addCustomDestination() {
    const value = customDestination.trim();
    if (!value) return;
    setDestinations((prev) =>
      prev.includes(value) ? prev : [...prev, value],
    );
    setCustomDestination("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!passengerName.trim() || !passengerPhone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    if (destinations.length === 0) {
      setError("Select at least one destination.");
      return;
    }
    if (numberOfDays < 1) {
      setError("Number of days must be at least 1.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tour-booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passengerName,
          passengerPhone,
          passengerEmail: passengerEmail || null,
          destinations,
          startDate,
          endDate: endDate || null,
          numberOfDays,
          vehicleType,
          passengers,
          specialRequest: specialRequest || null,
        }),
      });
      const data = (await res.json()) as {
        item?: { id: string };
        error?: string;
      };
      if (!res.ok || !data.item?.id) {
        setError(data.error ?? "Could not submit tour booking request.");
        return;
      }
      router.push(`/tour-booking/confirmation/${data.item.id}`);
    } catch {
      setError("Could not submit tour booking request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="rounded-[1.25rem] border border-ink/8 bg-paper p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-ink">
          Tour booking request
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          Choose destinations, dates, vehicle, and trip length. An admin will
          review and assign a driver/guide — separate from Ride and Airport
          Transfer booking.
        </p>

        <fieldset className="mt-6">
          <legend className="text-xs font-medium tracking-wide text-ink/50 uppercase">
            Destinations
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {DESTINATION_OPTIONS.map((label) => {
              const active = destinations.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleDestination(label)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-brand bg-brand text-paper"
                      : "border-ink/12 bg-white text-ink hover:border-brand/30"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className={fieldClass}
              value={customDestination}
              onChange={(e) => setCustomDestination(e.target.value)}
              placeholder="Add another destination"
            />
            <Button type="button" variant="secondary" onClick={addCustomDestination}>
              Add
            </Button>
          </div>
          {destinations.length > 0 ? (
            <p className="mt-2 text-sm text-ink/55">
              Selected: {destinations.join(" · ")}
            </p>
          ) : null}
        </fieldset>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Start date
            </span>
            <input
              type="date"
              className={fieldClass}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Number of days
            </span>
            <input
              type="number"
              min={1}
              max={30}
              className={fieldClass}
              value={numberOfDays}
              onChange={(e) =>
                setNumberOfDays(Math.max(1, Number(e.target.value) || 1))
              }
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              End date (auto)
            </span>
            <input className={`${fieldClass} bg-mist/40`} value={endDate} readOnly />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Vehicle type
            </span>
            <select
              className={fieldClass}
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="miniCoach">Mini coach</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Travelers
            </span>
            <input
              type="number"
              min={1}
              max={20}
              className={fieldClass}
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value) || 1)}
            />
          </label>
        </div>
      </div>

      <div className="rounded-[1.25rem] border border-ink/8 bg-paper p-6 sm:p-8">
        <h3 className="font-display text-lg font-semibold text-ink">
          Contact details
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Full name
            </span>
            <input
              className={fieldClass}
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Phone
            </span>
            <input
              className={fieldClass}
              value={passengerPhone}
              onChange={(e) => setPassengerPhone(e.target.value)}
              required
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Email
            </span>
            <input
              type="email"
              className={fieldClass}
              value={passengerEmail}
              onChange={(e) => setPassengerEmail(e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Notes for your itinerary
            </span>
            <textarea
              className={`${fieldClass} min-h-24 resize-y`}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit tour booking request"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function TourBookingPage() {
  return (
    <main className="min-h-svh bg-foam">
      <section className="border-b border-ink/8 bg-map-void pt-28 pb-12 text-foam sm:pt-32">
        <Container>
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand-bright uppercase">
            Tour Booking Requests
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-[clamp(1.85rem,4vw,3rem)] font-semibold tracking-tight">
            Plan a private tour
          </h1>
          <p className="mt-3 max-w-xl text-foam/65">
            Tell us where you want to go. Our team reviews every request and
            assigns a driver/guide.
          </p>
        </Container>
      </section>
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <TourBookingForm />
        </div>
      </Container>
    </main>
  );
}
