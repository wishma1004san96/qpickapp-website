import { notFound } from "next/navigation";
import { BookingConfirmation } from "@/components/bookings/booking-confirmation";
import {
  getRideRequest,
  RIDE_STATUS_LABELS,
  type RideRequestStatus,
} from "@/domains/ride-requests";
import { formatLkr } from "@/lib/taxi-fare-ui";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const item = await getRideRequest(id);
  return {
    title: item
      ? `Ride confirmed · ${item.referenceCode}`
      : "Ride confirmation",
    robots: { index: false, follow: false },
  };
}

export default async function RideConfirmationPage({ params }: Props) {
  const { id } = await params;
  const item = await getRideRequest(id);
  if (!item) notFound();

  const status = item.status as RideRequestStatus;

  return (
    <BookingConfirmation
      title="Your ride request is in."
      subtitle="We searched nearby drivers and updated your Ride Request status in real time."
      referenceCode={item.referenceCode}
      statusLabel={RIDE_STATUS_LABELS[status] ?? status}
      statusHint={
        item.assignedDriverName
          ? `${item.assignedDriverName} · ${item.assignedVehiclePlate ?? ""} · ${item.nearbyDriversFound} nearby driver(s) found.`
          : "We are still working on matching a nearby driver."
      }
      details={[
        { label: "Pickup", value: item.pickupLabel },
        { label: "Destination", value: item.destinationLabel },
        { label: "Vehicle", value: item.vehicleType },
        { label: "Passenger", value: item.passengerName },
        { label: "Phone", value: item.passengerPhone },
        { label: "Payment", value: item.paymentMethod },
        ...(item.estimatedFareLkr != null
          ? [
              {
                label: "Estimated fare",
                value: formatLkr(item.estimatedFareLkr),
              },
            ]
          : []),
        ...(item.assignedDriverPhone
          ? [{ label: "Driver phone", value: item.assignedDriverPhone }]
          : []),
      ]}
      history={item.statusHistory}
      statusLabels={RIDE_STATUS_LABELS}
      primaryHref="/ride"
      primaryLabel="Book another ride"
    />
  );
}
