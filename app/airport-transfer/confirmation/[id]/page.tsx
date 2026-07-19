import { notFound } from "next/navigation";
import { BookingConfirmation } from "@/components/bookings/booking-confirmation";
import {
  getAirportTransferRequest,
  AIRPORT_STATUS_LABELS,
  type AirportTransferStatus,
} from "@/domains/airport-transfer-requests";
import { formatAirportFare } from "@/lib/airport-rates";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const item = await getAirportTransferRequest(id);
  return {
    title: item
      ? `Airport transfer · ${item.referenceCode}`
      : "Airport transfer confirmation",
    robots: { index: false, follow: false },
  };
}

export default async function AirportTransferConfirmationPage({
  params,
}: Props) {
  const { id } = await params;
  const item = await getAirportTransferRequest(id);
  if (!item) notFound();

  const status = item.status as AirportTransferStatus;

  return (
    <BookingConfirmation
      title="Airport transfer request submitted"
      subtitle="Our team will review your Airport Transfer Request and assign a driver. This is not a Taxi Ride booking."
      referenceCode={item.referenceCode}
      statusLabel={AIRPORT_STATUS_LABELS[status] ?? status}
      statusHint="You will receive confirmation once an admin assigns a driver."
      details={[
        { label: "Pickup", value: item.pickupLabel },
        { label: "Destination", value: item.destinationLabel },
        {
          label: "Schedule",
          value: `${item.transferDate} · ${item.transferTime}`,
        },
        { label: "Vehicle", value: item.vehicleType },
        { label: "Passengers", value: String(item.passengers) },
        { label: "Luggage", value: item.luggage },
        { label: "Passenger", value: item.passengerName },
        { label: "Phone", value: item.passengerPhone },
        ...(item.officialFareLkr != null
          ? [
              {
                label: "Official fare",
                value: formatAirportFare(item.officialFareLkr),
              },
            ]
          : []),
        ...(item.assignedDriverName
          ? [{ label: "Assigned driver", value: item.assignedDriverName }]
          : []),
      ]}
      history={item.statusHistory}
      statusLabels={AIRPORT_STATUS_LABELS}
      primaryHref="/airport-transfer"
      primaryLabel="New airport transfer"
      secondaryHref="/airport"
      secondaryLabel="Airport rates"
    />
  );
}
