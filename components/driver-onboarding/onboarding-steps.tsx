"use client";

import {
  Checkbox,
  PhoneField,
  SelectField,
  TextField,
  Toggle,
} from "@/components/ui/inputs";
import {
  DRIVER_DOCUMENT_KEYS,
  DRIVER_DOCUMENT_LABELS,
} from "@/domains/driver-applications/documents";
import {
  DRIVER_LANGUAGE_OPTIONS,
  DRIVER_VEHICLE_CATEGORIES,
  SRI_LANKA_DISTRICTS,
} from "@/lib/drivers/constants";
import { DocumentUploadField } from "./document-upload-field";
import { type DriverOnboardingDraft } from "./types";

type StepProps = {
  draft: DriverOnboardingDraft;
  onChange: (patch: Partial<DriverOnboardingDraft>) => void;
  onEmailContinue?: () => void;
  authBusy?: boolean;
  googleConfigured?: boolean;
};

export function StepCreateAccount({
  draft,
  onChange,
  onEmailContinue,
  authBusy,
  googleConfigured = false,
}: StepProps) {
  if (!draft.accountVerified) {
    return (
      <div className="space-y-5">
        <header>
          <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
            Step 1
          </p>
          <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-ink/55">
            Sign in to start your Q Pick driver application. Admin approval is required before you can go online.
          </p>
        </header>

        <a
          href={googleConfigured ? "/api/drivers/auth/google" : undefined}
          aria-disabled={!googleConfigured || authBusy}
          onClick={(e) => {
            if (!googleConfigured || authBusy) e.preventDefault();
          }}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-ink/12 bg-white text-sm font-semibold text-ink shadow-sm transition hover:bg-foam aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </a>
        {!googleConfigured ? (
          <p className="text-xs text-ink/45">
            Google sign-in is not configured in this environment.
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-ink/10" />
          <span className="text-xs font-medium text-ink/40">OR</span>
          <div className="h-px flex-1 bg-ink/10" />
        </div>

        <TextField
          label="Email"
          type="email"
          value={draft.email}
          onChange={(e) => onChange({ email: e.target.value })}
          autoComplete="email"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={draft.password}
          onChange={(e) => onChange({ password: e.target.value })}
          autoComplete="new-password"
          required
        />
        <button
          type="button"
          disabled={authBusy || !draft.email.includes("@") || draft.password.length < 8}
          onClick={onEmailContinue}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-[#2b7dff] to-[#0062fa] text-sm font-semibold text-paper disabled:opacity-40"
        >
          Continue with Email
        </button>
        <p className="text-xs text-ink/45">
          Use the same email and password if you already started an application.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">
          Step 1
        </p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Your contact details
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          Signed in with {draft.authProvider === "google" ? "Google" : "email"}
          {draft.email ? ` (${draft.email})` : ""}. Add your contact number to continue.
        </p>
      </header>

      <TextField
        label="Full Name"
        value={draft.fullName}
        onChange={(e) => onChange({ fullName: e.target.value })}
        autoComplete="name"
        required
      />
      <PhoneField
        label="Mobile Number"
        value={draft.mobile}
        onChange={(e) => onChange({ mobile: e.target.value })}
        required
      />
    </div>
  );
}

export function StepPersonalDetails({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">Step 2</p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Personal details
        </h2>
      </header>

      <DocumentUploadField
        docType="profilePhoto"
        label="Profile Photo"
        value={draft.documents.profilePhoto ?? draft.profilePhotoPath}
        onUploaded={(path) =>
          onChange({ profilePhotoPath: path, documents: { ...draft.documents, profilePhoto: path } })
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Date of Birth"
          type="date"
          value={draft.dateOfBirth}
          onChange={(e) => onChange({ dateOfBirth: e.target.value })}
        />
        <SelectField
          label="Gender"
          value={draft.gender}
          onChange={(e) => onChange({ gender: e.target.value })}
        >
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not">Prefer not to say</option>
        </SelectField>
      </div>
      <TextField label="Address" value={draft.address} onChange={(e) => onChange({ address: e.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="City" value={draft.city} onChange={(e) => onChange({ city: e.target.value })} />
        <SelectField
          label="District"
          value={draft.district}
          onChange={(e) => onChange({ district: e.target.value })}
        >
          <option value="">Select district</option>
          {SRI_LANKA_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </SelectField>
      </div>
      <TextField label="NIC Number" value={draft.nicNumber} onChange={(e) => onChange({ nicNumber: e.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Emergency Contact Name"
          value={draft.emergencyContactName}
          onChange={(e) => onChange({ emergencyContactName: e.target.value })}
        />
        <PhoneField
          label="Emergency Contact Number"
          value={draft.emergencyContactPhone}
          onChange={(e) => onChange({ emergencyContactPhone: e.target.value })}
        />
      </div>
    </div>
  );
}

export function StepDrivingInfo({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">Step 3</p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Driving information
        </h2>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Driving License Number"
          value={draft.licenseNumber}
          onChange={(e) => onChange({ licenseNumber: e.target.value })}
        />
        <TextField
          label="License Expiry Date"
          type="date"
          value={draft.licenseExpiry}
          onChange={(e) => onChange({ licenseExpiry: e.target.value })}
        />
      </div>
      <TextField
        label="Years of Driving Experience"
        type="number"
        min={0}
        value={draft.yearsExperience}
        onChange={(e) => onChange({ yearsExperience: e.target.value })}
      />
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-ink">Languages spoken</legend>
        <div className="flex flex-wrap gap-3">
          {DRIVER_LANGUAGE_OPTIONS.map((lang) => {
            const checked = draft.languagesSpoken.includes(lang.id);
            return (
              <Checkbox
                key={lang.id}
                label={lang.label}
                checked={checked}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...draft.languagesSpoken, lang.id]
                    : draft.languagesSpoken.filter((l) => l !== lang.id);
                  onChange({ languagesSpoken: next });
                }}
              />
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

export function StepVehicleDetails({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">Step 4</p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Vehicle details
        </h2>
      </header>

      <SelectField
        label="Vehicle Category"
        value={draft.vehicleCategory}
        onChange={(e) => onChange({ vehicleCategory: e.target.value })}
      >
        {DRIVER_VEHICLE_CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </SelectField>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Vehicle Make" value={draft.vehicleMake} onChange={(e) => onChange({ vehicleMake: e.target.value })} />
        <TextField label="Vehicle Model" value={draft.vehicleModel} onChange={(e) => onChange({ vehicleModel: e.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Vehicle Year" type="number" value={draft.vehicleYear} onChange={(e) => onChange({ vehicleYear: e.target.value })} />
        <TextField label="Registration Number" value={draft.registrationNumber} onChange={(e) => onChange({ registrationNumber: e.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Vehicle Colour" value={draft.vehicleColour} onChange={(e) => onChange({ vehicleColour: e.target.value })} />
        <TextField label="Passenger Capacity" type="number" min={1} value={draft.passengerCapacity} onChange={(e) => onChange({ passengerCapacity: e.target.value })} />
      </div>
      <TextField label="Luggage Capacity" type="number" min={0} value={draft.luggageCapacity} onChange={(e) => onChange({ luggageCapacity: e.target.value })} />
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <Toggle label="Air Conditioning" checked={draft.airConditioning} onChange={(v) => onChange({ airConditioning: v })} />
          <span className="text-sm text-ink">Air Conditioning</span>
        </div>
        <div className="flex items-center gap-3">
          <Toggle label="Wi-Fi Available" checked={draft.wifiAvailable} onChange={(v) => onChange({ wifiAvailable: v })} />
          <span className="text-sm text-ink">Wi-Fi Available</span>
        </div>
      </div>
    </div>
  );
}

export function StepBankDetails({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">Step 5</p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Bank details
        </h2>
      </header>

      <TextField label="Bank Name" value={draft.bankName} onChange={(e) => onChange({ bankName: e.target.value })} />
      <TextField label="Branch" value={draft.bankBranch} onChange={(e) => onChange({ bankBranch: e.target.value })} />
      <TextField label="Account Holder Name" value={draft.accountHolderName} onChange={(e) => onChange({ accountHolderName: e.target.value })} />
      <TextField label="Account Number" value={draft.accountNumber} onChange={(e) => onChange({ accountNumber: e.target.value })} />
    </div>
  );
}

const UPLOAD_GROUPS: { title: string; keys: (typeof DRIVER_DOCUMENT_KEYS)[number][] }[] = [
  {
    title: "Identity & License",
    keys: ["nicFront", "nicBack", "licenseFront", "licenseBack"],
  },
  {
    title: "Vehicle Documents",
    keys: ["vehicleRegistration", "vehicleInsurance", "revenueLicense"],
  },
  {
    title: "Vehicle Photos",
    keys: ["vehicleFront", "vehicleRear", "vehicleLeft", "vehicleRight", "vehicleInterior"],
  },
];

export function StepDocumentUpload({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">Step 6</p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Document upload
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          Images are compressed automatically before upload. You can replace any file before submitting.
        </p>
      </header>

      {UPLOAD_GROUPS.map((group) => (
        <section key={group.title}>
          <h3 className="mb-3 text-sm font-semibold text-ink">{group.title}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.keys.map((key) => (
              <DocumentUploadField
                key={key}
                docType={key}
                label={DRIVER_DOCUMENT_LABELS[key]}
                value={draft.documents[key]}
                onUploaded={(path) =>
                  onChange({ documents: { ...draft.documents, [key]: path } })
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function StepDeclaration({ draft, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <header>
        <p className="font-mono text-[0.6875rem] tracking-[0.2em] text-brand uppercase">Step 7</p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-semibold text-ink">
          Declaration
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          Review your information and submit for Q Pick admin approval. Drivers cannot go online until approved.
        </p>
      </header>

      <div className="flex flex-col gap-4 rounded-[1.2rem] border border-ink/8 bg-white p-5">
        <Checkbox
          id="driver-declaration"
          label="I confirm all information provided is accurate"
          checked={draft.declarationAccepted}
          onChange={(e) => onChange({ declarationAccepted: e.target.checked })}
          className="items-start"
        />
        <Checkbox
          id="driver-terms"
          label="I agree to the Terms of Service"
          checked={draft.termsAccepted}
          onChange={(e) => onChange({ termsAccepted: e.target.checked })}
          className="items-start"
        />
        <Checkbox
          id="driver-privacy"
          label="I agree to the Privacy Policy"
          checked={draft.privacyAccepted}
          onChange={(e) => onChange({ privacyAccepted: e.target.checked })}
          className="items-start"
        />
      </div>
    </div>
  );
}
