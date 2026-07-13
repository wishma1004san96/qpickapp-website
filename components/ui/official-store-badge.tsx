/**
 * Official-style App Store / Google Play badges for Experience Q Pick.
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
  const isLg = size === "lg";
  const iosBox = isLg ? "h-[52px] w-[156px]" : "h-[40px] w-[120px]";
  const playBox = isLg ? "h-[52px] w-[176px]" : "h-[40px] w-[135px]";

  if (store === "ios") {
    return (
      <span
        role="img"
        aria-label="Download on the App Store — coming soon"
        className={`experience-store-badge inline-block overflow-hidden ${iosBox} ${className}`}
      >
        <svg
          viewBox="0 0 120 40"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
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
      aria-label="Get it on Google Play — coming soon"
      className={`experience-store-badge inline-block overflow-hidden ${playBox} ${className}`}
    >
      <svg
        viewBox="0 0 135 40"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        aria-hidden="true"
      >
        <rect width="135" height="40" rx="6" fill="#000" />
        <path fill="#EA4335" d="M12.2 8.1 24.8 20 12.2 31.9z" />
        <path fill="#FBBC04" d="M12.2 31.9 20.4 27.1 24.8 20z" />
        <path
          fill="#4285F4"
          d="M27.6 17.9 24.8 20l2.8 2.1 4.2-2.4c.6-.35.6-1.05 0-1.4z"
        />
        <path fill="#34A853" d="M12.2 8.1 24.8 20 20.4 12.9z" />
        <text
          x="38"
          y="14.5"
          fill="#fff"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="6.2"
          letterSpacing="0.04em"
        >
          GET IT ON
        </text>
        <text
          x="38"
          y="27"
          fill="#fff"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="12.2"
          fontWeight="600"
        >
          Google Play
        </text>
      </svg>
    </span>
  );
}
