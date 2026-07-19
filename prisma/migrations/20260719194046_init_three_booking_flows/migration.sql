-- CreateTable
CREATE TABLE "ride_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "passengerName" TEXT NOT NULL,
    "passengerPhone" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "pickupLabel" TEXT NOT NULL,
    "pickupLat" REAL NOT NULL,
    "pickupLng" REAL NOT NULL,
    "destinationLabel" TEXT NOT NULL,
    "destinationLat" REAL NOT NULL,
    "destinationLng" REAL NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "scheduledAt" DATETIME,
    "isAirportPickup" BOOLEAN NOT NULL DEFAULT false,
    "passengerCount" INTEGER NOT NULL DEFAULT 1,
    "luggageCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "estimatedFareLkr" REAL,
    "estimatedDistanceKm" REAL,
    "estimatedDurationMin" REAL,
    "nearbyDriversFound" INTEGER NOT NULL DEFAULT 0,
    "assignedDriverName" TEXT,
    "assignedDriverPhone" TEXT,
    "assignedVehiclePlate" TEXT,
    "statusHistory" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "airport_transfer_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "passengerName" TEXT NOT NULL,
    "passengerPhone" TEXT NOT NULL,
    "passengerEmail" TEXT,
    "nationality" TEXT,
    "pickupLabel" TEXT NOT NULL DEFAULT 'Bandaranaike International Airport (CMB)',
    "pickupCode" TEXT NOT NULL DEFAULT 'CMB',
    "destinationLabel" TEXT NOT NULL,
    "destinationCode" TEXT,
    "officialFareLkr" REAL,
    "transferDate" TEXT NOT NULL,
    "transferTime" TEXT NOT NULL,
    "passengers" INTEGER NOT NULL DEFAULT 1,
    "luggage" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "specialRequest" TEXT,
    "assignedDriverName" TEXT,
    "assignedDriverPhone" TEXT,
    "adminNotes" TEXT,
    "statusHistory" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tour_booking_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "passengerName" TEXT NOT NULL,
    "passengerPhone" TEXT NOT NULL,
    "passengerEmail" TEXT,
    "destinations" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "numberOfDays" INTEGER NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "passengers" INTEGER NOT NULL DEFAULT 2,
    "specialRequest" TEXT,
    "assignedGuideName" TEXT,
    "assignedGuidePhone" TEXT,
    "assignedDriverName" TEXT,
    "assignedDriverPhone" TEXT,
    "adminNotes" TEXT,
    "statusHistory" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ride_requests_referenceCode_key" ON "ride_requests"("referenceCode");

-- CreateIndex
CREATE INDEX "ride_requests_status_idx" ON "ride_requests"("status");

-- CreateIndex
CREATE INDEX "ride_requests_createdAt_idx" ON "ride_requests"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "airport_transfer_requests_referenceCode_key" ON "airport_transfer_requests"("referenceCode");

-- CreateIndex
CREATE INDEX "airport_transfer_requests_status_idx" ON "airport_transfer_requests"("status");

-- CreateIndex
CREATE INDEX "airport_transfer_requests_createdAt_idx" ON "airport_transfer_requests"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tour_booking_requests_referenceCode_key" ON "tour_booking_requests"("referenceCode");

-- CreateIndex
CREATE INDEX "tour_booking_requests_status_idx" ON "tour_booking_requests"("status");

-- CreateIndex
CREATE INDEX "tour_booking_requests_createdAt_idx" ON "tour_booking_requests"("createdAt");
