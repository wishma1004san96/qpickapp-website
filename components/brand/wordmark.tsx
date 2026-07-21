import Image from "next/image";
import Link from "next/link";
import { brandAssets } from "@/lib/tokens";

type WordmarkProps = {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg" | "hero";
  tone?: "ink" | "foam";
};

const wordmarkSizes = {
  sm: "text-[0.95rem] font-semibold tracking-[0.14em]",
  md: "text-base font-semibold tracking-[0.16em]",
  lg: "text-lg font-semibold tracking-[0.18em]",
  hero: "text-2xl font-semibold tracking-[0.2em]",
} as const;

/**
 * Editorial wordmark — geometric sans, spaced like the app “PICK” lettering.
 * Used beside the official logo mark; not a replacement for the logo asset.
 */
export function Wordmark({
  className = "",
  href = "/",
  size = "md",
  tone = "ink",
}: WordmarkProps) {
  const color = tone === "foam" ? "text-foam" : "text-ink";
  const content = (
    <span
      className={`font-sans uppercase ${wordmarkSizes[size]} ${color} ${className}`}
    >
      Q&nbsp;Pick
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-baseline" aria-label="Q Pick home">
      {content}
    </Link>
  );
}

type BrandLogoProps = {
  className?: string;
  size?: number;
  priority?: boolean;
  loading?: "lazy" | "eager";
};

/** Official Q Pick app logo mark. */
export function BrandLogo({
  className = "",
  size = 36,
  priority = false,
  loading,
}: BrandLogoProps) {
  return (
    <Image
      src={brandAssets.logo}
      alt=""
      width={size}
      height={size}
      priority={priority}
      loading={priority ? "eager" : loading}
      sizes={`${size}px`}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

type BrandLockupProps = {
  className?: string;
  href?: string;
  tone?: "ink" | "foam";
  logoSize?: number;
  wordmarkSize?: "sm" | "md";
  priority?: boolean;
  showWordmark?: boolean;
};

/** Official logo + optional wordmark for nav / footer. */
export function BrandLockup({
  className = "",
  href = "/",
  tone = "ink",
  logoSize = 36,
  wordmarkSize = "sm",
  priority = false,
  showWordmark = true,
}: BrandLockupProps) {
  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandLogo size={logoSize} priority={priority} />
      {showWordmark ? (
        <Wordmark size={wordmarkSize} tone={tone} href="" />
      ) : null}
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="inline-flex items-center" aria-label="Q Pick home">
      {inner}
    </Link>
  );
}

/** @deprecated Use BrandLogo */
export function LogoMark({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
  tone?: "ink" | "foam" | "lagoon";
}) {
  return <BrandLogo className={className} size={size} />;
}
