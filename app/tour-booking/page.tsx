import type { Metadata } from "next";
import { TourBookingPage } from "@/components/bookings/tour-booking/tour-booking-form";

export const metadata: Metadata = {
  title: "Tour Booking",
  description:
    "Request a private Sri Lanka tour. Choose destinations, dates, vehicle, and days — admin assigns a driver/guide.",
};

export default function TourBookingRoutePage() {
  return <TourBookingPage />;
}
