import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { brandAssets } from "@/lib/tokens";

type Tone = "brand" | "ink" | "foam";

type QMarkProps = {
  className?: string;
  size?: number;
  /** Kept for API compatibility — official asset has fixed weight */
  weight?: "regular" | "bold";
  priority?: boolean;
};

/**
 * Official Q Pick brand icon (app logo mark).
 * Prefer this over any generic monogram / search-like SVG.
 */
export function QMark({
  className = "",
  size = 16,
  priority = false,
}: QMarkProps) {
  return (
    <Image
      src={brandAssets.logo}
      alt=""
      width={size}
      height={size}
      priority={priority}
      sizes={`${Math.ceil(size * 2)}px`}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

/** @deprecated Alias — use QMark (official asset). */
export function QMarkFilled(props: { className?: string; size?: number }) {
  return <QMark className={props.className} size={props.size} />;
}

type QWatermarkProps = {
  className?: string;
  tone?: Tone;
  /** 0.03–0.06 recommended */
  opacity?: number;
  size?: number;
  /** Soft blur in px */
  blur?: number;
};

/**
 * Large, elegant Q Pick watermark — brand blue, soft blur, behind content.
 */
export function QWatermark({
  className = "",
  tone = "brand",
  opacity = 0.045,
  size = 280,
  blur = 1.5,
}: QWatermarkProps) {
  const tint =
    tone === "foam"
      ? "brightness(1.35) saturate(0.35)"
      : tone === "ink"
        ? "brightness(0.35) saturate(0.6)"
        : "none";

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
        style={{
          opacity,
          filter: `blur(${blur}px) ${tint}`.trim(),
        }}
      >
        {/* Decorative — plain img avoids Next Image layout quirks at huge sizes */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brandAssets.logo}
          alt=""
          width={size}
          height={size}
          draggable={false}
          className="block max-w-none"
          style={{ width: size, height: size }}
        />
      </span>
    </div>
  );
}

type QGlowBadgeProps = {
  className?: string;
  size?: number;
};

/** Small glowing official Q Pick mark in the top-right of premium cards. */
export function QGlowBadge({ className = "", size = 22 }: QGlowBadgeProps) {
  return (
    <span
      className={`pointer-events-none absolute top-3 right-3 z-[2] grid place-items-center overflow-hidden rounded-[0.45rem] shadow-[0_0_0_1px_rgb(255_255_255_/_0.28),0_0_16px_rgb(0_98_250_/_0.42),0_6px_14px_rgb(0_98_250_/_0.28)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <QMark size={size} className="rounded-[0.45rem]" />
    </span>
  );
}

type QPatternBackgroundProps = {
  className?: string;
  /** 0.02–0.04 recommended */
  opacity?: number;
  tone?: Tone;
  cellSize?: number;
};

/**
 * Repeating official Q Pick mark for light sections.
 */
export function QPatternBackground({
  className = "",
  opacity = 0.03,
  cellSize = 72,
}: QPatternBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
      style={
        {
          opacity,
          backgroundImage: `url("${brandAssets.logo}")`,
          backgroundSize: `${cellSize}px ${cellSize}px`,
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        } as CSSProperties
      }
      aria-hidden
    />
  );
}

type QBrandDividerProps = {
  className?: string;
  tone?: Tone;
};

/** Elegant section divider with the official Q Pick mark. */
export function QBrandDivider({
  className = "",
  tone = "brand",
}: QBrandDividerProps) {
  const line =
    tone === "foam"
      ? "bg-foam/20"
      : tone === "ink"
        ? "bg-ink/10"
        : "bg-brand/20";

  return (
    <div
      className={`flex items-center gap-3 py-1 ${className}`}
      role="separator"
      aria-hidden
    >
      <span className={`h-px flex-1 ${line}`} />
      <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-[0.4rem] shadow-[0_0_12px_rgb(0_98_250_/_0.2)]">
        <QMark size={28} className="rounded-[0.4rem]" />
      </span>
      <span className={`h-px flex-1 ${line}`} />
    </div>
  );
}

type QSpinnerProps = {
  className?: string;
  size?: number;
  label?: string;
};

/** Premium animated official Q Pick mark — replaces generic spinners. */
export function QSpinner({
  className = "",
  size = 22,
  label,
}: QSpinnerProps) {
  const mark = Math.max(12, Math.round(size * 0.72));
  return (
    <span
      className={`inline-flex items-center gap-2.5 text-brand ${className}`}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-live={label ? "polite" : undefined}
    >
      <span
        className="q-spinner relative inline-grid place-items-center"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <span className="q-spinner-ring absolute inset-0 rounded-full border border-brand/20" />
        <span className="q-spinner-arc absolute inset-0 rounded-full border-2 border-transparent border-t-brand border-r-brand/40" />
        <span className="q-spinner-mark relative overflow-hidden rounded-[0.3rem]">
          <QMark size={mark} className="rounded-[0.3rem]" />
        </span>
      </span>
      {label ? (
        <span className="text-sm font-medium text-current">{label}</span>
      ) : null}
    </span>
  );
}

type QHeadingMarkProps = {
  children: ReactNode;
  className?: string;
  tone?: Tone;
  markSize?: number;
  as?: "h2" | "h3" | "p" | "span";
};

/** Official Q Pick icon beside a heading — elegant, never dominant. */
export function QHeadingMark({
  children,
  className = "",
  tone = "brand",
  markSize = 18,
  as: Tag = "span",
}: QHeadingMarkProps) {
  return (
    <Tag className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`grid shrink-0 place-items-center overflow-hidden rounded-[0.35rem] shadow-[0_0_0_1px_rgb(0_98_250_/_0.12),0_4px_12px_rgb(0_98_250_/_0.12)] ${
          tone === "foam"
            ? "shadow-[0_0_0_1px_rgb(255_255_255_/_0.2),0_4px_14px_rgb(0_98_250_/_0.28)]"
            : ""
        }`}
        style={{ width: markSize, height: markSize }}
        aria-hidden
      >
        <QMark size={markSize} className="rounded-[0.35rem]" />
      </span>
      {children}
    </Tag>
  );
}
