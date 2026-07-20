"use client";

type StepContactTourProps = {
  name: string;
  phone: string;
  email: string;
  passengers: number;
  onChange: (patch: {
    passengerName?: string;
    passengerPhone?: string;
    passengerEmail?: string;
    passengers?: number;
  }) => void;
};

export function StepContactTour({
  name,
  phone,
  email,
  passengers,
  onChange,
}: StepContactTourProps) {
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 8
        </p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Submit your request
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          Share your details so we can confirm the itinerary outline and send a
          written private-chauffeur quote.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium tracking-wide text-ink/50 uppercase">
            Full name
          </span>
          <input
            value={name}
            onChange={(e) => onChange({ passengerName: e.target.value })}
            autoComplete="name"
            required
            className="mt-2 w-full rounded-[14px] border border-ink/10 bg-white px-3.5 py-3 text-sm outline-none focus:border-brand/35 focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium tracking-wide text-ink/50 uppercase">
            Phone / WhatsApp
          </span>
          <input
            value={phone}
            onChange={(e) => onChange({ passengerPhone: e.target.value })}
            autoComplete="tel"
            required
            className="mt-2 w-full rounded-[14px] border border-ink/10 bg-white px-3.5 py-3 text-sm outline-none focus:border-brand/35 focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium tracking-wide text-ink/50 uppercase">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => onChange({ passengerEmail: e.target.value })}
            autoComplete="email"
            className="mt-2 w-full rounded-[14px] border border-ink/10 bg-white px-3.5 py-3 text-sm outline-none focus:border-brand/35 focus:ring-2 focus:ring-brand/20"
          />
        </label>
        <p className="sm:col-span-2 text-xs text-ink/45">
          Traveller count is set to {passengers} from the vehicle step — adjust
          there if needed before submitting.
        </p>
      </div>
    </div>
  );
}
