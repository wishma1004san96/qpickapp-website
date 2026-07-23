import type { ReactNode } from "react";

type ContactInfoRowProps = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
};

/**
 * Footer contact row — fixed icon column, label above value.
 * Mobile-first; keeps rows aligned at every breakpoint.
 */
export function ContactInfoRow({ icon, label, children }: ContactInfoRowProps) {
  return (
    <div className="site-footer-contact-row grid w-full min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-start gap-x-3 sm:grid-cols-[3rem_minmax(0,1fr)]">
      <div
        className="flex size-12 shrink-0 items-center justify-center text-[0.85rem] leading-none"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0 pt-0.5 text-left">
        <p className="text-[0.625rem] font-medium tracking-[0.12em] text-foam/50 uppercase">
          {label}
        </p>
        <div className="mt-0.5 min-w-0">{children}</div>
      </div>
    </div>
  );
}
