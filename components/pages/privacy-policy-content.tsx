import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { DisplayHeading, UIHeading } from "@/components/ui/typography";
import { siteConfig, whatsappLink } from "@/lib/site";

const tel = (n: string) => `tel:${n.replace(/\s/g, "")}`;

function LegalParagraph({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.9375rem] leading-[1.75] text-ink-muted sm:text-base">
      {children}
    </p>
  );
}

function LegalList({ items }: { items: readonly string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-[0.9375rem] leading-[1.75] text-ink-muted sm:text-base">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <UIHeading as="h2" size="h3" className="text-ink">
        {title}
      </UIHeading>
      {children}
    </section>
  );
}

function LegalSubheading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-base font-medium tracking-tight text-ink sm:text-lg">
      {children}
    </h3>
  );
}

export function PrivacyPolicyContent() {
  const footerPhones = [
    siteConfig.phones.general,
    siteConfig.phones.office,
    siteConfig.phones.mobile,
  ] as const;

  return (
    <div className="bg-foam">
      <div className="border-b border-mist bg-paper pt-28 pb-12 sm:pt-32 sm:pb-14">
        <Container>
          <p className="font-mono text-[0.6875rem] font-medium tracking-[0.18em] text-ink-soft uppercase">
            Legal
          </p>
          <DisplayHeading className="mt-3 max-w-3xl">
            Quick Pick Privacy Policy
          </DisplayHeading>
          <p className="mt-4 text-sm text-ink-soft sm:text-base">
            Last Updated: September 5, 2026
          </p>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        <article className="mx-auto max-w-3xl space-y-10 sm:space-y-12">
          <div className="space-y-4">
            <LegalParagraph>
              Quick Pick (&ldquo;Quick Pick&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
              &ldquo;our&rdquo;) respects your privacy and is committed to protecting your
              personal information.
            </LegalParagraph>
            <LegalParagraph>
              This Privacy Policy explains how we collect, use, store, protect, and share
              information when you use the Quick Pick mobile application, website, and related
              services (collectively, the &ldquo;Service&rdquo;).
            </LegalParagraph>
            <LegalParagraph>
              By using Quick Pick, you agree to the practices described in this Privacy Policy.
            </LegalParagraph>
          </div>

          <LegalSection id="information-we-collect" title="1. Information We Collect">
            <LegalParagraph>
              Depending on how you use Quick Pick, we may collect the following information.
            </LegalParagraph>
            <LegalSubheading>Personal Information:</LegalSubheading>
            <LegalList
              items={[
                "Full name",
                "Phone number",
                "Email address",
                "Profile photo",
                "Account login information",
                "Information provided when creating or updating your account",
              ]}
            />
            <LegalSubheading>Location Information:</LegalSubheading>
            <LegalParagraph>
              Quick Pick may collect precise location information when you use location-based
              features. This may include:
            </LegalParagraph>
            <LegalList
              items={[
                "Current GPS location",
                "Pickup location",
                "Destination location",
                "Trip route and location information",
              ]}
            />
            <LegalParagraph>
              Location information is used to provide and improve ride-booking and transportation
              services, including connecting passengers with drivers, calculating routes, and
              providing accurate pickup and destination information.
            </LegalParagraph>
            <LegalSubheading>Trip Information:</LegalSubheading>
            <LegalParagraph>
              We may collect information relating to your trips, including:
            </LegalParagraph>
            <LegalList
              items={[
                "Pickup and destination locations",
                "Driver and passenger information",
                "Trip date and time",
                "Trip status",
                "Trip history",
                "Cancellation information",
                "Ride-related communications",
              ]}
            />
            <LegalSubheading>Payment Information:</LegalSubheading>
            <LegalParagraph>
              If you make payments through Quick Pick, payment-related information may be processed
              to complete and manage transactions. Where payment services are provided by third-party
              payment providers, your payment information may be processed directly by those
              providers in accordance with their own privacy policies and security practices. Quick
              Pick does not necessarily store complete payment card information on its own systems.
            </LegalParagraph>
            <LegalSubheading>Device and Technical Information:</LegalSubheading>
            <LegalParagraph>
              We may automatically receive certain technical information when you use Quick Pick,
              such as:
            </LegalParagraph>
            <LegalList
              items={[
                "Device type",
                "Operating system",
                "App version",
                "IP address",
                "Device identifiers",
                "Network information",
                "Error and diagnostic information",
              ]}
            />
            <LegalParagraph>
              This information helps us maintain security, troubleshoot problems, and improve the
              Service.
            </LegalParagraph>
            <LegalSubheading>Notifications:</LegalSubheading>
            <LegalParagraph>
              If you enable push notifications, Quick Pick may send notifications relating to:
            </LegalParagraph>
            <LegalList
              items={[
                "Booking confirmations",
                "Driver or passenger updates",
                "Trip status",
                "Account information",
                "Service announcements",
                "Important safety or security information",
              ]}
            />
            <LegalParagraph>
              You can manage notification permissions through your device settings.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="how-we-use" title="2. How We Use Your Information">
            <LegalParagraph>We may use the information we collect to:</LegalParagraph>
            <LegalList
              items={[
                "Create and manage your Quick Pick account",
                "Provide ride-booking and transportation services",
                "Connect passengers and drivers",
                "Process and manage bookings",
                "Provide accurate pickup and destination information",
                "Calculate routes and travel information",
                "Process payments and related transactions",
                "Communicate with you about your trips and account",
                "Provide customer and driver support",
                "Verify accounts and help maintain platform security",
                "Detect, prevent, and investigate fraud, abuse, or unauthorized activity",
                "Improve the performance and functionality of Quick Pick",
                "Analyze service usage and technical issues",
                "Send important service-related notifications",
                "Comply with applicable laws and legal requirements",
              ]}
            />
          </LegalSection>

          <LegalSection id="location-services" title="3. Location Services">
            <LegalParagraph>
              Location information is an important part of Quick Pick&apos;s functionality. Depending
              on your device settings and how you use the Service, Quick Pick may request access to
              your location.
            </LegalParagraph>
            <LegalParagraph>We use location information to:</LegalParagraph>
            <LegalList
              items={[
                "Find or confirm your pickup location",
                "Show nearby drivers",
                "Provide navigation and route information",
                "Share relevant location information between passengers and drivers during a trip",
                "Record trip-related location information where necessary for the Service",
                "Improve the accuracy and reliability of the platform",
              ]}
            />
            <LegalParagraph>
              You may control location permissions through your device settings. However, disabling
              location access may prevent certain Quick Pick features from working correctly.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="google-maps" title="4. Google Maps and Location Services">
            <LegalParagraph>
              Quick Pick may use third-party mapping and location services, including Google Maps or
              related Google services, to provide maps, directions, geolocation, and route-related
              functionality. Your use of mapping features may also be subject to the applicable
              privacy policies and terms of those third-party services.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="sharing" title="5. Sharing of Information">
            <LegalParagraph>
              We may share information when reasonably necessary to provide and operate the Service.
              Relevant information may be shared between passengers and drivers to facilitate a
              booking or trip.
            </LegalParagraph>
            <LegalParagraph>We may also share information with:</LegalParagraph>
            <LegalList
              items={[
                "Payment service providers",
                "Mapping and location service providers",
                "Cloud hosting and infrastructure providers",
                "Analytics and technology service providers",
                "Customer support service providers",
                "Security and fraud-prevention providers",
                "Government authorities or law enforcement when required by law",
              ]}
            />
            <LegalParagraph>
              We do not sell your personal information for money. We only share information with
              third parties when reasonably necessary to provide, maintain, secure, or improve the
              Service, or when required or permitted by applicable law.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="data-security" title="6. Data Security">
            <LegalParagraph>
              We take reasonable technical and organizational measures to protect your information
              against unauthorized access, alteration, disclosure, loss, or misuse. However, no
              internet transmission or electronic storage system can be guaranteed to be completely
              secure. Therefore, while we work to protect your personal information, we cannot
              guarantee absolute security.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="data-retention" title="7. Data Retention">
            <LegalParagraph>
              We retain personal information for as long as reasonably necessary to:
            </LegalParagraph>
            <LegalList
              items={[
                "Provide the Service",
                "Maintain your account",
                "Maintain trip and transaction records",
                "Meet legal and regulatory requirements",
                "Resolve disputes",
                "Prevent fraud and misuse",
                "Enforce our agreements",
                "Maintain security and operational records",
              ]}
            />
            <LegalParagraph>
              When information is no longer required, we may delete, anonymize, or securely dispose
              of it in accordance with applicable requirements.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="privacy-rights" title="8. Your Privacy Rights">
            <LegalParagraph>
              Depending on applicable law, you may have rights regarding your personal information,
              including the right to:
            </LegalParagraph>
            <LegalList
              items={[
                "Request access to information we hold about you",
                "Request correction of inaccurate information",
                "Request deletion of your account or personal information",
                "Request restrictions on certain processing",
                "Withdraw certain permissions, such as location or notifications",
                "Ask questions about how your information is used",
              ]}
            />
            <LegalParagraph>
              Some information may need to be retained where required by law or where necessary for
              legitimate business or security purposes.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="account-deletion" title="9. Account Deletion">
            <LegalParagraph>
              You may request deletion of your Quick Pick account. When an account deletion request
              is received, we will process the request in accordance with applicable laws and our
              data-retention requirements. Certain information may be retained where necessary for
              legal, security, fraud-prevention, dispute-resolution, or accounting purposes.
            </LegalParagraph>
            <LegalParagraph>
              For account deletion assistance, contact:{" "}
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="font-medium text-lagoon hover:text-lagoon-deep"
              >
                {siteConfig.supportEmail}
              </a>
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="children" title="10. Children's Privacy">
            <LegalParagraph>
              Quick Pick is not intended for children who are not legally permitted to use
              ride-booking or transportation services. We do not knowingly collect personal
              information from children where such collection is prohibited by applicable law. If
              you believe that a child has provided personal information to us improperly, please
              contact us so that we can take appropriate action.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="cookies" title="11. Cookies and Similar Technologies">
            <LegalParagraph>
              Our website or certain parts of the Service may use cookies or similar technologies
              to:
            </LegalParagraph>
            <LegalList
              items={[
                "Keep the Service functioning properly",
                "Remember preferences",
                "Improve website performance",
                "Understand how the Service is used",
                "Improve user experience",
                "Maintain security",
              ]}
            />
            <LegalParagraph>
              You may be able to control cookies through your browser settings.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="third-party" title="12. Third-Party Services">
            <LegalParagraph>
              Quick Pick may rely on third-party services to operate certain features of the
              platform. These services may include payment providers, mapping services, cloud
              infrastructure, analytics services, notification services, and other technology
              providers. Third-party services may process information according to their own privacy
              policies. We encourage users to review the privacy policies of third-party services
              when appropriate.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="communications" title="13. Communications">
            <LegalParagraph>
              We may contact you through phone, email, SMS, push notifications, or other
              communication methods regarding:
            </LegalParagraph>
            <LegalList
              items={[
                "Your account",
                "Bookings",
                "Trips",
                "Payments",
                "Security",
                "Customer support",
                "Important changes to the Service",
              ]}
            />
            <LegalParagraph>
              Some communications are necessary to provide the Service and may not be optional.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="changes" title="14. Changes to This Privacy Policy">
            <LegalParagraph>
              We may update this Privacy Policy from time to time. When we make changes, we may
              update the &ldquo;Last Updated&rdquo; date at the top of this Privacy Policy. Where
              appropriate, we may also provide additional notice through the Quick Pick application
              or website. We encourage you to review this Privacy Policy periodically.
            </LegalParagraph>
          </LegalSection>

          <LegalSection id="contact" title="15. Contact Us">
            <LegalParagraph>
              If you have questions, concerns, or requests regarding this Privacy Policy or your
              personal information, please contact us:
            </LegalParagraph>
            <div className="rounded-[1.25rem] border border-mist bg-paper p-5 sm:p-6">
              <p className="text-base font-medium text-ink">{siteConfig.legalName}</p>
              <ul className="mt-3 space-y-2 text-[0.9375rem] leading-relaxed text-ink-muted sm:text-base">
                <li>
                  <span className="font-medium text-ink">Email:</span>{" "}
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="text-lagoon hover:text-lagoon-deep"
                  >
                    {siteConfig.supportEmail}
                  </a>
                </li>
                <li>
                  <span className="font-medium text-ink">Phone:</span>
                  <ul className="mt-1 space-y-0.5">
                    {footerPhones.map((phone) => (
                      <li key={phone}>
                        <a
                          href={tel(phone)}
                          className="text-lagoon hover:text-lagoon-deep"
                        >
                          {phone}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <span className="font-medium text-ink">WhatsApp:</span>{" "}
                  <a
                    href={whatsappLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lagoon hover:text-lagoon-deep"
                  >
                    {siteConfig.phones.whatsapp}
                  </a>
                </li>
                <li>
                  <span className="font-medium text-ink">Address:</span>{" "}
                  {siteConfig.addressLines.map((line) => (
                    <span key={line} className="block sm:inline">
                      {line}{" "}
                    </span>
                  ))}
                </li>
              </ul>
            </div>
          </LegalSection>

          <LegalSection id="acceptance" title="16. Acceptance">
            <LegalParagraph>
              By creating an account or using Quick Pick, you acknowledge that you have read and
              understood this Privacy Policy. If you do not agree with this Privacy Policy, please
              do not use the Quick Pick Service.
            </LegalParagraph>
          </LegalSection>
        </article>
      </Container>
    </div>
  );
}
