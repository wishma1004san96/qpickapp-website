import { createTourBookingRequest } from "@/domains/tour-booking-requests";
import { jsonError } from "@/lib/bookings/shared";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const passengerName = String(body.passengerName ?? "").trim();
    const passengerPhone = String(body.passengerPhone ?? "").trim();
    const startDate = String(body.startDate ?? "").trim();
    const vehicleType = String(body.vehicleType ?? "").trim();
    const numberOfDays = Number(body.numberOfDays);
    const destinationsRaw = body.destinations;

    const destinations = Array.isArray(destinationsRaw)
      ? destinationsRaw.map((d) => String(d).trim()).filter(Boolean)
      : typeof destinationsRaw === "string"
        ? destinationsRaw
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean)
        : [];

    if (!passengerName) return jsonError("Passenger name is required");
    if (!passengerPhone) return jsonError("Phone is required");
    if (destinations.length === 0) {
      return jsonError("At least one destination is required");
    }
    if (!startDate) return jsonError("Start date is required");
    if (!vehicleType) return jsonError("Vehicle type is required");
    if (!Number.isFinite(numberOfDays) || numberOfDays < 1) {
      return jsonError("Number of days must be at least 1");
    }

    const item = await createTourBookingRequest({
      passengerName,
      passengerPhone,
      passengerEmail: body.passengerEmail
        ? String(body.passengerEmail)
        : null,
      destinations,
      startDate,
      endDate: body.endDate ? String(body.endDate) : null,
      numberOfDays,
      vehicleType,
      passengers: body.passengers ? Number(body.passengers) : 2,
      specialRequest: body.specialRequest
        ? String(body.specialRequest)
        : null,
    });

    return Response.json({ item }, { status: 201 });
  } catch (err) {
    console.error("[tour-booking-requests] POST", err);
    return jsonError("Failed to create tour booking request", 500);
  }
}
