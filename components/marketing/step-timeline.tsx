"use client";

import {
  useMessages,
  useTranslations,
} from "@/components/i18n/locale-provider";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { UIHeading, Prose } from "@/components/ui/typography";

const STEP_KEYS = ["request", "match", "arrive"] as const;

export function StepTimeline() {
  const t = useTranslations();
  const { stepTimeline } = useMessages();
  const steps = STEP_KEYS.map((key) => stepTimeline.steps[key]);

  return (
    <Reveal>
      <Container>
        <div className="mb-12 max-w-xl">
          <UIHeading>{t("stepTimeline.heading")}</UIHeading>
          <Prose className="mt-4">{t("stepTimeline.intro")}</Prose>
        </div>

        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <li key={step.n} className="relative">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-[4.5rem] top-5 hidden h-px w-[calc(100%-2rem)] bg-mist md:block"
                />
              ) : null}
              <p className="font-mono text-xs tracking-[0.18em] text-lagoon">
                {step.n}
              </p>
              <h3 className="mt-3 text-xl font-medium text-ink">{step.title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Reveal>
  );
}
