/**
 * Q Pick vehicle glyphs v6 — premium automotive silhouettes.
 *
 * Balanced Uber/Bolt proportions:
 * readable height, larger wheels, flat roofs, sharp glass, distinct profiles.
 *
 * viewBox 0 0 128 56 · front left · rocker ≈37 · wheel y=45
 */

import type { ReactElement, ReactNode, SVGProps } from "react";
import type { QPickVehicleIconId } from "./types";

export const VEHICLE_ICON_VIEWBOX = "0 0 128 56";
export const VEHICLE_ICON_STROKE = 0;

type GlyphProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

function GlyphShell({
  title,
  children,
  ...props
}: GlyphProps & { children: ReactNode }) {
  return (
    <svg
      viewBox={VEHICLE_ICON_VIEWBOX}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

function Wheel({
  cx,
  cy = 45,
  r = 6.8,
}: {
  cx: number;
  cy?: number;
  r?: number;
}) {
  const hub = Math.max(1.7, r * 0.32);
  return (
    <path
      fillRule="evenodd"
      d={`M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z M ${cx} ${cy - hub} A ${hub} ${hub} 0 1 0 ${cx} ${cy + hub} A ${hub} ${hub} 0 1 0 ${cx} ${cy - hub} Z`}
    />
  );
}

function Body({ d, windows }: { d: string; windows?: string[] }) {
  if (!windows?.length) return <path d={d} />;
  return <path fillRule="evenodd" d={[d, ...windows].join("")} />;
}

/** 1. Bike */
export function BikeGlyph(props: GlyphProps) {
  return (
    <GlyphShell title={props.title ?? "Bike"} {...props}>
      <path d="M40 20 34.5 14h-7.5v-1.5H37l7 7.2 3.4 14.8-2.4 1z" />
      <path d="M46 37.5h17l2.2-3h11l2 3h7l-1.6-4.2H69l-2.2-3.2H56l-2 3.2H48z" />
      <path d="M65 30.5h10l1.4 1.8H66.2z" />
      <Wheel cx={40} r={5.8} />
      <Wheel cx={84} r={5.8} />
    </GlyphShell>
  );
}

/** 2. Tuk — Bajaj RE */
export function TukGlyph(props: GlyphProps) {
  return (
    <GlyphShell title={props.title ?? "Tuk"} {...props}>
      <path d="M54 23h27l-3-7.5H60z" />
      <Body
        d="M54 23 H81 V37.5 H54 Z"
        windows={["M59 25.5 H76.5 V34 H59 Z"]}
      />
      <path d="M54 26 41 22.5 32 16.5 26.5 23 28.5 30 32 37.5 H54 Z" />
      <path d="M32 16.5 25.5 11.5h-6v-1.4H28.5l6.2 5z" />
      <path d="M79 15.8 V37.5 H83.5 V18.5 Z" />
      <Wheel cx={30} r={5.4} />
      <Wheel cx={75} r={6.4} />
    </GlyphShell>
  );
}

/** 3. Mini — compact hatch */
export function MiniGlyph(props: GlyphProps) {
  return (
    <GlyphShell title={props.title ?? "Mini"} {...props}>
      <Body
        d="M28 37.5 H98 L94 32 H88 L78 19 H54 L44 32 H32 L28 37.5 Z"
        windows={["M50 26 L58 21 H72 L80 26.5 L77 28.5 L71 24 H59 L52.5 28 Z"]}
      />
      <Wheel cx={44} r={6.6} />
      <Wheel cx={88} r={6.6} />
    </GlyphShell>
  );
}

/** 4. Flex — wagon / crossover */
export function FlexGlyph(props: GlyphProps) {
  return (
    <GlyphShell title={props.title ?? "Flex"} {...props}>
      <Body
        d="M24 37.5 H106 L102 31.5 H96 L86 17.5 H52 L40 31.5 H28 L24 37.5 Z"
        windows={[
          "M48 25 L57 19.5 H80 L90 25.5 L87 27.5 L79 22.5 H58 L50.5 27 Z",
          "M64 20 V27 H68 V20.4 Z",
        ]}
      />
      <path d="M56 15.8 h24 v1.2 H56 z" />
      <Wheel cx={42} r={6.7} />
      <Wheel cx={94} r={6.7} />
    </GlyphShell>
  );
}

/** 5. Sedan — three-box */
export function SedanGlyph(props: GlyphProps) {
  return (
    <GlyphShell title={props.title ?? "Sedan"} {...props}>
      <Body
        d="M22 37.5 H110 L106 32 H100 L98 29 H88 L80 18.5 H54 L44 29 H34 L30 32 H24 L22 37.5 Z"
        windows={["M52 25.5 L60 20 H74 L82 25.5 L79 27.5 L72 23 H61 L54.5 27 Z"]}
      />
      <Wheel cx={42} r={6.6} />
      <Wheel cx={98} r={6.6} />
    </GlyphShell>
  );
}

/** 6. Minivan */
export function MinivanGlyph(props: GlyphProps) {
  return (
    <GlyphShell title={props.title ?? "Minivan"} {...props}>
      <Body
        d="M24 37.5 H106 L102 30 H96 L88 15.5 H50 L38 30 H28 L24 37.5 Z"
        windows={[
          "M46 24 L55 17.5 H82 L92 24.5 L89 27 L81 21 H56 L48.5 26.5 Z",
          "M64 18 V26 H68.5 V18.5 Z",
        ]}
      />
      <Wheel cx={42} r={6.6} />
      <Wheel cx={98} r={6.6} />
    </GlyphShell>
  );
}

/** 7. FR Van — Hiace */
export function FrVanGlyph(props: GlyphProps) {
  return (
    <GlyphShell title={props.title ?? "FR Van"} {...props}>
      <Body
        d="M22 37.5 H108 V24 L102 13 H52 L40 16 L30 24 L26 31 L22 37.5 Z"
        windows={[
          "M36 24 L46 15 H52 V25.5 L38 26.5 Z",
          "M58 14.5 H72 V24.5 H58 Z",
          "M78 14.5 H98 V24.5 H78 Z",
        ]}
      />
      <Wheel cx={44} r={6.7} />
      <Wheel cx={100} r={6.7} />
    </GlyphShell>
  );
}

/** 8. SUV */
export function SuvGlyph(props: GlyphProps) {
  return (
    <GlyphShell title={props.title ?? "SUV"} {...props}>
      <Body
        d="M24 37.5 H104 L100 30 H94 L86 16 H54 L42 30 H30 L26 33 L24 37.5 Z"
        windows={[
          "M50 24.5 L59 18.5 H78 L88 25 L85 27 L77 21.5 H60 L52.5 26.5 Z",
          "M66 19 V26.5 H70 V19.5 Z",
        ]}
      />
      <path d="M32 34.2 h66 v1.3 H32 z" opacity={0.4} />
      <Wheel cx={42} r={7.2} />
      <Wheel cx={96} r={7.2} />
    </GlyphShell>
  );
}

/** 9. Mini Bus */
export function MiniBusGlyph(props: GlyphProps) {
  return (
    <GlyphShell title={props.title ?? "Mini Bus"} {...props}>
      <Body
        d="M20 37.5 H110 V22.5 L102 11.5 H50 L36 15 L28 22.5 L24 31 L20 37.5 Z"
        windows={[
          "M34 22.5 L44 14 H52 V24 L36 25 Z",
          "M58 13 H68 V23.5 H58 Z",
          "M72 13 H82 V23.5 H72 Z",
          "M86 13 H100 V23.5 H86 Z",
        ]}
      />
      <Wheel cx={40} r={6.7} />
      <Wheel cx={100} r={6.7} />
    </GlyphShell>
  );
}

/** 10. Bus */
export function BusGlyph(props: GlyphProps) {
  return (
    <GlyphShell title={props.title ?? "Bus"} {...props}>
      <Body
        d="M16 37.5 H114 V21 L106 10.5 H46 L32 14.5 L24 21 L20 31 L16 37.5 Z"
        windows={[
          "M30 21.5 L40 13 H48 V23.5 L32 24.5 Z",
          "M54 12 H62 V22.5 H54 Z",
          "M66 12 H74 V22.5 H66 Z",
          "M78 12 H86 V22.5 H78 Z",
          "M90 12 H104 V22.5 H90 Z",
        ]}
      />
      <path d="M54 24 v11 h1.5 V24 z" opacity={0.45} />
      <Wheel cx={38} r={6.8} />
      <Wheel cx={104} r={6.8} />
    </GlyphShell>
  );
}

export const VEHICLE_GLYPHS: Record<
  QPickVehicleIconId,
  (props: GlyphProps) => ReactElement
> = {
  bike: BikeGlyph,
  tuk: TukGlyph,
  mini: MiniGlyph,
  flex: FlexGlyph,
  sedan: SedanGlyph,
  minivan: MinivanGlyph,
  frVan: FrVanGlyph,
  suv: SuvGlyph,
  miniBus: MiniBusGlyph,
  bus: BusGlyph,
};
