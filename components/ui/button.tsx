import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  HTMLAttributeAnchorTarget,
  MouseEventHandler,
  ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "onDark";
type Size = "md" | "lg";

type CommonProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-paper hover:bg-brand-deep border border-transparent motion-safe:hover:shadow-[var(--shadow-glow-brand)]",
  secondary:
    "bg-paper text-ink border border-mist hover:border-ink/20 hover:bg-foam motion-safe:hover:shadow-[var(--shadow-ambient)]",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-mist/50",
  danger: "bg-danger text-paper border border-transparent hover:opacity-90",
  onDark:
    "bg-paper text-ink border border-transparent hover:bg-foam",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] text-center font-medium whitespace-normal transition-[background-color,border-color,color,transform,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  className = "",
  variant = "primary",
  size = "md",
  onClick,
  target,
  rel,
}: CommonProps & {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      target={target}
      rel={rel}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
