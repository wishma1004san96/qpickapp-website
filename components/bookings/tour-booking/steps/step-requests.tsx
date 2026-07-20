"use client";

type StepRequestsProps = {
  value: string;
  onChange: (value: string) => void;
};

export function StepRequests({ value, onChange }: StepRequestsProps) {
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 6
        </p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Special requests
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          Dietary needs, celebrations, accessibility, or must-see stops.
        </p>
      </header>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder="Tell us anything that will help craft your itinerary…"
        className="w-full rounded-[1.15rem] border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-brand/35 focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}
