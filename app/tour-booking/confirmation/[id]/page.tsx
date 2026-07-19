import { notFound } from "next/navigation";
import { BookingConfirmation } from "@/components/bookings/booking-confirmation";
import {
  getTourBookingRequest,
  TOUR_STATUS_LABELS,
  type TourBookingStatus,
} from "@/domains/tour-booking-requests";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const item = await getTourBookingRequest(id);
  return {
    title: item
      ? `Tour booking · ${item.referenceCode}`
      : "Tour booking confirmation",
    robots: { index: false, follow: false },
  };
}

export default async function TourBookingConfirmationPage({ params }: Props) {
  const { id } = await params;
  const item = await getTourBookingRequest(id);
  if (!item) notFound();

  const status = item.status as TourBookingStatus;

  return (
    <BookingConfirmation
      title="Tour booking request submitted"
      subtitle="Our team will review your Tour Booking Request and assign a driver/guide. This flow is separate from Ride and Airport Transfer."
      referenceCode={item.referenceCode}
      statusLabel={TOUR_STATUS_LABELS[status] ?? status}
      statusHint="You will hear from us once a guide is assigned and your itinerary is confirmed."
      details={[
        {
          label: "Destinations",
          value: item.destinations.join(" · "),
        },
        {
          label: "Dates",
          value: item.endDate
            ? `${item.startDate} → ${item.endDate}`
            : item.startDate,
        },
        { label: "Days", value: String(item.numberOfDays) },
        { label: "Vehicle", value: item.vehicleType },
        { label: "Travelers", value: String(item.passengers) },
        { label: "Passenger", value: item.passengerName },
        { label: "Phone", value: item.passengerPhone },
        ...(item.assignedGuideName
          ? [{ label: "Assigned guide", value: item.assignedGuideName }]
          : []),
        ...(item.assignedDriverName
          ? [{ label: "Assigned driver", value: item.assignedDriverName }]
          : []),
      ]}
      history={item.statusHistory}
      statusLabels={TOUR_STATUS_LABELS}
      primaryHref="/tour-booking"
      primaryLabel="New tour request"
      secondaryHref="/tours"
      secondaryLabel="Tours overview"
    />
  );
}
