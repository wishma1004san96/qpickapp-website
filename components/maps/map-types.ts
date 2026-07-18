import type { SelectedPlace } from "@/lib/osm/types";

export type LocationPickerMode = "pickup" | "destination";

export type LocationPickerLabels = {
  title: string;
  hint: string;
  addressLabel: string;
  latitude: string;
  longitude: string;
  confirm: string;
  resolving: string;
  close: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  searching?: string;
  noResults?: string;
  useCurrentLocation?: string;
  locating?: string;
  locationDenied?: string;
  locationUnavailable?: string;
};

export type LocationPickerProps = {
  open: boolean;
  mode: LocationPickerMode;
  initialPlace?: SelectedPlace | null;
  onClose: () => void;
  onConfirm: (place: SelectedPlace) => void;
  labels: LocationPickerLabels;
};

export type FixedCenterMapProps = {
  center: [number, number];
  zoom?: number;
  syncKey: string | number;
  isMoving: boolean;
  variant?: "pickup" | "destination";
  onMoveStart: () => void;
  onMove: () => void;
  onMoveEnd: (center: { lat: number; lng: number }) => void;
  className?: string;
};
