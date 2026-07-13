"use client";

/**
 * Language switcher stub — Sinhala / Tamil land in Phase 2.
 */
export function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <label htmlFor="lang-switch" className="sr-only">
        Language
      </label>
      <select
        id="lang-switch"
        defaultValue="en"
        disabled
        aria-disabled="true"
        title="Additional languages coming in Phase 2"
        className="min-h-11 rounded-[var(--radius-sm)] border border-mist bg-paper px-2 text-sm text-ink-soft"
      >
        <option value="en">EN</option>
        <option value="si">සිං</option>
        <option value="ta">தமிழ்</option>
      </select>
    </div>
  );
}
