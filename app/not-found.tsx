import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DisplayHeading, Prose } from "@/components/ui/typography";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center bg-foam py-28">
      <Container>
        <p className="font-mono text-xs tracking-[0.18em] text-lagoon">404</p>
        <DisplayHeading className="mt-4">Page not found</DisplayHeading>
        <Prose className="mt-4">
          The route you requested is not part of the Q Pick map — yet.
        </Prose>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">Back home</ButtonLink>
          <ButtonLink href="/support" variant="secondary">
            Support
          </ButtonLink>
        </div>
        <p className="mt-10 text-sm text-ink-soft">
          Or continue to{" "}
          <Link href="/ride" className="text-lagoon hover:text-lagoon-deep">
            Ride
          </Link>
          ,{" "}
          <Link href="/airport" className="text-lagoon hover:text-lagoon-deep">
            Airport
          </Link>
          , or{" "}
          <Link href="/tours" className="text-lagoon hover:text-lagoon-deep">
            Tours
          </Link>
          .
        </p>
      </Container>
    </div>
  );
}
