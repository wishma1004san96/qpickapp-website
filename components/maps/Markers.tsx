"use client";

import L from "leaflet";
import { useMemo } from "react";
import { CircleMarker, Marker, Popup } from "react-leaflet";
import { isValidLatLng } from "@/components/maps/map-coordinates";
import type { SelectedPlace } from "@/lib/osm/types";

const PICKUP_GREEN = "#16a34a";
const DEST_RED = "#dc2626";

/**
 * SVG data-URI pin — avoids DivIcon/Tailwind CSS fights that hide markers.
 */
function createPinIcon(fill: string, letter: string) {
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
      <defs>
        <filter id="s" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#0a1620" flood-opacity="0.4"/>
        </filter>
      </defs>
      <path filter="url(#s)" fill="${fill}" stroke="#ffffff" stroke-width="2.5"
        d="M20 2.5c-8.3 0-15 6.7-15 15 0 11.2 15 31.5 15 31.5S35 28.7 35 17.5c0-8.3-6.7-15-15-15z"/>
      <circle cx="20" cy="17.5" r="9.5" fill="#ffffff"/>
      <text x="20" y="21.5" text-anchor="middle" font-size="13" font-weight="700"
        font-family="system-ui,Segoe UI,sans-serif" fill="${fill}">${letter}</text>
    </svg>
  `.trim());

  return L.icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconRetinaUrl: `data:image/svg+xml,${svg}`,
    iconSize: [40, 52],
    iconAnchor: [20, 52],
    popupAnchor: [0, -44],
    className: "qpick-map-pin-icon",
  });
}

function PlacePopup({
  title,
  place,
}: {
  title: string;
  place: SelectedPlace;
}) {
  return (
    <div className="min-w-[11rem] max-w-[16rem] font-sans text-[0.8125rem] leading-snug text-[#0a1620]">
      <p className="font-semibold tracking-tight">{title}</p>
      <p className="mt-1 text-[#4a5a66]">
        {place.displayName || place.label}
      </p>
      <p className="mt-2 font-mono text-[0.6875rem] text-[#6b7c88]">
        Lat {place.lat.toFixed(6)}
        <br />
        Lng {place.lng.toFixed(6)}
      </p>
    </div>
  );
}

function PlaceMarkers({
  place,
  letter,
  fill,
  title,
  zIndexOffset,
}: {
  place: SelectedPlace;
  letter: string;
  fill: string;
  title: string;
  zIndexOffset: number;
}) {
  const icon = useMemo(() => createPinIcon(fill, letter), [fill, letter]);

  if (!isValidLatLng(place)) return null;

  const position: [number, number] = [place.lat, place.lng];

  return (
    <>
      {/* Always-visible fallback so the stop is never "invisible" */}
      <CircleMarker
        center={position}
        radius={8}
        pathOptions={{
          color: "#ffffff",
          weight: 3,
          fillColor: fill,
          fillOpacity: 1,
          opacity: 1,
        }}
      />
      <Marker
        key={`${letter}-${place.lat}-${place.lng}`}
        position={position}
        icon={icon}
        zIndexOffset={zIndexOffset}
        riseOnHover
      >
        <Popup>
          <PlacePopup title={title} place={place} />
        </Popup>
      </Marker>
    </>
  );
}

export function PickupMarker({ place }: { place: SelectedPlace }) {
  return (
    <PlaceMarkers
      place={place}
      letter="A"
      fill={PICKUP_GREEN}
      title="A · Pickup"
      zIndexOffset={1000}
    />
  );
}

export function DestinationMarker({ place }: { place: SelectedPlace }) {
  return (
    <PlaceMarkers
      place={place}
      letter="B"
      fill={DEST_RED}
      title="B · Destination"
      zIndexOffset={1100}
    />
  );
}
