import type { Metadata } from "next";
import { AirportTransferBookingPage } from "@/components/bookings/airport-transfer/airport-transfer-booking-form";

export const metadata: Metadata = {
  title: "Airport Transfer Booking",
  description:
    "Request an airport transfer from Bandaranaike International Airport (CMB). Admin reviews and assigns a driver.",
};

export default function AirportTransferPage() {
  return <AirportTransferBookingPage />;
}
