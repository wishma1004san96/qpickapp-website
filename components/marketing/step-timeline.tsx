import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { UIHeading, Prose } from "@/components/ui/typography";

const steps = [
  {
    n: "01",
    title: "Request",
    body: "Set pickup, destination, and timing. See the fare before you commit.",
  },
  {
    n: "02",
    title: "Match",
    body: "A verified Q Pick driver is assigned — rated, insured, and trip-ready.",
  },
  {
    n: "03",
    title: "Arrive",
    body: "Live ETA, trip sharing, and a calm handoff at the door or gate.",
  },
] as const;

export function StepTimeline() {
  return (
    <Reveal>
      <Container>
        <div className="mb-12 max-w-xl">
          <UIHeading>How certainty works</UIHeading>
          <Prose className="mt-4">
            Three quiet steps between where you are and where you need to be.
          </Prose>
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
