"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Car,
  ChevronDown,
  CreditCard,
  Headphones,
  MapPin,
  Navigation,
  Shield,
  UserCircle,
  UserX,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { DisplayHeading, UIHeading } from "@/components/ui/typography";
import { siteConfig, whatsappLink } from "@/lib/site";

const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;

const EASE = [0.22, 1, 0.36, 1] as const;

const SUPPORT_CATEGORIES = [
  {
    id: "customer",
    title: "Customer Support",
    description:
      "Help with booking rides, finding drivers, trip information, and general customer questions.",
    icon: Headphones,
  },
  {
    id: "driver",
    title: "Driver Support",
    description:
      "Help with driver accounts, accepting trips, trip status, earnings, and driver-related issues.",
    icon: Car,
  },
  {
    id: "account",
    title: "Account & Login",
    description:
      "Help with creating an account, logging in, phone number, email, password, and account settings.",
    icon: UserCircle,
  },
  {
    id: "booking",
    title: "Booking & Trip Issues",
    description:
      "Help with booking problems, pickup locations, destination changes, trip status, cancellations, and completed trips.",
    icon: MapPin,
  },
  {
    id: "payment",
    title: "Payment Issues",
    description:
      "Help with payment problems, payment status, charges, and transaction-related questions.",
    icon: CreditCard,
  },
  {
    id: "location",
    title: "Location & GPS",
    description:
      "Help with GPS, pickup location, destination location, maps, and location permissions.",
    icon: Navigation,
  },
  {
    id: "cancellation",
    title: "Cancellation",
    description:
      "Information and help regarding ride cancellations and cancellation-related issues.",
    icon: XCircle,
  },
  {
    id: "safety",
    title: "Safety",
    description:
      "Contact Quick Pick regarding safety concerns or urgent ride-related issues. Our team is available to assist with safety matters promptly.",
    icon: Shield,
    highlight: true,
  },
  {
    id: "deletion",
    title: "Account Deletion",
    description:
      "Contact support to request deletion of your Quick Pick account and personal information, subject to applicable legal and retention requirements.",
    icon: UserX,
  },
] as const;

const FAQ_ITEMS = [
  {
    id: "book",
    question: "How do I book a ride?",
    answer:
      "Open Quick Pick, enter your pickup and destination locations, review the available ride information, and confirm your booking.",
  },
  {
    id: "cancel",
    question: "How do I cancel a ride?",
    answer:
      "Open your active booking and use the cancellation option available in the app. Cancellation conditions may apply.",
  },
  {
    id: "location",
    question: "Why is my location not accurate?",
    answer:
      "Make sure GPS/location services are enabled on your device and that Quick Pick has permission to access your location.",
  },
  {
    id: "payment",
    question: "I have a payment problem. What should I do?",
    answer:
      "Contact Quick Pick Support with your booking or transaction details so our support team can assist you.",
  },
  {
    id: "delete",
    question: "How can I delete my account?",
    answer:
      "Contact Quick Pick Support and request account deletion. We may need to verify your account before processing the request.",
  },
  {
    id: "contact",
    question: "How can I contact Quick Pick Support?",
    answer: "Contact us using the support email provided below.",
  },
] as const;

function SupportFaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <article
      className={`overflow-hidden rounded-[1.25rem] border bg-paper shadow-[0_8px_24px_rgb(10_22_32_/_0.05)] transition-[border-color,box-shadow] duration-300 sm:rounded-[1.35rem] ${
        open ? "border-brand/25 shadow-[0_12px_32px_rgb(0_98_250_/_0.08)]" : "border-mist"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <span className="text-base font-medium leading-snug text-ink sm:text-[1.0625rem]">
          {question}
        </span>
        <ChevronDown
          className={`mt-0.5 size-5 shrink-0 text-brand transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.32, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="border-t border-mist/80 px-5 pt-3 pb-4 text-[0.9375rem] leading-[1.7] text-ink-muted sm:px-6 sm:pb-5 sm:text-base">
              {answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

export function SupportPageContent() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);
  const footerPhones = [
    siteConfig.phones.general,
    siteConfig.phones.office,
    siteConfig.phones.mobile,
  ] as const;

  return (
    <div className="support-page-v2 bg-foam">
      {/* Hero */}
      <section
        className="relative isolate overflow-hidden border-b border-ink/5 pt-[6.5rem] pb-12 sm:pt-[7.25rem] sm:pb-14"
        aria-labelledby="support-hero-heading"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_18%_-8%,rgb(37_99_235_/_0.14)_0%,transparent_58%),radial-gradient(ellipse_75%_55%_at_88%_4%,rgb(0_98_250_/_0.1)_0%,transparent_52%),linear-gradient(180deg,#fafcff_0%,#f3f6f7_100%)]"
        />
        <Container className="relative z-[1]">
          <p className="font-mono text-[0.6875rem] font-medium tracking-[0.18em] text-brand uppercase">
            Support
          </p>
          <DisplayHeading className="mt-3 max-w-2xl">How can we help?</DisplayHeading>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Get help with your Quick Pick account, bookings, trips, payments, and other issues.
          </p>
        </Container>
      </section>

      {/* Categories */}
      <section className="py-12 sm:py-16" aria-labelledby="support-categories-heading">
        <Container>
          <UIHeading className="text-ink">Support topics</UIHeading>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
            Browse common support areas below. Contact our team if you need direct assistance.
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {SUPPORT_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const highlighted = "highlight" in category && category.highlight;

              return (
                <li key={category.id}>
                  <article
                    className={`flex h-full flex-col rounded-[1.25rem] border p-5 shadow-[0_8px_24px_rgb(10_22_32_/_0.05)] transition-[border-color,box-shadow,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:-translate-y-0.5 sm:rounded-[1.35rem] sm:p-6 ${
                      highlighted
                        ? "border-brand/30 bg-[linear-gradient(165deg,#ffffff_0%,#f0f7ff_100%)] shadow-[0_12px_32px_rgb(0_98_250_/_0.1)]"
                        : "border-mist bg-paper hover:border-brand/20 hover:shadow-[0_12px_28px_rgb(10_22_32_/_0.08)]"
                    }`}
                  >
                    <div
                      className={`inline-flex size-11 items-center justify-center rounded-xl ${
                        highlighted ? "bg-brand/12 text-brand" : "bg-foam text-brand"
                      }`}
                    >
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <h3 className="mt-4 text-base font-medium tracking-tight text-ink sm:text-lg">
                      {category.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted sm:text-[0.9375rem]">
                      {category.description}
                    </p>
                  </article>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* FAQ */}
      <section
        className="border-t border-mist bg-paper py-12 sm:py-16"
        aria-labelledby="support-faq-heading"
      >
        <Container>
          <UIHeading className="text-ink">Frequently asked questions</UIHeading>
          <div className="mt-8 flex flex-col gap-3 sm:gap-3.5">
            {FAQ_ITEMS.map((item) => (
              <SupportFaqItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                open={openFaqId === item.id}
                onToggle={() =>
                  setOpenFaqId((current) => (current === item.id ? null : item.id))
                }
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Contact */}
      <section className="py-12 sm:py-16" aria-labelledby="support-contact-heading">
        <Container>
          <div className="mx-auto max-w-2xl rounded-[1.5rem] border border-mist bg-paper p-6 text-center shadow-[0_12px_36px_rgb(10_22_32_/_0.06)] sm:p-8">
            <UIHeading className="text-ink">Still need help?</UIHeading>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
              Our support team is here to help. Contact us with details about your issue and include
              your booking information when relevant.
            </p>
            <dl className="mt-6 space-y-4 text-left sm:mx-auto sm:max-w-md">
              <div className="rounded-xl border border-mist bg-foam px-4 py-3.5">
                <dt className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                  Support Email
                </dt>
                <dd className="mt-1 text-base font-medium text-ink">
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="text-lagoon hover:text-lagoon-deep"
                  >
                    {siteConfig.supportEmail}
                  </a>
                </dd>
              </div>
              <div className="rounded-xl border border-mist bg-foam px-4 py-3.5">
                <dt className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                  Support Phone
                </dt>
                <dd className="mt-1 space-y-0.5 text-base font-medium text-ink">
                  {footerPhones.map((phone) => (
                    <a
                      key={phone}
                      href={tel(phone)}
                      className="block text-lagoon hover:text-lagoon-deep"
                    >
                      {phone}
                    </a>
                  ))}
                </dd>
              </div>
              <div className="rounded-xl border border-mist bg-foam px-4 py-3.5">
                <dt className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                  WhatsApp
                </dt>
                <dd className="mt-1 text-base font-medium text-ink">
                  <a
                    href={whatsappLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lagoon hover:text-lagoon-deep"
                  >
                    {siteConfig.phones.whatsapp}
                  </a>
                </dd>
              </div>
              <div className="rounded-xl border border-mist bg-foam px-4 py-3.5">
                <dt className="text-xs font-medium tracking-wide text-ink-soft uppercase">
                  Address
                </dt>
                <dd className="mt-1 text-base font-medium leading-snug text-ink">
                  {siteConfig.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>
    </div>
  );
}
