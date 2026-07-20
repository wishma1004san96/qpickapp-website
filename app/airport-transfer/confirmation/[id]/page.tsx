import { notFound } from "next/navigation";
import { AirportTransferSuccess } from "@/components/bookings/airport-transfer/airport-transfer-success";
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
      ? `Transfer confirmed · ${item.referenceCode}`
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
    <AirportTransferSuccess
      referenceCode={item.referenceCode}
      statusLabel={AIRPORT_STATUS_LABELS[status] ?? status}
      statusHint="Admin will review your request. Driver assignment status updates here once a chauffeur is confirmed."
      details={[
        { label: "Pickup", value: item.pickupLabel },
        { label: "Destination", value: item.destinationLabel },
        {
          label: "Arrival",
          value: `${item.transferDate} · ${item.transferTime}`,
        },
        { label: "Vehicle", value: item.vehicleType },
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
    />
  );
}
