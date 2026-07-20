"use client";

import Image from "next/image";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { NominatimAutocomplete } from "@/components/marketing/nominatim-autocomplete";
import type { SelectedPlace } from "@/lib/osm/types";
import type { TourDestination } from "@/lib/tours/types";

type StepDestinationsProps = {
  destinations: TourDestination[];
  selected: string[];
  onChange: (names: string[]) => void;
};

export function StepDestinations({
  destinations,
  selected,
  onChange,
}: StepDestinationsProps) {
  const [query, setQuery] = useState("");
  const [customPlace, setCustomPlace] = useState<SelectedPlace | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.keywords.some((k) => k.toLowerCase().includes(q)),
    );
  }, [destinations, query]);

  function toggle(name: string) {
    onChange(
      selected.includes(name)
        ? selected.filter((n) => n !== name)
        : [...selected, name],
    );
  }

  function handleCustomPlace(place: SelectedPlace | null) {
    setCustomPlace(place);
    if (!place) return;
    const label = place.label.trim();
    if (!label) return;
    if (!selected.includes(label)) {
      onChange([...selected, label]);
    }
    setCustomPlace(null);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 1
        </p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Choose destinations
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          Pick curated Sri Lankan stops or search any place on the island to
          build your private chauffeur route.
        </p>
      </header>

      <div className="flex items-center gap-3 rounded-[1.15rem] border border-ink/8 bg-white px-4 py-3">
        <Search className="h-4 w-4 text-brand" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter curated destinations…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink/35"
        />
      </div>

      <div className="rounded-[1.25rem] border border-ink/8 bg-white p-4">
        <NominatimAutocomplete
          label="Search places in Sri Lanka"
          placeholder="Hotels, beaches, towns…"
          selected={customPlace}
          onPlaceChange={handleCustomPlace}
          compact
        />
      </div>

      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {selected.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => toggle(name)}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/8 px-3 py-1.5 text-xs font-semibold text-brand"
              >
                {name}
                <X className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {filtered.map((destination) => {
          const active = selected.includes(destination.name);
          return (
            <button
              key={destination.slug}
              type="button"
              onClick={() => toggle(destination.name)}
              className={`group relative overflow-hidden rounded-[1.15rem] border text-left transition-[border-color,box-shadow] ${
                active
                  ? "border-brand ring-2 ring-brand/25"
                  : "border-ink/8 hover:border-brand/25"
              }`}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={destination.imageSrc}
                  alt={destination.imageAlt}
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-2.5 text-sm font-semibold text-white">
                  {destination.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
