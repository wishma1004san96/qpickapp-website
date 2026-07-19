"use client";

import { useTranslations } from "@/components/i18n/locale-provider";

/**
 * Official-style App Store / Google Play badges for Experience Q Pick.
 * Both stores share identical outer dimensions (matched SVG viewBoxes).
 */
export function OfficialStoreBadge({
  store,
  size = "md",
  className = "",
}: {
  store: "ios" | "android";
  size?: "md" | "lg";
  className?: string;
}) {
  const t = useTranslations();
  const isLg = size === "lg";
  const box = isLg ? "h-14 w-[170px]" : "h-10 w-[130px]";
  const aria =
    store === "ios" ? t("storeBadges.iosAria") : t("storeBadges.androidAria");

  if (store === "ios") {
    return (
      <span
        role="img"
        aria-label={aria}
        className={`experience-store-badge inline-block shrink-0 overflow-hidden rounded-[6px] ${box} ${className}`}
      >
        <svg
          viewBox="0 0 120 40"
          xmlns="http://www.w3.org/2000/svg"
          className="block h-full w-full"
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
  }

  return (
    <span
      role="img"
      aria-label={aria}
      className={`experience-store-badge inline-block shrink-0 overflow-hidden rounded-[6px] ${box} ${className}`}
    >
      <svg
        viewBox="0 0 120 40"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <rect width="120" height="40" rx="6" fill="#000" />
        {/* Google Play triangle mark */}
        <path
          d="M16.2 8.4c-.35-.2-.8-.22-1.18-.04-.38.18-.62.55-.62.97v21.34c0 .42.24.79.62.97.38.18.83.16 1.18-.04l18.4-10.67c.32-.19.52-.53.52-.91s-.2-.72-.52-.91L16.2 8.4z"
          fill="#fff"
        />
        <path
          d="M16.2 8.4c-.18-.1-.38-.15-.58-.15l11.85 11.85 7.15-4.15L16.2 8.4z"
          fill="#fff"
          opacity="0.9"
        />
        <path
          d="M27.47 20.1 15.62 31.95c.2 0 .4-.05.58-.15l18.4-10.67c.1-.06.18-.14.25-.23l-7.38-1z"
          fill="#fff"
          opacity="0.75"
        />
        <text
          x="40"
          y="14.5"
          fill="#fff"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="6.2"
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
}
