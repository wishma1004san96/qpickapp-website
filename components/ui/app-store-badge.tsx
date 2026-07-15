"use client";

import { useTranslations } from "@/components/i18n/locale-provider";

/**
 * App Store / Google Play badge — optional live href; otherwise Coming soon.
 */
export function AppStoreBadge({
  store,
  className = "",
  href,
  subtitle,
}: {
  store: "ios" | "android";
  className?: string;
  href?: string;
  /** Override the small top label (defaults to Coming soon when no href). */
  subtitle?: string;
}) {
  const t = useTranslations();
  const label =
    store === "ios"
      ? t("storeBadges.downloadOnAppStore")
      : t("storeBadges.getItOnGooglePlay");
  const aria =
    href != null
      ? label
      : store === "ios"
        ? t("storeBadges.iosAria")
        : t("storeBadges.androidAria");
  const topLabel =
    subtitle ??
    (href != null ? t("storeBadges.getItOn") : t("storeBadges.comingSoon"));

  const content = (
    <>
      {store === "ios" ? (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-current"
          aria-hidden="true"
        >
          <path d="M16.4 12.3c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.7-2.8-.7-1.4 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 2-1 2.7-2 .8-1.2 1.2-2.3 1.2-2.4-.1 0-2.2-.9-2.2-3.7zm-2-6.2c.6-.7 1-1.7.9-2.7-0.9.0-1.9.6-2.5 1.3-.6.6-1.1 1.7-.9 2.6 1 .1 1.9-.5 2.5-1.2z" />
        </svg>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logos/google-play.png"
          alt=""
          width={20}
          height={22}
          className="h-5 w-auto shrink-0"
          draggable={false}
        />
      )}
      <span className="flex flex-col items-start leading-tight">
        <span className="font-mono text-[0.6rem] tracking-wider text-foam/60 uppercase">
          {topLabel}
        </span>
        <span className="text-sm font-medium">
          {store === "ios"
            ? t("storeBadges.appStore")
            : t("storeBadges.googlePlay")}
        </span>
      </span>
      <span className="sr-only">{label}</span>
    </>
  );

  const classes = `inline-flex min-h-11 items-center gap-2.5 rounded-[var(--radius-md)] border border-mist bg-ink px-4 text-foam transition-[border-color,background-color,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={aria}
        className={`${classes} hover:border-foam/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright/50`}
      >
        {content}
      </a>
    );
  }

  return (
    <span role="img" aria-label={aria} className={classes}>
      {content}
    </span>
  );
}
