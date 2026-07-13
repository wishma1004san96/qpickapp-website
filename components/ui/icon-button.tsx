import type { ButtonHTMLAttributes, ReactNode } from "react";

export function IconButton({
  children,
  label,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] border border-mist bg-paper text-ink transition-[background-color,border-color] duration-[var(--duration-ui)] hover:border-ink/20 hover:bg-foam disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
