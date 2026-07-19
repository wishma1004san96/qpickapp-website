import { createAirportTransferRequest } from "@/domains/airport-transfer-requests";
import { jsonError } from "@/lib/bookings/shared";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const passengerName = String(body.passengerName ?? "").trim();
    const passengerPhone = String(body.passengerPhone ?? "").trim();
    const destinationLabel = String(body.destinationLabel ?? "").trim();
    const transferDate = String(body.transferDate ?? "").trim();
    const transferTime = String(body.transferTime ?? "").trim();
    const luggage = String(body.luggage ?? "").trim();
    const vehicleType = String(body.vehicleType ?? "").trim();

    if (!passengerName) return jsonError("Passenger name is required");
    if (!passengerPhone) return jsonError("Phone is required");
    if (!destinationLabel) return jsonError("Destination is required");
    if (!transferDate || !transferTime) {
      return jsonError("Transfer date and time are required");
    }
    if (!luggage) return jsonError("Luggage size is required");
    if (!vehicleType) return jsonError("Vehicle type is required");

    const item = await createAirportTransferRequest({
      passengerName,
      passengerPhone,
      passengerEmail: body.passengerEmail
        ? String(body.passengerEmail)
        : null,
      nationality: body.nationality ? String(body.nationality) : null,
      destinationLabel,
      destinationCode: body.destinationCode
        ? String(body.destinationCode)
        : null,
      officialFareLkr:
        body.officialFareLkr != null ? Number(body.officialFareLkr) : null,
      transferDate,
      transferTime,
      passengers: body.passengers ? Number(body.passengers) : 1,
      luggage,
      vehicleType,
      specialRequest: body.specialRequest
        ? String(body.specialRequest)
        : null,
    });

    return Response.json({ item }, { status: 201 });
  } catch (err) {
    console.error("[airport-transfer-requests] POST", err);
    return jsonError("Failed to create airport transfer request", 500);
  }
}
