"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import { UIHeading, Prose } from "@/components/ui/typography";

export function SafetyChecklist() {
  const t = useTranslations();
  const { safety } = useMessages();

  return (
    <Reveal>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <UIHeading>{t("safety.heading")}</UIHeading>
            <Prose className="mt-4">{t("safety.intro")}</Prose>
            <Link
              href="/safety"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-lagoon transition-colors hover:text-lagoon-deep"
            >
              {t("safety.cta")}
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </div>

          <ul className="divide-y divide-mist border-y border-mist">
            {safety.proofs.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 py-4 text-sm leading-relaxed text-ink sm:text-base"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lagoon"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Reveal>
  );
}
