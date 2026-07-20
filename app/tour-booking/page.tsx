import type { Metadata } from "next";
import { TourBookingExperience } from "@/components/bookings/tour-booking/tour-booking-experience";

export const metadata: Metadata = {
  title: "Plan Your Private Sri Lanka Tour | Q Pick",
  description:
    "Build a custom private chauffeur itinerary across Sri Lanka — destinations, dates, vehicle, and preferences. Submit a tour request online.",
  alternates: {
    canonical: "/tour-booking",
  },
};

export default function TourBookingRoutePage() {
  return <TourBookingExperience />;
}
