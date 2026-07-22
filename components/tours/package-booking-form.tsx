"use client";

import { usePackageDetailVehicle } from "@/components/tours/package-detail-vehicle-context";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { TourSectionHeader } from "@/components/tours/package-detail-ui";
import type { TourPackage, TourVehicle, TourVehicleId } from "@/lib/tours/types";

type PackageBookingFormProps = {
  pkg: TourPackage;
  vehicles: TourVehicle[];
  destinationNames: string[];
  className?: string;
};

type FormState = {
  travelDate: string;
  travelers: string;
  pickupLocation: string;
  vehicleId: string;
  durationDays: string;
  specialRequests: string;
  name: string;
  email: string;
  whatsapp: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function validateForm(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.travelDate) errors.travelDate = "Please select your travel date.";
  if (!form.travelers || Number(form.travelers) < 1) {
    errors.travelers = "Enter at least one traveller.";
  }
  if (!form.pickupLocation.trim()) {
    errors.pickupLocation = "Pickup location is required.";
  }
  if (!form.name.trim()) errors.name = "Your name is required.";
  if (!form.whatsapp.trim()) {
    errors.whatsapp = "WhatsApp number is required so we can reach you.";
  }
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
}

export function PackageBookingForm({
  pkg,
  vehicles,
  destinationNames,
  className = "",
}: PackageBookingFormProps) {
  const { selectedVehicleId, selectVehicle, isVehicleSelectable } =
    usePackageDetailVehicle();
  const router = useRouter();
  const baseId = useId();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>(
    {},
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const [form, setForm] = useState<FormState>({
    travelDate: "",
    travelers: "2",
    pickupLocation: "Bandaranaike International Airport (CMB)",
    vehicleId: selectedVehicleId,
    durationDays: String(pkg.durationDays),
    specialRequests: "",
    name: "",
    email: "",
    whatsapp: "",
  });

  useEffect(() => {
    setForm((prev) =>
      prev.vehicleId === selectedVehicleId
        ? prev
        : { ...prev, vehicleId: selectedVehicleId },
    );
  }, [selectedVehicleId]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    if (key === "vehicleId" && typeof value === "string") {
      selectVehicle(value as TourVehicleId);
    }
    setForm((prev) => ({ ...prev, [key]: value }));
    if (touched[key]) {
      setErrors((prev) => {
        const next = validateForm({ ...form, [key]: value });
        return { ...prev, [key]: next[key] };
      });
    }
  }

  function blurField(key: keyof FormState) {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const nextErrors = validateForm(form);
    setErrors((prev) => ({ ...prev, [key]: nextErrors[key] }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const validation = validateForm(form);
    setErrors(validation);
    setTouched({
      travelDate: true,
      travelers: true,
      pickupLocation: true,
      name: true,
      email: true,
      whatsapp: true,
    });

    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);

    const vehicle = vehicles.find((v) => v.id === form.vehicleId);
    const destinations = [
      form.pickupLocation.trim(),
      ...destinationNames,
    ].filter(Boolean);

    try {
      const res = await fetch("/api/tour-booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passengerName: form.name.trim(),
          passengerPhone: form.whatsapp.trim(),
          passengerEmail: form.email.trim() || null,
          destinations,
          startDate: form.travelDate,
          numberOfDays: Number(form.durationDays),
          vehicleType: vehicle?.apiValue ?? form.vehicleId,
          passengers: Number(form.travelers),
          specialRequest: form.specialRequests.trim() || null,
        }),
      });

      const data = (await res.json()) as {
        item?: { id: string };
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Unable to submit request");
      }

      setSuccess(true);
      if (data.item?.id) {
        window.setTimeout(() => {
          router.push(`/tour-booking/confirmation/${data.item!.id}`);
        }, 1400);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (field: keyof FormState) =>
    [
      "mt-2 w-full rounded-[14px] border bg-white/90 px-3.5 py-3 text-sm text-ink shadow-[inset_0_1px_0_rgb(255_255_255_/_0.8)] outline-none transition-[border-color,box-shadow]",
      errors[field] && touched[field]
        ? "border-danger/40 focus:border-danger/50 focus:ring-2 focus:ring-danger/15"
        : "border-ink/10 focus:border-brand/35 focus:ring-2 focus:ring-brand/15",
    ].join(" ");
  const labelClass =
    "text-[0.6875rem] font-medium tracking-[0.12em] text-ink/50 uppercase";

  if (success) {
    return (
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`relative overflow-hidden rounded-[1.75rem] tour-detail-card p-10 text-center shadow-[0_24px_60px_rgb(0_98_250_/_0.14)] sm:p-12 ${className}`}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgb(0_98_250_/_0.12),transparent_60%)]"
          aria-hidden
        />
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-paper shadow-[0_14px_32px_rgb(0_98_250_/_0.4)]"
        >
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </motion.div>
        <p className="relative mt-6 font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-ink">
          Request received
        </p>
        <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/60">
          Our travel desk is reviewing your {pkg.title} enquiry. A written
          private-chauffeur quote is on its way.
        </p>
        <p className="relative mt-4 text-xs text-ink/40">
          Redirecting to your confirmation…
        </p>
      </motion.section>
    );
  }

  return (
    <section
      id="book-tour"
      className={`scroll-mt-28 tour-detail-card p-6 shadow-[0_24px_60px_rgb(10_22_32_/_0.08)] backdrop-blur-xl sm:p-8 ${className}`}
    >
      <TourSectionHeader
        eyebrow="Reserve your journey"
        title="Request a private quote"
        lead="Share your travel details — we confirm pacing, vehicle, and a written quote with no obligation."
      />

      <form className="mt-8 grid gap-6" onSubmit={onSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Travel date</span>
            <input
              id={`${baseId}-date`}
              type="date"
              value={form.travelDate}
              onChange={(e) => update("travelDate", e.target.value)}
              onBlur={() => blurField("travelDate")}
              className={inputClass("travelDate")}
            />
            {touched.travelDate && errors.travelDate ? (
              <p className="mt-1.5 text-xs text-danger">{errors.travelDate}</p>
            ) : null}
          </label>
          <label className="block">
            <span className={labelClass}>Number of travelers</span>
            <input
              id={`${baseId}-travelers`}
              type="number"
              min={1}
              max={20}
              value={form.travelers}
              onChange={(e) => update("travelers", e.target.value)}
              onBlur={() => blurField("travelers")}
              className={inputClass("travelers")}
            />
            {touched.travelers && errors.travelers ? (
              <p className="mt-1.5 text-xs text-danger">{errors.travelers}</p>
            ) : null}
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Pickup location</span>
            <input
              id={`${baseId}-pickup`}
              type="text"
              value={form.pickupLocation}
              onChange={(e) => update("pickupLocation", e.target.value)}
              onBlur={() => blurField("pickupLocation")}
              placeholder="Airport, hotel, or address"
              className={inputClass("pickupLocation")}
            />
            {touched.pickupLocation && errors.pickupLocation ? (
              <p className="mt-1.5 text-xs text-danger">{errors.pickupLocation}</p>
            ) : null}
          </label>
          <label className="block">
            <span className={labelClass}>Preferred vehicle</span>
            <select
              id={`${baseId}-vehicle`}
              value={form.vehicleId}
              onChange={(e) => update("vehicleId", e.target.value)}
              className={inputClass("vehicleId")}
            >
              {vehicles.map((v) => (
                <option
                  key={v.id}
                  value={v.id}
                  disabled={!isVehicleSelectable(v.id)}
                >
                  {v.name} · up to {v.passengers} guests
                  {!isVehicleSelectable(v.id) ? " (unavailable)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Tour duration (days)</span>
            <input
              id={`${baseId}-duration`}
              type="number"
              min={1}
              max={30}
              value={form.durationDays}
              onChange={(e) => update("durationDays", e.target.value)}
              className={inputClass("durationDays")}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Special requests</span>
            <textarea
              id={`${baseId}-requests`}
              rows={3}
              value={form.specialRequests}
              onChange={(e) => update("specialRequests", e.target.value)}
              placeholder="Dietary needs, hotel preferences, safari timing, accessibility…"
              className={`${inputClass("specialRequests")} resize-y`}
            />
          </label>
        </div>

        <div className="border-t border-ink/8 pt-6">
          <p className="font-mono text-[0.625rem] tracking-[0.14em] text-ink/40 uppercase">
            Contact details
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={labelClass}>Name</span>
              <input
                id={`${baseId}-name`}
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                onBlur={() => blurField("name")}
                className={inputClass("name")}
              />
              {touched.name && errors.name ? (
                <p className="mt-1.5 text-xs text-danger">{errors.name}</p>
              ) : null}
            </label>
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                id={`${baseId}-email`}
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                onBlur={() => blurField("email")}
                className={inputClass("email")}
              />
              {touched.email && errors.email ? (
                <p className="mt-1.5 text-xs text-danger">{errors.email}</p>
              ) : null}
            </label>
            <label className="block">
              <span className={labelClass}>WhatsApp</span>
              <input
                id={`${baseId}-whatsapp`}
                type="tel"
                autoComplete="tel"
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                onBlur={() => blurField("whatsapp")}
                placeholder="+94 …"
                className={inputClass("whatsapp")}
              />
              {touched.whatsapp && errors.whatsapp ? (
                <p className="mt-1.5 text-xs text-danger">{errors.whatsapp}</p>
              ) : null}
            </label>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="tour-detail-btn tour-detail-btn--primary h-12 w-full gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span>Sending your request…</span>
            </>
          ) : (
            "Request private quote"
          )}
        </button>
      </form>
    </section>
  );
}
