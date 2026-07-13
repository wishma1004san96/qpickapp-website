import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { FormField } from "@/components/ui/form-field";

const controlClass =
  "min-h-11 w-full rounded-[var(--radius-md)] border border-mist bg-paper px-3.5 text-ink outline-none transition-[border-color] duration-[var(--duration-ui)] placeholder:text-ink-soft focus:border-lagoon disabled:opacity-50";

export function TextField({
  label,
  hint,
  error,
  id,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  const fieldId = id ?? "text-field";
  return (
    <FormField label={label} htmlFor={fieldId} hint={hint} error={error}>
      <input id={fieldId} className={`${controlClass} ${className}`} {...props} />
    </FormField>
  );
}

export function PhoneField({
  label = "Phone",
  hint,
  error,
  id = "phone",
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <FormField label={label} htmlFor={id} hint={hint} error={error}>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+94 7X XXX XXXX"
        className={`${controlClass} font-mono ${className}`}
        {...props}
      />
    </FormField>
  );
}

export function SelectField({
  label,
  hint,
  error,
  id,
  children,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const fieldId = id ?? "select-field";
  return (
    <FormField label={label} htmlFor={fieldId} hint={hint} error={error}>
      <select id={fieldId} className={`${controlClass} ${className}`} {...props}>
        {children}
      </select>
    </FormField>
  );
}

export function DateTimePicker({
  label,
  hint,
  error,
  id = "datetime",
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  return (
    <FormField label={label} htmlFor={id} hint={hint} error={error}>
      <input
        id={id}
        type="datetime-local"
        className={`${controlClass} font-mono ${className}`}
        {...props}
      />
    </FormField>
  );
}

export function PlaceAutocomplete({
  label,
  hint,
  error,
  id = "place",
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  return (
    <FormField
      label={label}
      htmlFor={id}
      hint={hint ?? "Maps autocomplete connects in Phase 2"}
      error={error}
    >
      <input
        id={id}
        type="text"
        autoComplete="street-address"
        placeholder="Enter a place in Sri Lanka"
        className={`${controlClass} ${className}`}
        {...props}
      />
    </FormField>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  id = "toggle",
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition-colors duration-[var(--duration-ui)] ${
        checked ? "bg-lagoon" : "bg-mist"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-paper transition-transform duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function Checkbox({
  label,
  id,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const fieldId = id ?? "checkbox";
  return (
    <label htmlFor={fieldId} className={`inline-flex items-center gap-3 text-sm text-ink ${className}`}>
      <input
        id={fieldId}
        type="checkbox"
        className="h-5 w-5 rounded border-mist text-lagoon focus:ring-lagoon"
        {...props}
      />
      {label}
    </label>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-[var(--radius-md)] border border-mist bg-paper p-1">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.value)}
            className={`min-h-9 rounded-[var(--radius-sm)] px-3 text-sm font-medium transition-colors duration-[var(--duration-ui)] ${
              selected ? "bg-lagoon text-paper" : "text-ink-muted hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
