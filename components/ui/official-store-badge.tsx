"use client";

import { useTranslations } from "@/components/i18n/locale-provider";

/**
 * Official-style App Store / Google Play badges for Experience Q Pick.
 * Both stores share identical outer dimensions (matched SVG viewBoxes).
 */
export function OfficialStoreBadge({
  store,
  size = "md",
  fit = "fixed",
  href,
  className = "",
}: {
  store: "ios" | "android";
  size?: "md" | "lg";
  /** fixed = legacy box; natural = height-driven width (3:1 badge ratio) */
  fit?: "fixed" | "natural";
  href?: string;
  className?: string;
}) {
  const t = useTranslations();
  const isLg = size === "lg";
  const isNatural = fit === "natural";
  const box = isNatural
    ? "h-[2.625rem] w-auto"
    : isLg
      ? "h-14 w-[170px]"
      : "h-10 w-[130px]";
  const svgClass = isNatural ? "block h-full w-auto" : "block h-full w-full";
  const aria =
    store === "ios" ? t("storeBadges.iosAria") : t("storeBadges.androidAria");

  const shellClass = `experience-store-badge${store === "android" ? " experience-store-badge--android" : ""} inline-block shrink-0 overflow-hidden rounded-[6px] ${box} ${className}`;

  const iosBadge = (
    <span role="img" aria-label={aria} className={shellClass}>
      <svg
        viewBox="0 0 120 40"
        xmlns="http://www.w3.org/2000/svg"
        className={svgClass}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <rect width="120" height="40" rx="6" fill="#000" />
        <path
          fill="#fff"
          d="M24.5 20.3c0-1.75 1.43-2.58 1.5-2.63-.82-1.2-2.1-1.36-2.55-1.38-1.08-.11-2.12.64-2.67.64-.55 0-1.41-.62-2.32-.61-1.19.02-2.29.7-2.9 1.77-1.24 2.15-.32 5.33.89 7.07.59.85 1.3 1.8 2.23 1.77.89-.04 1.23-.58 2.31-.58 1.07 0 1.38.58 2.33.56.96-.02 1.57-.86 2.16-1.72.68-.99 0.96-1.95 0.98-2-.02 0-1.9-.73-1.9-2.89zm-1.79-5.29c.49-.6.83-1.42.73-2.25-.71.03-1.57.48-2.08 1.07-.46.53-.86 1.38-.75 2.19.79.06 1.6-.4 2.1-1.01z"
        />
        <text
          x="36"
          y="14.5"
          fill="#fff"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="6.2"
          letterSpacing="0.02em"
        >
          Download on the
        </text>
        <text
          x="36"
          y="27"
          fill="#fff"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="12.5"
          fontWeight="600"
        >
          App Store
        </text>
      </svg>
    </span>
  );

  const androidBadge = (
    <span role="img" aria-label={aria} className={shellClass}>
      <svg
        viewBox="0 0 120 40"
        xmlns="http://www.w3.org/2000/svg"
        className={svgClass}
        preserveAspectRatio="xMidYMid meet"
        shapeRendering="geometricPrecision"
        textRendering="optimizeLegibility"
        aria-hidden="true"
      >
        <rect width="120" height="40" rx="6" fill="#000" />
        <image
          href="/logos/google-play-icon.png"
          x="9"
          y="8"
          width="24"
          height="24"
          preserveAspectRatio="xMidYMid meet"
        />
        <text
          x="40"
          y="14.5"
          fill="#fff"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="6.2"
          fontWeight="500"
          letterSpacing="0.06em"
        >
          GET IT ON
        </text>
        <text
          x="40"
          y="27"
          fill="#fff"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="12.5"
          fontWeight="600"
        >
          Google Play
        </text>
      </svg>
    </span>
  );

  const badge = store === "ios" ? iosBadge : androidBadge;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={aria}
        className={`inline-flex shrink-0 items-center justify-center transition-opacity duration-[var(--duration-ui)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111b] ${className}`}
      >
        {badge}
      </a>
    );
  }

  return badge;
}
