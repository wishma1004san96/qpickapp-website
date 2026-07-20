import Link from "next/link";

type BookingCtaProps = {
  headline: string;
  body?: string;
  href: string;
  label: string;
  variant?: "dark" | "light";
  className?: string;
};

export function BookingCta({
  headline,
  body,
  href,
  label,
  variant = "dark",
  className = "",
}: BookingCtaProps) {
  const dark = variant === "dark";

  return (
    <section
      className={`overflow-hidden rounded-[1.75rem] px-6 py-10 text-center sm:px-10 sm:py-14 ${
        dark
          ? "bg-map-void text-foam shadow-[0_24px_60px_rgb(10_22_32_/_0.25)]"
          : "border border-ink/8 bg-white text-ink"
      } ${className}`}
    >
      <h2
        className={`font-display text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-tight ${
          dark ? "text-foam" : "text-ink"
        }`}
      >
        {headline}
      </h2>
      {body ? (
        <p
          className={`mx-auto mt-3 max-w-xl text-sm leading-relaxed sm:text-base ${
            dark ? "text-foam/65" : "text-ink/55"
          }`}
        >
          {body}
        </p>
      ) : null}
      <Link
        href={href}
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] px-8 text-sm font-semibold text-paper shadow-[0_14px_32px_rgb(0_98_250_/_0.4)] transition-[filter,transform] hover:brightness-110 motion-safe:hover:-translate-y-0.5"
      >
        {label}
      </Link>
    </section>
  );
}
