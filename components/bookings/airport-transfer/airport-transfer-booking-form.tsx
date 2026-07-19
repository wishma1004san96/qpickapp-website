"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  AIRPORT_ORIGIN,
  formatAirportFare,
  searchAirportRates,
  type AirportRate,
} from "@/lib/airport-rates";
import { consumeAirportTransferPrefill } from "@/lib/airport-transfer-prefill";
import { CMB_PICKUP } from "@/domains/airport-transfer-requests/status";

const fieldClass =
  "w-full rounded-[14px] border border-ink/10 bg-white px-3.5 py-3 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink/40 focus:border-brand/35 focus:ring-2 focus:ring-brand/20";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function AirportTransferBookingForm() {
  const router = useRouter();
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [nationality, setNationality] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AirportRate | null>(null);
  const [transferDate, setTransferDate] = useState(todayISO());
  const [transferTime, setTransferTime] = useState("12:00");
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState("medium");
  const [vehicleType, setVehicleType] = useState("sedan");
  const [specialRequest, setSpecialRequest] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const prefill = consumeAirportTransferPrefill();
    if (!prefill) return;
    setQuery(prefill.destination);
    setTransferDate(prefill.date || todayISO());
    setTransferTime(prefill.time || "12:00");
    setPassengers(prefill.passengers || 1);
    setLuggage(prefill.luggage || "medium");
    setVehicleType(prefill.vehicle || "sedan");
    setNationality(prefill.nationality || "");
    setSpecialRequest(prefill.specialRequest || "");
    const match = searchAirportRates(prefill.destinationCode || prefill.destination, 1)[0];
    if (match) setSelected(match);
  }, []);

  const suggestions = useMemo(
    () => (query.trim() ? searchAirportRates(query, 8) : []),
    [query],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!passengerName.trim() || !passengerPhone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    if (!selected) {
      setError("Please select a destination from the official rate list.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/airport-transfer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passengerName,
          passengerPhone,
          passengerEmail: passengerEmail || null,
          nationality: nationality || null,
          destinationLabel: selected.destination,
          destinationCode: selected.code,
          officialFareLkr: selected.rate,
          transferDate,
          transferTime,
          passengers,
          luggage,
          vehicleType,
          specialRequest: specialRequest || null,
        }),
      });
      const data = (await res.json()) as {
        item?: { id: string };
        error?: string;
      };
      if (!res.ok || !data.item?.id) {
        setError(data.error ?? "Could not submit transfer request.");
        return;
      }
      router.push(`/airport-transfer/confirmation/${data.item.id}`);
    } catch {
      setError("Could not submit transfer request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="rounded-[1.25rem] border border-ink/8 bg-paper p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-ink">
          Airport transfer request
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          Pickup is fixed at {CMB_PICKUP.label}. An admin will review your
          request and assign a driver — this is separate from Taxi Ride booking.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Pickup
            </span>
            <input
              className={`${fieldClass} bg-mist/40`}
              value={AIRPORT_ORIGIN}
              readOnly
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Destination
            </span>
            <input
              className={fieldClass}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
              placeholder="Search destination (e.g. Colombo, Negombo)"
              autoComplete="off"
            />
            {suggestions.length > 0 && !selected ? (
              <ul className="mt-2 max-h-48 overflow-auto rounded-[12px] border border-ink/10 bg-white">
                {suggestions.map((rate) => (
                  <li key={rate.code}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-brand/5"
                      onClick={() => {
                        setSelected(rate);
                        setQuery(rate.destination);
                      }}
                    >
                      <span>{rate.destination}</span>
                      <span className="font-mono text-xs text-ink/45">
                        {formatAirportFare(rate.rate)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {selected ? (
              <p className="mt-2 text-sm font-medium text-brand-deep">
                Official fare: {formatAirportFare(selected.rate)}
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Date
            </span>
            <input
              type="date"
              className={fieldClass}
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Time
            </span>
            <input
              type="time"
              className={fieldClass}
              value={transferTime}
              onChange={(e) => setTransferTime(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Passengers
            </span>
            <input
              type="number"
              min={1}
              max={12}
              className={fieldClass}
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value) || 1)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Luggage
            </span>
            <select
              className={fieldClass}
              value={luggage}
              onChange={(e) => setLuggage(e.target.value)}
            >
              <option value="cabin">Cabin</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Vehicle
            </span>
            <select
              className={fieldClass}
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="mini">Mini</option>
              <option value="sedan">Sedan</option>
              <option value="van">Van</option>
              <option value="suv">SUV</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium tracking-wide text-ink/50 uppercase">
              Nationality
            </span>
            <input
              className={fieldClass}
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="Optional"
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
              Special requests
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
            {submitting ? "Submitting…" : "Submit airport transfer request"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function AirportTransferBookingPage() {
  return (
    <main className="min-h-svh bg-foam">
      <section className="border-b border-ink/8 bg-map-void pt-28 pb-12 text-foam sm:pt-32">
        <Container>
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-brand-bright uppercase">
            Airport Transfer Requests
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-[clamp(1.85rem,4vw,3rem)] font-semibold tracking-tight">
            Book an airport transfer
          </h1>
          <p className="mt-3 max-w-xl text-foam/65">
            From Bandaranaike International Airport (CMB). Your request is
            reviewed by our team before a driver is assigned.
          </p>
        </Container>
      </section>
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl">
          <AirportTransferBookingForm />
        </div>
      </Container>
    </main>
  );
}
