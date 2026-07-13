import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { UIHeading, Prose } from "@/components/ui/typography";

export function PartnerDriverSplit() {
  return (
    <Reveal>
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-mist bg-paper p-8 sm:p-10">
            <div>
              <p className="font-mono text-xs tracking-[0.16em] text-lagoon">
                PARTNERS
              </p>
              <UIHeading as="h3" size="h3" className="mt-3">
                Hotels, villas, and corporates
              </UIHeading>
              <Prose className="mt-4">
                Guest transfers under a shared standard — white-glove handoffs your
                front desk can trust.
              </Prose>
            </div>
            <ButtonLink href="/partners" variant="secondary" className="mt-8 w-fit">
              Partner with Q Pick
            </ButtonLink>
          </article>

          <article className="flex flex-col justify-between rounded-[var(--radius-lg)] border border-mist bg-ink p-8 text-foam sm:p-10">
            <div>
              <p className="font-mono text-xs tracking-[0.16em] text-brass">
                DRIVERS
              </p>
              <UIHeading as="h3" size="h3" className="mt-3 text-foam">
                Drive with dignity
              </UIHeading>
              <p className="mt-4 max-w-sm text-foam/70 leading-relaxed">
                Clear earnings, fair dispatch, and tools built for the roads you
                know best.
              </p>
            </div>
            <ButtonLink href="/drive" variant="onDark" className="mt-8 w-fit">
              Become a driver
            </ButtonLink>
          </article>
        </div>
      </Container>
    </Reveal>
  );
}
