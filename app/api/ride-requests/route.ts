import {
  createRideRequest,
  listRideRequests,
} from "@/domains/ride-requests";
import { jsonError } from "@/lib/bookings/shared";

export async function GET() {
  const items = await listRideRequests();
  return Response.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const passengerName = String(body.passengerName ?? "").trim();
    const passengerPhone = String(body.passengerPhone ?? "").trim();
    const paymentMethod = String(body.paymentMethod ?? "").trim();
    const pickupLabel = String(body.pickupLabel ?? "").trim();
    const destinationLabel = String(body.destinationLabel ?? "").trim();
    const vehicleType = String(body.vehicleType ?? "").trim();
    const pickupLat = Number(body.pickupLat);
    const pickupLng = Number(body.pickupLng);
    const destinationLat = Number(body.destinationLat);
    const destinationLng = Number(body.destinationLng);

    if (!passengerName) return jsonError("Passenger name is required");
    if (!passengerPhone) return jsonError("Phone is required");
    if (!paymentMethod) return jsonError("Payment method is required");
    if (!pickupLabel || Number.isNaN(pickupLat) || Number.isNaN(pickupLng)) {
      return jsonError("Valid pickup is required");
    }
    if (
      !destinationLabel ||
      Number.isNaN(destinationLat) ||
      Number.isNaN(destinationLng)
    ) {
      return jsonError("Valid destination is required");
    }
    if (!vehicleType) return jsonError("Vehicle type is required");

    const item = await createRideRequest({
      passengerName,
      passengerPhone,
      paymentMethod,
      pickupLabel,
      pickupLat,
      pickupLng,
      destinationLabel,
      destinationLat,
      destinationLng,
      vehicleType,
      scheduledAt: body.scheduledAt ? String(body.scheduledAt) : null,
      isAirportPickup: Boolean(body.isAirportPickup),
      passengerCount: body.passengerCount
        ? Number(body.passengerCount)
        : 1,
      luggageCount: body.luggageCount ? Number(body.luggageCount) : 0,
      notes: body.notes ? String(body.notes) : null,
      estimatedFareLkr:
        body.estimatedFareLkr != null ? Number(body.estimatedFareLkr) : null,
      estimatedDistanceKm:
        body.estimatedDistanceKm != null
          ? Number(body.estimatedDistanceKm)
          : null,
      estimatedDurationMin:
        body.estimatedDurationMin != null
          ? Number(body.estimatedDurationMin)
          : null,
    });

    return Response.json({ item }, { status: 201 });
  } catch (err) {
    console.error("[ride-requests] POST", err);
    return jsonError("Failed to create ride request", 500);
  }
}
