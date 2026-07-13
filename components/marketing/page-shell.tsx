import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DisplayHeading, Prose } from "@/components/ui/typography";

type PageShellProps = {
  title: string;
  description: string;
  children?: ReactNode;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
};

export function PageShell({
  title,
  description,
  children,
  primaryCta,
  secondaryCta,
}: PageShellProps) {
  return (
    <div className="bg-foam">
      <div className="border-b border-mist bg-paper pt-28 pb-14 sm:pt-32 sm:pb-16">
        <Container>
          <DisplayHeading className="max-w-3xl">{title}</DisplayHeading>
          <Prose className="mt-5 max-w-2xl text-base sm:text-lg">{description}</Prose>
          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryCta ? (
                <ButtonLink href={primaryCta.href} size="lg">
                  {primaryCta.label}
                </ButtonLink>
              ) : null}
              {secondaryCta ? (
                <ButtonLink href={secondaryCta.href} variant="secondary" size="lg">
                  {secondaryCta.label}
                </ButtonLink>
              ) : null}
            </div>
          )}
        </Container>
      </div>
      {children ? (
        <Container className="py-14 sm:py-16">{children}</Container>
      ) : null}
    </div>
  );
}
