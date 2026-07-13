import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { UIHeading, Prose } from "@/components/ui/typography";

const proofs = [
  "Verified drivers with identity and vehicle checks",
  "Transparent pricing before you confirm",
  "Live trip sharing for family and hosts",
  "In-trip support and a published emergency line",
  "Insurance coverage on every Q Pick journey",
] as const;

export function SafetyChecklist() {
  return (
    <Reveal>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <UIHeading>A safety standard you can feel</UIHeading>
            <Prose className="mt-4">
              Trust is not a badge on the hero. It is the quiet baseline of every
              ride, transfer, and tour.
            </Prose>
            <Link
              href="/safety"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-lagoon transition-colors hover:text-lagoon-deep"
            >
              Read the safety standard
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </div>

          <ul className="divide-y divide-mist border-y border-mist">
            {proofs.map((item) => (
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
