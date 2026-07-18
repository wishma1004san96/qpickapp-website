"use client";

import { Check } from "lucide-react";
import type { SVGProps } from "react";
import {
  QPICK_VEHICLE_ICON_LABELS,
  resolveVehicleIconId,
  type QPickVehicleIconId,
} from "./types";
import { VEHICLE_GLYPHS } from "./vehicle-glyphs";
import "./vehicle-icon.css";

export type VehicleIconProps = {
  /** Icon pack ID or fare/catalog vehicle ID (e.g. miniCar → mini). */
  id: QPickVehicleIconId | string;
  size?: number | string;
  /** Blue stroke + selected chrome when true. */
  selected?: boolean;
  /** Soft glow / border tile wrapper. Default true when selected. */
  framed?: boolean;
  /** Checkmark badge — default follows selected. */
  showCheck?: boolean;
  className?: string;
  title?: string;
} & Omit<SVGProps<SVGSVGElement>, "id" | "width" | "height" | "color">;

/**
 * Q Pick vehicle icon — monochrome side-profile family.
 * Use across website, passenger app, driver app, and admin.
 */
export function VehicleIcon({
  id,
  size = 40,
  selected = false,
  framed,
  showCheck,
  className = "",
  title,
  ...svgProps
}: VehicleIconProps) {
  const iconId = resolveVehicleIconId(id) ?? (id as QPickVehicleIconId);
  const Glyph = VEHICLE_GLYPHS[iconId];
  if (!Glyph) return null;

  const label = title ?? QPICK_VEHICLE_ICON_LABELS[iconId];
  const useFrame = framed ?? selected;
  const useCheck = showCheck ?? selected;
  const dim =
    typeof size === "number" ? { width: size, height: size * (56 / 128) } : {};

  const glyph = (
    <Glyph
      title={label}
      width={typeof size === "number" ? size : size}
      height={typeof size === "number" ? size * (56 / 128) : undefined}
      className={`qpick-vehicle-glyph ${selected ? "qpick-vehicle-glyph--selected" : ""} ${!useFrame ? className : ""}`}
      style={
        typeof size === "string"
          ? { width: size, height: "auto" }
          : undefined
      }
      {...dim}
      {...svgProps}
    />
  );

  if (!useFrame) return glyph;

  return (
    <span
      className={`qpick-vehicle-icon-frame ${selected ? "qpick-vehicle-icon-frame--selected" : ""} ${className}`}
      data-vehicle-icon={iconId}
      data-selected={selected ? "true" : "false"}
    >
      {glyph}
      {useCheck ? (
        <span className="qpick-vehicle-icon-check" aria-hidden>
          <Check strokeWidth={3} className="h-[55%] w-[55%]" />
        </span>
      ) : null}
    </span>
  );
}

/** Compact tile for carousels / grids — always framed. */
export function VehicleIconTile({
  id,
  selected = false,
  size = 56,
  className = "",
  label,
}: {
  id: QPickVehicleIconId | string;
  selected?: boolean;
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <VehicleIcon
      id={id}
      size={size}
      selected={selected}
      framed
      showCheck={selected}
      title={label}
      className={className}
    />
  );
}
