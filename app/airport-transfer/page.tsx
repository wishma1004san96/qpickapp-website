import type { Metadata } from "next";
import { AirportTransferExperience } from "@/components/bookings/airport-transfer/airport-transfer-experience";

export const metadata: Metadata = {
  title: "Airport Chauffeur · Book Transfer",
  description:
    "Book a premium private transfer from Bandaranaike International Airport (CMB). Guided luxury booking — destination, vehicle, flight, and chauffeur request.",
};

export default function AirportTransferPage() {
  return <AirportTransferExperience />;
}
