/*
  Warnings:

  - You are about to drop the `itineraries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "itineraries";

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "countries" TEXT[],
    "totalCost" DOUBLE PRECISION NOT NULL,
    "itinerarymongoid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Itinerary_itinerarymongoid_key" ON "Itinerary"("itinerarymongoid");
