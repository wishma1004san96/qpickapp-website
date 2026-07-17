"use client";

import { useTranslations } from "@/components/i18n/locale-provider";

/**
 * Official-style App Store / Google Play badges for Experience Q Pick.
 * Badge artwork stays English brand style; aria labels come from messages.
 * iOS + Android share identical outer dimensions.
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
  // Matched boxes — same width & height for both stores
  const box = isLg ? "h-14 w-[170px]" : "h-10 w-[130px]";
  const aria =
    store === "ios" ? t("storeBadges.iosAria") : t("storeBadges.androidAria");

  if (store === "ios") {
    return (
      <span
        role="img"
        aria-label={aria}
        className={`experience-store-badge inline-block overflow-hidden rounded-[6px] ${box} ${className}`}
      >
        <svg
          viewBox="0 0 120 40"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
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
      className={`experience-store-badge inline-flex items-center justify-center gap-2 overflow-hidden bg-black px-3 ${box} ${className}`}
      style={{ borderRadius: 6 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/google-play.png"
        alt=""
        width={22}
        height={24}
        className={isLg ? "h-7 w-auto shrink-0" : "h-5 w-auto shrink-0"}
        draggable={false}
      />
      <span className="flex min-w-0 flex-col items-start leading-none text-white">
        <span
          className={
            isLg
              ? "text-[8px] tracking-[0.06em] text-white/90"
              : "text-[6.5px] tracking-[0.06em] text-white/90"
          }
        >
          GET IT ON
        </span>
        <span
          className={
            isLg
              ? "mt-0.5 text-[16px] font-semibold tracking-tight"
              : "mt-0.5 text-[12.5px] font-semibold tracking-tight"
          }
        >
          Google Play
        </span>
      </span>
    </span>
  );
}
