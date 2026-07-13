import { Reveal } from "@/components/motion/reveal";
import { AppStoreBadge } from "@/components/ui/app-store-badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/typography";

export function FinalCta() {
  return (
    <Reveal>
      <div className="border-t border-mist bg-paper py-16 sm:py-24">
        <Container className="text-center">
          <p className="font-display text-3xl tracking-tight text-ink">Q&nbsp;Pick</p>
          <p className="mt-6 font-display text-h2 text-ink">Open Q Pick</p>
          <Prose className="mx-auto mt-4">
            Airport, city, and island journeys — under one trusted standard.
          </Prose>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/airport" size="lg">
              Begin your journey
            </ButtonLink>
            <ButtonLink href="/tours" variant="secondary" size="lg">
              Discover the island
            </ButtonLink>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <AppStoreBadge store="ios" />
            <AppStoreBadge store="android" />
          </div>
        </Container>
      </div>
    </Reveal>
  );
}
